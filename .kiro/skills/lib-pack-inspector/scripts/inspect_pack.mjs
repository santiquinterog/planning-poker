#!/usr/bin/env node
/**
 * inspect_pack.mjs — De `lib@rango` a un JSON con todo lo mecánico ya resuelto.
 *
 * Uso:
 *   node scripts/inspect_pack.mjs <pkg>@<rango> [--files] [--pretty]
 *
 *   --files    incluye el listado completo de rutas del tarball (puede ser largo)
 *   --pretty   JSON indentado
 *
 * Emite por stdout un objeto con: meta, manifest, composition, entrypoints, types, install.
 * En error emite { "error": "..." } y sale con código 1.
 *
 * Este script cubre los Pasos 1-4, 5.1-5.2, 6.1 y 7 del flujo. La asignación final de
 * etiquetas y la redacción del reporte quedan en SKILL.md: aquí solo va lo que debe dar
 * idéntico en cada corrida.
 */

import { loadPackage, relPaths, hasFile, maskSecrets } from "./lib/pack.mjs";
import { execFileSync } from "node:child_process";

const CONDITION_ORDER = ["types", "import", "require", "node", "browser", "default"];

function formatOf(file) {
  if (!file) return null;
  if (/\.d\.[cm]?ts$/.test(file)) return "DTS";
  if (/\.umd\.js$/.test(file)) return "UMD";
  if (/\.mjs$/.test(file)) return "MJS";
  if (/\.cjs$/.test(file)) return "CJS";
  if (/\.json$/.test(file)) return "JSON";
  return "JS";
}

/** Recorre un valor de `exports` (string | objeto de conditions | array) y devuelve las conditions resueltas. */
function resolveConditions(value, map, acc = {}, seen = 0) {
  if (seen > 8 || value == null) return acc;
  if (typeof value === "string") {
    acc.default = acc.default ?? value;
    return acc;
  }
  if (Array.isArray(value)) {
    for (const v of value) resolveConditions(v, map, acc, seen + 1);
    return acc;
  }
  for (const cond of CONDITION_ORDER) {
    if (cond in value) {
      const v = value[cond];
      if (typeof v === "string") acc[cond] = acc[cond] ?? v;
      else resolveConditions(v, map, acc, seen + 1);
    }
  }
  // Conditions no estándar (worker, deno, development…): se registran sin priorizar.
  for (const [k, v] of Object.entries(value)) {
    if (CONDITION_ORDER.includes(k) || k.startsWith(".")) continue;
    if (typeof v === "string") acc[k] = acc[k] ?? v;
  }
  return acc;
}

function buildEntrypoints(manifest, map) {
  const out = [];
  const push = (subpath, conditions, source) => {
    const resolved = {};
    for (const [cond, file] of Object.entries(conditions)) {
      if (!file) continue;
      if (file.includes("*")) {
        // Subpath con patrón: no es un archivo concreto, así que `inTarball` no aplica.
        // Marcarlo como ausente produciría un gap falso ("declarado pero no en tarball").
        resolved[cond] = {
          file,
          format: null,
          wildcard: true,
          matches: countWildcardMatches(map, file),
        };
      } else {
        resolved[cond] = { file, format: formatOf(file), inTarball: hasFile(map, file) };
      }
    }
    if (Object.keys(resolved).length) out.push({ subpath, source, conditions: resolved });
  };

  if (manifest.exports && typeof manifest.exports === "object" && !Array.isArray(manifest.exports)) {
    const keys = Object.keys(manifest.exports);
    const isSubpathMap = keys.some((k) => k.startsWith("."));
    if (isSubpathMap) {
      for (const [subpath, value] of Object.entries(manifest.exports)) {
        push(subpath, resolveConditions(value, map), "exports");
      }
    } else {
      push(".", resolveConditions(manifest.exports, map), "exports");
    }
  } else if (typeof manifest.exports === "string") {
    push(".", { default: manifest.exports }, "exports");
  }

  // Legacy: siempre se registra, aunque exista `exports`, porque bundlers viejos lo siguen leyendo.
  const legacy = {};
  if (manifest.main) legacy.require = manifest.main;
  if (manifest.module) legacy.import = manifest.module;
  if (manifest.browser && typeof manifest.browser === "string") legacy.browser = manifest.browser;
  if (manifest.unpkg) legacy.unpkg = manifest.unpkg;
  if (manifest.types || manifest.typings) legacy.types = manifest.types || manifest.typings;
  if (Object.keys(legacy).length) push(".", legacy, "legacy");

  return out;
}

