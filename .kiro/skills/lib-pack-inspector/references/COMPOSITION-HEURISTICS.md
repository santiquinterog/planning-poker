# Composition Heuristics — Las 7 etiquetas

`inspect_pack.mjs` ya devuelve `composition.suggestedLabel` aplicando el orden de abajo.
Este documento sirve para **verificar** esa sugerencia y para redactar las evidencias.

## Matriz

| Etiqueta | Señales del manifiesto | Señales del tarball | Ejemplo real |
|---|---|---|---|
| **ESM-only** | `type: "module"` o `exports.import` sin `require` | solo `.mjs`, o `.js` con `import`/`export` y sin `module.exports` | `chalk@5` |
| **CJS-only** | sin `type:module`, sin `module`, sin `exports.import` | `.js` con `module.exports`, sin `.mjs` | `lodash@4` |
| **Dual-conditional** | `exports` con `import` **y** `require` | ambos archivos presentes | `date-fns@3` |
| **Hybrid-legacy** | `main` + `module`, sin `exports` | `index.js` + `index.esm.js` | libs anteriores a `exports` |
| **UMD-only** | `unpkg`/`jsdelivr`/`umd:main` | `*.umd.js` o wrapper `(function (global, factory)` | `leaflet@1.9` |
| **UMD+ESM** | `module` o `exports.import` **y** `unpkg` | `.mjs` + `.umd.js` | libs pensadas para CDN y bundler |
| **Mixed** | combinación no estándar | evidencia contradictoria | requiere gap explicando qué choca |

## Orden de aplicación

1. `exports` con `import` **y** `require` → **Dual-conditional**
2. wrapper UMD **y** alguna entrada ESM → **UMD+ESM**
3. wrapper UMD **sin** entrada ESM → **UMD-only**
4. sin `exports`, con `main` **y** `module` → **Hybrid-legacy**
5. `type:module` o `exports.import`, sin `require` ni `.cjs` → **ESM-only**
6. sin `type:module`, sin `module`, sin `.mjs` → **CJS-only**
7. resto → **Mixed** + `Reason: distribución no estándar`

## Señales disponibles en `composition.signals`

- Manifiesto: `typeModule`, `hasExports`, `exportsHasImport`, `exportsHasRequire`, `hasMain`,
  `hasModule`, `hasBrowser`, `hasUnpkgOrJsdelivr`, `sideEffects`
- Tarball: `mjsFiles`, `cjsFiles`, `umdFiles`, `jsFiles`
- Contenido: `contentSniff[archivo] = { esm, cjs, umd }` y `umdWrapperDetected`

`contentSniff` mira el archivo real, no solo la extensión: un `.js` puede ser ESM, CJS o UMD.
Cuando el manifiesto y el contenido se contradicen, gana el contenido y esa contradicción es
una evidencia digna de aparecer en el reporte.

## Redactar las 2 evidencias

Cada evidencia cita una señal concreta, no una impresión:

- `Dual-conditional`: `exports.import → ./dist/index.mjs (en tarball ✅)` + `exports.require → ./dist/index.cjs (en tarball ✅)`
- `ESM-only`: `type: "module"` + `0 archivos .cjs en el tarball`
- `UMD-only`: `wrapper UMD detectado en dist/leaflet-src.js` + `sin module ni exports.import`

Si una evidencia no se sostiene contra el tarball → gap:
`Reason: archivo declarado en exports pero ausente del tarball`.

## Nota sobre sideEffects

`sideEffects: false` indica que la librería se anuncia como tree-shakable. Es información útil
para el reporte, pero **no cambia la etiqueta de composición**.
