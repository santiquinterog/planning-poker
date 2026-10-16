# Types Resolution — Bundled vs DefinitelyTyped vs Untyped

`inspect_pack.mjs` devuelve `types.suggestedLabel` aplicando el árbol de abajo. Este documento
sirve para verificarlo e interpretar los casos límite.

## Árbol de decisión

```
¿el paquete trae tipos propios? (verificado contra el tarball)
├─ Sí, si se cumple alguno:
│   ├─ campo types o typings
│   ├─ exports["<subpath>"].types
│   ├─ typesVersions
│   └─ algún .d.ts / .d.mts / .d.cts dentro del tarball
│   → Bundled-Types
│   → Reportar: ruta del .d.ts + verificación en tarball
│   → Si además existe @types/<pkg>: advertir que los bundled tienen prioridad
│
└─ No:
    ├─ consultar npm view @types/<pkg> version --json  (sin --registry)
    ├─ existe   → Via-DefinitelyTyped, con versión e instalación
    └─ no existe → Untyped
```

## Transformación de scope

`@types` aplana el scope con doble guion bajo:

- `lodash` → `@types/lodash`
- `@babel/core` → `@types/babel__core`
- `@angular/core` → normalmente `Bundled-Types`; Angular publica sus propios `.d.ts`

## Salida por etiqueta

| Etiqueta | Qué reportar | Instalación |
|---|---|---|
| **Bundled-Types** | ruta del `.d.ts` y cómo se declara (`types`, `exports.types`, `typesVersions`) | `npm i <pkg>` ya los incluye |
| **Via-DefinitelyTyped** | `@types/<pkg>@<versión>` | `npm i -D @types/<pkg>` |
| **Untyped** | gap: ni `.d.ts` propios ni DefinitelyTyped | anotar la ausencia; el consumidor decide |

## Tipos rotos

`types.brokenTypeDeclarations` lista los `.d.ts` que el manifiesto declara pero que no están en
el tarball. Es un gap crítico: TypeScript fallará al resolverlos aunque la instalación funcione.

```
Reason: exports["."].types → ./dist/index.d.ts declarado pero ausente del tarball
```

Para confirmar cómo resuelven los tipos bajo `import` frente a `require`, existe
`@arethetypeswrong/cli` — opcional y solo bajo petición, ver [TOOLCHAIN.md](./TOOLCHAIN.md).

## Checklist

- [ ] `types`, `typings`, `typesVersions` y `exports.types` revisados
- [ ] Cada `.d.ts` declarado verificado contra el tarball
- [ ] Sin tipos propios → consulta a `@types/<pkg>` con el scope transformado
- [ ] Conflicto bundled + DefinitelyTyped advertido si aplica
