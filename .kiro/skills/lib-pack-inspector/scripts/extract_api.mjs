#!/usr/bin/env node
/**
 * extract_api.mjs — Símbolos públicos de cada entrypoint, excluyendo `@deprecated`.
 *
 * Uso:
 *   node scripts/extract_api.mjs <pkg>@<rango> [--subpath "."] [--pretty]
 *
 * Sin --subpath analiza todos los entrypoints que declaren una condition `types`.
 * Emite JSON: { meta, entrypoints: [{ subpath, dts, symbols, deprecated, followed, gaps }] }
 *
 * Método: lectura del `.d.ts` desde el tarball en memoria + regex. Ver
 * references/PUBLIC-API-SHAPE.md para el porqué de no usar ts-morph por defecto.
 */

import { loadPackage, maskSecrets } from "./lib/pack.mjs";

const INTERNAL_PATH = /(^|\/)(_internal|__private|internal)(\/|$)|(^|\/)_[^/]*$/;

/**
 * Símbolos que se exportan pero no son API de consumo: prefijo privado de Angular (ɵ),
 * placeholders de compilación y convención de doble guion bajo. Se cuentan aparte para
 * que el reporte diga "N internos omitidos" en vez de inflar el conteo público.
 */
const INTERNAL_SYMBOL = /^(ɵ|__|_[A-Z])|^__.*__$/;