/** Cuenta cuántos archivos del tarball satisfacen un patrón de exports con `*`. */
function countWildcardMatches(map, pattern) {
  const clean = pattern.replace(/^\.\//, "");
  const re = new RegExp("^package/" + clean.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
  return [...map.keys()].filter((k) => re.test(k)).length;
}

function sniff(map, file) {
  if (!file) return null;
  const buf = map.get(`package/${file.replace(/^\.\//, "")}`);
  if (!buf) return null;
  // Se escanea el archivo completo (con tope) porque muchos bundles arrancan con
  // cientos de líneas de licencia: mirar solo los primeros KB da falsos negativos.
  const CAP = 2 * 1024 * 1024;
  const text = buf.subarray(0, CAP).toString("utf8");
  const head = text.slice(0, 8000);
  return {
    esm: /(^|\n)\s*(import\s[\s\S]{0,120}from\s|export\s(default|const|function|class|\{|\*))/m.test(text),
    cjs: /module\.exports|exports\.[A-Za-z_$]|require\(/.test(text),
    // El wrapper UMD siempre está al inicio o al final; buscarlo en todo el bundle
    // dispara falsos positivos con cualquier `typeof define` interno.
    umd: /typeof\s+define\s*===?\s*["']function["']\s*&&\s*define\.amd|typeof\s+exports\s*===?\s*["']object["'][\s\S]{0,300}typeof\s+module|\(function\s*\([^)]{0,120}(global|factory)[^)]{0,120}\)\s*\{/.test(
      head + "\n" + text.slice(-8000)
    ),
  };
}

function compositionSignals(manifest, map) {
  const paths = relPaths(map);
  const exportsStr = JSON.stringify(manifest.exports ?? null);
  const s = {
    typeModule: manifest.type === "module",
    hasExports: !!manifest.exports,
    exportsHasImport: /"import"\s*:/.test(exportsStr),
    exportsHasRequire: /"require"\s*:/.test(exportsStr),
    hasMain: !!manifest.main,
    hasModule: !!manifest.module,
    hasBrowser: !!manifest.browser,
    hasUnpkgOrJsdelivr: !!(manifest.unpkg || manifest.jsdelivr || manifest["umd:main"]),
    sideEffects: manifest.sideEffects ?? null,
    mjsFiles: paths.filter((p) => p.endsWith(".mjs")).length,
    cjsFiles: paths.filter((p) => p.endsWith(".cjs")).length,
    umdFiles: paths.filter((p) => /\.umd\.js$/.test(p)).length,
    jsFiles: paths.filter((p) => /\.js$/.test(p) && !/\.umd\.js$/.test(p)).length,
  };

  // Sniff del contenido real de los candidatos principales.
  const candidates = [manifest.main, manifest.module, manifest.unpkg, manifest.browser].filter(
    (v) => typeof v === "string"
  );
  s.contentSniff = {};
  for (const c of candidates) {
    const r = sniff(map, c);
    if (r) s.contentSniff[c] = r;
  }
  s.umdWrapperDetected = Object.values(s.contentSniff).some((r) => r.umd) || s.umdFiles > 0;

  // Etiqueta sugerida siguiendo el orden de COMPOSITION-HEURISTICS.md.
  let label, evidence;
  if (s.exportsHasImport && s.exportsHasRequire) {
    label = "Dual-conditional";
    evidence = ["exports.import presente", "exports.require presente"];
  } else if (s.umdWrapperDetected && (s.exportsHasImport || s.hasModule || s.mjsFiles > 0)) {
    label = "UMD+ESM";
    evidence = ["wrapper UMD o campo unpkg/jsdelivr detectado", "entrada ESM presente (module/exports.import/.mjs)"];
  } else if (s.umdWrapperDetected && !s.exportsHasImport && !s.hasModule && s.mjsFiles === 0) {
    label = "UMD-only";
    evidence = ["wrapper UMD detectado", "sin entrada ESM declarada ni archivos .mjs"];
  } else if (!s.hasExports && s.hasMain && s.hasModule) {
    label = "Hybrid-legacy";
    evidence = ["main + module presentes", "campo exports ausente"];
  } else if ((s.typeModule || s.exportsHasImport) && !s.exportsHasRequire && s.cjsFiles === 0) {
    label = "ESM-only";
    evidence = [s.typeModule ? 'type: "module"' : "exports.import sin require", "sin archivos .cjs en el tarball"];
  } else if (!s.typeModule && !s.exportsHasImport && !s.hasModule && s.mjsFiles === 0) {
    label = "CJS-only";
    evidence = ["sin type:module, sin module ni exports.import", "sin archivos .mjs en el tarball"];
  } else {
    label = "Mixed";
    evidence = ["señales contradictorias entre manifiesto y contenido del tarball"];
  }

  return { signals: s, suggestedLabel: label, suggestedEvidence: evidence };
}

function typesSignals(manifest, map, entrypoints) {
  const paths = relPaths(map);
  const dts = paths.filter((p) => /\.d\.[cm]?ts$/.test(p));
  const declared = [];
  if (manifest.types) declared.push(manifest.types);
  if (manifest.typings) declared.push(manifest.typings);
  for (const ep of entrypoints) {
    const t = ep.conditions.types;
    if (t) declared.push(t.file);
  }
  const declaredChecked = [...new Set(declared)].map((f) => ({ file: f, inTarball: hasFile(map, f) }));
  const bundled = dts.length > 0 || declaredChecked.some((d) => d.inTarball);

  const out = {
    hasTypesField: !!(manifest.types || manifest.typings),
    hasTypesVersions: !!manifest.typesVersions,
    dtsFilesInTarball: dts.length,
    dtsSample: dts.slice(0, 12),
    declared: declaredChecked,
    brokenTypeDeclarations: declaredChecked.filter((d) => !d.inTarball).map((d) => d.file),
    suggestedLabel: bundled ? "Bundled-Types" : null,
    definitelyTyped: null,
  };

  if (!bundled) {
    const dtName = manifest.name.startsWith("@")
      ? `@types/${manifest.name.slice(1).replace("/", "__")}`
      : `@types/${manifest.name}`;
    try {
      const raw = execFileSync("npm", ["view", dtName, "version", "--json"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      let v = JSON.parse(raw);
      if (Array.isArray(v)) v = v[v.length - 1];
      out.definitelyTyped = { package: dtName, version: v, install: `npm i -D ${dtName}` };
      out.suggestedLabel = "Via-DefinitelyTyped";
    } catch {
      out.definitelyTyped = { package: dtName, version: null };
      out.suggestedLabel = "Untyped";
    }
  } else if (manifest.name) {
    out.note = "Si además existe @types/<pkg>, los tipos bundled tienen prioridad y DT queda obsoleto.";
  }

  return out;
}

function readmeSnippet(map, pkgName) {
  const key = [...map.keys()].find((k) => /^package\/readme(\.[a-z]+)?$/i.test(k));
  if (!key) return null;
  const text = map.get(key).toString("utf8");

  // La valla de apertura debe estar a principio de línea; si no, el emparejamiento
  // se desfasa y se capturan los párrafos que hay ENTRE los bloques de código.
  const blocks = [...text.matchAll(/^```([a-zA-Z]*)[ \t]*\r?\n([\s\S]*?)^```/gm)].map((m) => ({
    lang: m[1].toLowerCase(),
    code: m[2],
  }));
  if (!blocks.length) return null;

  const escaped = pkgName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const importsPkg = new RegExp(`(import[\\s\\S]{0,200}from\\s+['"]${escaped}|require\\(['"]${escaped})`);
  const isJsLang = (b) => !b.lang || ["js", "javascript", "ts", "typescript", "jsx", "tsx", "mjs", "cjs"].includes(b.lang);
  const looksLikeCode = (b) => /\b(import|require|const|let|var|function|class|=>)\b/.test(b.code);

  // Preferencia: bloque que importa el propio paquete > cualquier bloque con código real.
  // Si ningún bloque tiene código, se devuelve null antes que un fragmento de prosa.
  const chosen =
    blocks.find((b) => isJsLang(b) && importsPkg.test(b.code)) ??
    blocks.find((b) => isJsLang(b) && looksLikeCode(b)) ??
    null;

  return chosen ? chosen.code.trim().split("\n").slice(0, 14).join("\n") : null;
}

async function main() {
  const args = process.argv.slice(2);
  const spec = args.find((a) => !a.startsWith("--"));
  if (!spec) {
    console.error("uso: node scripts/inspect_pack.mjs <pkg>@<rango> [--files] [--pretty]");
    process.exit(2);
  }

  const { meta, manifest, map } = await loadPackage(spec);
  const entrypoints = buildEntrypoints(manifest, map);
  const composition = compositionSignals(manifest, map);
  const types = typesSignals(manifest, map, entrypoints);

  const peers = Object.entries(manifest.peerDependencies ?? {}).map(([name, range]) => ({
    name,
    range,
    optional: !!manifest.peerDependenciesMeta?.[name]?.optional,
    install: `npm i ${name}@"${range}"`,
  }));

  const result = {
    meta,
    manifest: {
      name: manifest.name,
      version: manifest.version,
      type: manifest.type ?? null,
      main: manifest.main ?? null,
      module: manifest.module ?? null,
      browser: manifest.browser ?? null,
      unpkg: manifest.unpkg ?? null,
      exports: manifest.exports ?? null,
      bin: manifest.bin ?? null,
      files: manifest.files ?? null,
      types: manifest.types ?? manifest.typings ?? null,
      typesVersions: manifest.typesVersions ?? null,
      engines: manifest.engines ?? null,
      sideEffects: manifest.sideEffects ?? null,
      dependencies: manifest.dependencies ?? {},
      peerDependencies: manifest.peerDependencies ?? {},
      peerDependenciesMeta: manifest.peerDependenciesMeta ?? null,
      license: manifest.license ?? null,
      deprecated: manifest.deprecated ?? null,
    },
    composition,
    entrypoints,
    types,
    install: {
      command: `npm i ${manifest.name}@${meta.version}`,
      peers,
      engines: manifest.engines ?? null,
      readmeSnippet: readmeSnippet(map, manifest.name),
    },
    tarball: {
      totalEntries: map.size,
      files: args.includes("--files") ? relPaths(map).sort() : undefined,
      fileCount: relPaths(map).length,
    },
  };

  process.stdout.write(JSON.stringify(result, null, args.includes("--pretty") ? 2 : 0) + "\n");
}

main().catch((err) => {
  process.stdout.write(JSON.stringify({ error: maskSecrets(err.message) }) + "\n");
  process.exit(1);
});
