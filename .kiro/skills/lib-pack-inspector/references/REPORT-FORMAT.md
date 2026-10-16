# Report Format — El bloque LIB-REPORT

El resultado se imprime en el chat. **No se escribe ningún archivo.**

## Plantilla

```
LIB-REPORT: <pkg>@<rango> → <versión resuelta>
═══════════════════════════════════════════
Registry: <url> | Tarball: <url> | <n> KB | shasum ✅ | análisis en memoria, 0 archivos a disco

  Composición
    ✅ <Etiqueta>: <evidencia 1> + <evidencia 2>

  Entrypoints
    ✅ ".": import <archivo> (MJS) | require <archivo> (CJS) | types <archivo>
    ✅ "./<subpath>": <conditions resueltas>
    ✅ bin: <comando> → <archivo>

  Tipos
    ✅ <Bundled-Types | Via-DefinitelyTyped | Untyped>: <evidencia>

  API pública
    ✅ ".": <n> símbolos — <lista o muestra> (<m> excluidos por @deprecated)

  Instalación
    ✅ npm i <pkg>@<versión resuelta>
    ✅ peers: <nombre>@<rango> — <nombre>@<rango> (optional)
    ✅ import: <forma correcta del import>

Resumen:
┌──────────────┬──────────────────────────┬────────┐
│ Dimensión    │ Valor                    │ Estado │
├──────────────┼──────────────────────────┼────────┤
│ Composición  │ <etiqueta>               │ ✅     │
│ Entrypoints  │ <n> subpaths             │ ✅     │
│ Tipos        │ <etiqueta>               │ ✅     │
│ PeerDeps     │ <n>                      │ ✅     │
│ API (".")    │ <n> símbolos             │ ✅     │
│ Install      │ npm i <pkg>@<versión>    │ ✅     │
└──────────────┴──────────────────────────┴────────┘

Gaps documentados:
 • <qué falta o no se pudo verificar>
   Reason: <por qué, con la fuente>

Assessment: <PRAGMATICALLY COMPLETE | COMPLETE | INCOMPLETE>
(<justificación en una línea>)
═══════════════════════════════════════════
```

## Estados de Assessment

- **COMPLETE** — todo resuelto y verificado, sin gaps
- **PRAGMATICALLY COMPLETE** — composición, entrypoints y tipos resueltos; menos de 3 gaps, todos
  no críticos y documentados con su `Reason:`
- **INCOMPLETE** — el rango no resuelve, el tarball no se pudo traer, el shasum no coincide, o una
  entrada declarada falta del tarball sin explicación

Un gap documentado no baja la evaluación. Un gap silenciado la invalida: si algo no se pudo
verificar, dilo.

## Ejemplo real (lib ESM con tipos propios)

```
LIB-REPORT: chalk@5 → 5.6.2
═══════════════════════════════════════════
Registry: https://registry.npmjs.org/ | 14 KB | shasum ✅ | 12 archivos | 0 a disco

  Composición
    ✅ ESM-only: type: "module" + 0 archivos .cjs en el tarball

  Entrypoints
    ✅ ".": exports → ./source/index.js (ESM) ✅ | types → ./source/index.d.ts ✅

  Tipos
    ✅ Bundled-Types: ./source/index.d.ts, declarado en el campo types

  API pública
    ✅ ".": 18 símbolos — Chalk, ChalkInstance, ColorName, ColorSupport, Options, chalkStderr…
       (8 excluidos por @deprecated: Color, ForegroundColor, Modifiers, colors, modifiers…)

  Instalación
    ✅ npm i chalk@5.6.2
    ✅ sin peerDependencies
    ✅ import chalk from 'chalk';   // solo ESM: require() falla

Assessment: COMPLETE
(composición, entrypoints y tipos verificados contra el tarball; sin gaps)
═══════════════════════════════════════════
```

## Ejemplo mínimo (lib CJS sin tipos propios)

```
LIB-REPORT: lodash@^4.17.0 → 4.18.1
═══════════════════════════════════════════
Registry: https://registry.npmjs.org/ | 308 KB | shasum ✅ | 1051 archivos | 0 a disco
  Composición   ✅ CJS-only: main → lodash.js con module.exports + 0 archivos .mjs
  Entrypoints   ✅ ".": lodash.js (legacy main, sin campo exports)
  Tipos         ✅ Via-DefinitelyTyped: @types/lodash@4.17.25 → npm i -D @types/lodash
  Instalación   ✅ npm i lodash@4.18.1 · var _ = require('lodash')
Assessment: PRAGMATICALLY COMPLETE
(críticos resueltos; API pública no listada desde el paquete porque los tipos viven en DefinitelyTyped)
═══════════════════════════════════════════
```

## Checklist antes de imprimir

- [ ] Encabezado con rango → versión resuelta y estado del shasum
- [ ] Etiqueta de composición con 2 evidencias citadas desde `signals`
- [ ] Cada entrypoint verificado; comodines como `matches`, no como gap
- [ ] Etiqueta de tipos con su evidencia
- [ ] Conteo de símbolos y de excluidos por `@deprecated`
- [ ] Truncamientos de la API declarados si los hubo
- [ ] Comando de instalación con la versión resuelta y sin `--registry`
- [ ] Forma del import coherente con la composición (nada de `require()` en una lib ESM-only)
- [ ] Cada gap con su `Reason:`
- [ ] Assessment honesto
