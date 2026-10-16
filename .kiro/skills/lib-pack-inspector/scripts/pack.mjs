/**
 * pack.mjs — Núcleo compartido: resolver rango, traer tarball y parsearlo en memoria.
 *
 * Reglas invariantes (no negociables, ver references/PRIVATE-REGISTRY.md):
 *  - Nunca se pasa --registry. npm resuelve registry y auth vía .npmrc/env.
 *  - Nunca se escribe un archivo a disco. Todo vive en Buffers y en un Map.
 *  - Nunca se imprime un token.
 */

import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

/** Ejecuta npm y devuelve stdout. Lanza Error con stderr saneado si falla. */
function npm(args) {
  try {
    return execFileSync("npm", args, {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const raw = (err.stderr || err.message || "").toString();
    throw new Error(`npm ${args.join(" ")} falló: ${maskSecrets(raw).trim().split("\n").slice(0, 4).join(" | ")}`);
  }
}

/** Enmascara tokens y credenciales antes de que cualquier texto salga del script. */
export function maskSecrets(text) {
  return String(text)
    .replace(/(_authToken\s*=\s*)\S+/gi, "$1***")
    .replace(/(_auth\s*=\s*)\S+/gi, "$1***")
    .replace(/(npm_)[A-Za-z0-9]{10,}/g, "$1***")
    .replace(/(Bearer\s+)\S+/gi, "$1***")
    .replace(/(\/\/[^\s:]+:)[^@\s]+(@)/g, "$1***$2");
}

/** URL del registry activo, solo para documentar. Nunca se inyecta en comandos. */
export function getRegistry() {
  try {
    return npm(["config", "get", "registry"]).trim();
  } catch {
    return "desconocido";
  }
}

/** Separa "@scope/name@^1.0.0" en { name, range }. Rango por defecto: latest. */
export function parseSpec(spec) {
  const at = spec.lastIndexOf("@");
  if (at <= 0) return { name: spec, range: "latest" };
  return { name: spec.slice(0, at), range: spec.slice(at + 1) || "latest" };
}

/** Rango -> versión resuelta + metadatos de distribución. */
export function resolveVersion(name, range) {
  const out = npm(["view", `${name}@${range}`, "version", "dist.tarball", "dist.shasum", "dist.integrity", "--json"]);
  let data = JSON.parse(out);
  // Un rango amplio puede devolver un array: nos quedamos con la mayor (max satisfying).
  if (Array.isArray(data)) {
    if (data.length === 0) throw new Error(`el rango "${range}" no resuelve a ninguna versión de ${name}`);
    data = data[data.length - 1];
  }
  if (!data || !data.version) throw new Error(`respuesta de npm view sin versión para ${name}@${range}`);
  return {
    version: data.version,
    tarball: data["dist.tarball"] ?? data.dist?.tarball,
    shasum: data["dist.shasum"] ?? data.dist?.shasum,
    integrity: data["dist.integrity"] ?? data.dist?.integrity ?? null,
  };
}

/** Descarga el tarball a memoria. Devuelve el .tgz crudo. */
export async function fetchTarball(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch del tarball devolvió HTTP ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Parser tar completo en memoria.
 *
 * Cubre lo que un parser ingenuo de solo 100 bytes de `name` rompe:
 *  - campo `prefix` de ustar (rutas de hasta 255 chars)
 *  - GNU longname / longlink (typeflag 'L' y 'K')
 *  - cabeceras extendidas PAX (typeflag 'x' y 'g') con registro `path=`
 * Sin esto, los paquetes con rutas profundas pierden archivos en silencio y el
 * reporte inventa gaps de tipo "declarado en exports pero ausente del tarball".
 */
export function parseTar(buffer) {
  const files = new Map();
  let offset = 0;
  let pendingLongName = null;
  let pendingPaxPath = null;
  let globalPaxPath = null;

  const str = (buf) => buf.toString("utf8").replace(/\0.*$/s, "").trim();

  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);

    // Dos bloques de ceros consecutivos marcan el fin del archivo.
    if (header.every((b) => b === 0)) break;

    const name = str(header.subarray(0, 100));
    const sizeField = str(header.subarray(124, 136));
    const size = parseInt(sizeField, 8) || 0;
    const typeflag = String.fromCharCode(header[156] || 0).trim() || "0";
    const magic = str(header.subarray(257, 263));
    const prefix = magic.startsWith("ustar") ? str(header.subarray(345, 500)) : "";

    offset += 512;
    const data = buffer.subarray(offset, offset + size);
    offset += Math.ceil(size / 512) * 512;

    if (typeflag === "L" || typeflag === "K") {
      // GNU: el nombre real viene en el contenido de este bloque.
      if (typeflag === "L") pendingLongName = str(data);
      continue;
    }

    if (typeflag === "x" || typeflag === "g") {
      const path = parsePaxPath(data.toString("utf8"));
      if (typeflag === "x") pendingPaxPath = path;
      else globalPaxPath = path;
      continue;
    }

    let fullPath = pendingLongName ?? pendingPaxPath ?? globalPaxPath ?? (prefix ? `${prefix}/${name}` : name);
    pendingLongName = null;
    pendingPaxPath = null;
    if (!fullPath) continue;

    if (typeflag === "5") {
      files.set(fullPath.replace(/\/$/, "") + "/", Buffer.alloc(0));
    } else if (typeflag === "0" || typeflag === "" || typeflag === "\u0000") {
      files.set(fullPath, data);
    }
    // Enlaces (1,2) y dispositivos se ignoran deliberadamente: no aportan al análisis.
  }

  return files;
}

/** Extrae el registro `path=` de una cabecera PAX ("<len> path=<valor>\n"). */
function parsePaxPath(text) {
  for (const line of text.split("\n")) {
    const m = /^\d+\s+path=(.*)$/.exec(line);
    if (m) return m[1];
  }
  return null;
}

/**
 * Pipeline completo: spec -> { meta, map }.
 * `map` usa las rutas tal cual vienen en el tarball ("package/package.json").
 */
export async function loadPackage(spec) {
  const { name, range } = parseSpec(spec);
  const resolved = resolveVersion(name, range);
  const gz = await fetchTarball(resolved.tarball);
  const actualShasum = createHash("sha1").update(gz).digest("hex");
  const map = parseTar(gunzipSync(gz));

  const manifestBuf = map.get("package/package.json");
  if (!manifestBuf) throw new Error("el tarball no contiene package/package.json");
  const manifest = JSON.parse(manifestBuf.toString("utf8"));

  return {
    meta: {
      requested: { name, range },
      version: resolved.version,
      tarball: resolved.tarball,
      shasum: { expected: resolved.shasum, actual: actualShasum, match: resolved.shasum === actualShasum },
      integrity: resolved.integrity,
      tarballBytes: gz.length,
      registry: getRegistry(),
      filesWrittenToDisk: 0,
    },
    manifest,
    map,
  };
}

/** Rutas del tarball sin el prefijo "package/", para comparar contra exports. */
export function relPaths(map) {
  return [...map.keys()].filter((k) => !k.endsWith("/")).map((k) => k.replace(/^package\//, ""));
}

/** ¿Existe en el tarball el archivo al que apunta un campo del manifiesto? */
export function hasFile(map, declared) {
  if (!declared || typeof declared !== "string") return false;
  const clean = declared.replace(/^\.\//, "").replace(/^\//, "");
  return map.has(`package/${clean}`);
}