const DECL_PATTERNS = [
  /export\s+declare\s+(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/g,
  /export\s+declare\s+function\s+([A-Za-z_$][\w$]*)/g,
  /export\s+declare\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
  /export\s+declare\s+(?:const\s+)?enum\s+([A-Za-z_$][\w$]*)/g,
  /export\s+declare\s+namespace\s+([A-Za-z_$][\w$]*)/g,
  /export\s+(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/g,
  /export\s+function\s+([A-Za-z_$][\w$]*)/g,
  /export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
  /export\s+interface\s+([A-Za-z_$][\w$]*)/g,
  /export\s+type\s+([A-Za-z_$][\w$]*)/g,
  /export\s+(?:const\s+)?enum\s+([A-Za-z_$][\w$]*)/g,
];

/**
 * ¿El símbolo en `index` está precedido por un JSDoc con @deprecated?
 *
 * Se busca el bloque JSDoc INMEDIATAMENTE anterior (solo espacios/modificadores en
 * medio), no una ventana ciega de N caracteres: una ventana fija marca como obsoleto
 * al símbolo siguiente cada vez que uno deprecado lo precede.
 */
function isDeprecated(content, index) {
  const before = content.slice(0, index);
  const closeAt = before.lastIndexOf("*/");
  if (closeAt === -1) return false;
  const between = before.slice(closeAt + 2);
  if (!/^[\s]*$/.test(between)) return false;
  const openAt = before.lastIndexOf("/**", closeAt);
  if (openAt === -1) return false;
  return /@deprecated\b/i.test(before.slice(openAt, closeAt));
}

/** Resuelve un especificador relativo de un .d.ts a una ruta real del tarball. */
function resolveDts(map, fromPath, spec) {
  if (!spec.startsWith(".")) return null;
  const baseDir = fromPath.split("/").slice(0, -1).join("/");
  const parts = (baseDir + "/" + spec).split("/");
  const stack = [];
  for (const p of parts) {
    if (p === "." || p === "") continue;
    if (p === "..") stack.pop();
    else stack.push(p);
  }
  const base = stack.join("/").replace(/\.(m|c)?js$/, "");
  for (const cand of [`${base}.d.ts`, `${base}.d.mts`, `${base}.d.cts`, `${base}/index.d.ts`, base]) {
    if (map.has(cand)) return cand;
  }
  return null;
}

/**
 * Extrae símbolos de un .d.ts, siguiendo `export * from` dentro del propio tarball.
 * El original documentaba esto como gap permanente; se resuelve mientras el destino
 * viva en el paquete. Solo queda gap si apunta a otro paquete.
 */
function extractFrom(map, path, depth = 0, seen = new Set(), acc = null) {
  acc = acc ?? { symbols: new Set(), deprecated: new Set(), internal: new Set(), followed: [], gaps: [] };
  if (depth > 6 || seen.has(path)) return acc;
  seen.add(path);

  const buf = map.get(path);
  if (!buf) {
    acc.gaps.push(`archivo de tipos no encontrado en el tarball: ${path.replace(/^package\//, "")}`);
    return acc;
  }
  const content = buf.toString("utf8");

  for (const re of DECL_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const name = m[1];
      if (isDeprecated(content, m.index)) acc.deprecated.add(name);
      else if (INTERNAL_SYMBOL.test(name)) acc.internal.add(name);
      else acc.symbols.add(name);
    }
  }

  // export { A, B as C } — se ignoran los `export { ... } from` de tipo re-export puro
  // solo si el destino se sigue después; los nombres se registran igual.
  const named = /export\s*\{([^}]*)\}/g;
  let nm;
  while ((nm = named.exec(content)) !== null) {
    if (isDeprecated(content, nm.index)) continue;
    for (const piece of nm[1].split(",")) {
      const t = piece.trim();
      if (!t) continue;
      const alias = /\bas\s+([A-Za-z_$][\w$]*)\s*$/.exec(t);
      const name = alias ? alias[1] : t.replace(/^type\s+/, "").trim();
      if (!/^[\p{L}_$][\p{L}\p{N}_$]*$/u.test(name) || name === "default") continue;
      if (INTERNAL_SYMBOL.test(name)) acc.internal.add(name);
      else acc.symbols.add(name);
    }
  }

  if (/export\s+default\b/.test(content)) acc.symbols.add("default");

  // export * from "./x" — se sigue dentro del tarball.
  const star = /export\s+\*\s+(?:as\s+([A-Za-z_$][\w$]*)\s+)?from\s*['"]([^'"]+)['"]/g;
  let sm;
  while ((sm = star.exec(content)) !== null) {
    if (isDeprecated(content, sm.index)) continue;
    const [, alias, spec] = sm;
    if (alias) {
      acc.symbols.add(alias);
      continue;
    }
    if (INTERNAL_PATH.test(spec)) continue;
    const target = resolveDts(map, path, spec);
    if (target) {
      acc.followed.push(target.replace(/^package\//, ""));
      extractFrom(map, target, depth + 1, seen, acc);
    } else if (spec.startsWith(".")) {
      acc.gaps.push(`re-export "export * from '${spec}'" no resuelto dentro del tarball`);
    } else {
      acc.gaps.push(`re-export hacia paquete externo "${spec}": símbolos no trazados`);
    }
  }

  return acc;
}

async function main() {
  const args = process.argv.slice(2);
  const spec = args.find((a) => !a.startsWith("--"));
  if (!spec) {
    console.error('uso: node scripts/extract_api.mjs <pkg>@<rango> [--subpath "."] [--pretty]');
    process.exit(2);
  }
  const sIdx = args.indexOf("--subpath");
  const wanted = sIdx !== -1 ? args[sIdx + 1] : null;
  const tIdx = args.indexOf("--top");
  // Paquetes como date-fns declaran 300+ subpaths de una función cada uno: volcarlos
  // todos llena el contexto sin aportar. Se listan los principales y se cuenta el resto.
  const top = tIdx !== -1 ? parseInt(args[tIdx + 1], 10) : 25;

  const { meta, manifest, map } = await loadPackage(spec);

  // Candidatos: cada `types` declarado en exports, más types/typings legacy.
  const candidates = [];
  const addCandidate = (subpath, file) => {
    if (!file || file.includes("*")) return;
    const path = "package/" + file.replace(/^\.\//, "");
    if (!candidates.some((c) => c.subpath === subpath)) candidates.push({ subpath, dts: file, path });
  };

  const walk = (subpath, value, depth = 0) => {
    if (depth > 6 || value == null) return;
    if (typeof value === "string") return;
    if (Array.isArray(value)) return value.forEach((v) => walk(subpath, v, depth + 1));
    if (typeof value.types === "string") addCandidate(subpath, value.types);
    for (const v of Object.values(value)) if (typeof v === "object") walk(subpath, v, depth + 1);
  };

  const exp = manifest.exports;
  if (exp && typeof exp === "object" && !Array.isArray(exp)) {
    const keys = Object.keys(exp);
    if (keys.some((k) => k.startsWith("."))) for (const [k, v] of Object.entries(exp)) walk(k, v);
    else walk(".", exp);
  }
  addCandidate(".", manifest.types ?? manifest.typings);

  const all = wanted ? candidates.filter((c) => c.subpath === wanted) : candidates;
  // Prioriza "." y los subpaths de primer nivel, que es lo que se consume de verdad.
  const ranked = [...all].sort((a, b) => {
    const depth = (x) => (x.subpath === "." ? 0 : x.subpath.split("/").length);
    return depth(a) - depth(b) || a.subpath.localeCompare(b.subpath);
  });
  const targets = Number.isFinite(top) && top > 0 ? ranked.slice(0, top) : ranked;
  const omitted = ranked.length - targets.length;

  const entrypoints = targets.map((c) => {
    const r = extractFrom(map, c.path);
    return {
      subpath: c.subpath,
      dts: c.dts,
      method: "regex sobre .d.ts en memoria, excluye @deprecated",
      symbolCount: r.symbols.size,
      symbols: [...r.symbols].sort().slice(0, 150),
      symbolsTruncated: Math.max(0, r.symbols.size - 150),
      deprecatedExcluded: [...r.deprecated].sort(),
      internalOmitted: r.internal.size,
      followedFiles: r.followed,
      gaps: [...new Set(r.gaps)],
    };
  });

  const out = {
    meta: { name: manifest.name, version: meta.version, registry: meta.registry },
    entrypoints,
    entrypointsOmitted: omitted > 0 ? { count: omitted, hint: "usa --top <n> o --subpath <ruta> para verlos" } : null,
    note: entrypoints.length
      ? null
      : "Sin declaraciones de tipos: la API pública no puede listarse desde .d.ts (ver TYPES-RESOLUTION.md).",
  };

  process.stdout.write(JSON.stringify(out, null, args.includes("--pretty") ? 2 : 0) + "\n");
}

main().catch((err) => {
  process.stdout.write(JSON.stringify({ error: maskSecrets(err.message) }) + "\n");
  process.exit(1);
});
