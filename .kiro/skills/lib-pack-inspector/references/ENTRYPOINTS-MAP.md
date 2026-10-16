# Entrypoints Map — Cómo se resuelven las entradas

> `exports` es el mapa canónico desde Node 12+. `main`/`module`/`browser` son fallback legacy
> que los bundlers antiguos siguen leyendo.

`inspect_pack.mjs` ya devuelve todo esto resuelto en `entrypoints`. Este documento explica cómo
leer esa salida y qué significan sus casos raros.

## Orden de conditions

`inspect_pack.mjs` recorre las conditions en este orden: `types` → `import` → `require` →
`node` → `browser` → `default`. Las conditions no estándar (`worker`, `deno`, `development`,
`esm2022`…) se registran también, pero sin prioridad.

Para cada subpath la salida trae:

```
subpath  →  source: "exports" | "legacy"
            conditions[cond] = { file, format, inTarball }
```

`format` sale de la extensión: `.mjs` → MJS, `.cjs` → CJS, `.umd.js` → UMD, `.d.ts` → DTS,
el resto → JS (y ahí `contentSniff` del bloque de composición dice qué es en realidad).

## Cuándo aparecen dos entradas para `"."`

Es normal ver `.` con `source: "exports"` y otra vez con `source: "legacy"`. Significa que la
librería declara `exports` **y** conserva `main`/`module` para herramientas viejas. No es un
error ni una contradicción: repórtalo como compatibilidad hacia atrás.

## Subpaths con comodín

Un valor como `"./schematics/*": "./schematics/*.js"` no apunta a un archivo concreto. La salida
lo marca `wildcard: true` con `matches: <n>` = cuántos archivos del tarball satisfacen el patrón.

**Nunca lo reportes como gap**, aunque no exista un archivo con ese nombre literal.

## Gaps reales

`inTarball: false` en una condition sin comodín sí es un gap: el paquete declara una entrada que
no publicó. Es una de las causas más frecuentes de "instalé la lib y el import falla".

```
Reason: exports["."].import → ./dist/index.mjs declarado pero ausente del tarball
```

## Peers y binarios

- `peerDependencies` + `peerDependenciesMeta` → tabla de peers con su marca `optional`
- `bin` → entradas de CLI, p. ej. `{ "mycli": "./bin/cli.js" }`

## Checklist

- [ ] Cada subpath de `exports` listado con su archivo resuelto
- [ ] Cada archivo verificado contra el tarball, o gap con `Reason:`
- [ ] Comodines reportados como `matches: n`, nunca como gap
- [ ] Fallback `main`/`module` documentado cuando exista
- [ ] Formato anotado por entrada
