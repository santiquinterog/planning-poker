# Toolchain — Contrato de los scripts y herramientas opcionales

> Los dos scripts de la skill no tienen dependencias. Nada pesado se instala para producir un reporte.

## Contrato de `inspect_pack.mjs`

```bash
node scripts/inspect_pack.mjs <pkg>@<rango> [--files] [--pretty]
```

| Clave | Contenido |
|---|---|
| `meta` | rango pedido, versión resuelta, tarball, `shasum {expected, actual, match}`, `integrity`, bytes, registry, `filesWrittenToDisk: 0` |
| `manifest` | campos relevantes del `package.json` publicado (`type`, `main`, `module`, `exports`, `bin`, `types`, `engines`, `peerDependencies`…) |
| `composition` | `signals` (booleanos + conteos + `contentSniff`), `suggestedLabel`, `suggestedEvidence` |
| `entrypoints` | por subpath: `source` (`exports`\|`legacy`) y `conditions[cond] = { file, format, inTarball }`, o `{ file, wildcard: true, matches }` |
| `types` | campos declarados, `.d.ts` hallados, `brokenTypeDeclarations`, `suggestedLabel`, `definitelyTyped` |
| `install` | `command`, `peers[]`, `engines`, `readmeSnippet` |
| `tarball` | `fileCount` y, con `--files`, la lista completa de rutas |

`--files` puede ser muy largo en paquetes grandes: pídelo solo cuando necesites confirmar la
existencia de una ruta que no aparece en `entrypoints`.

## Contrato de `extract_api.mjs`

```bash
node scripts/extract_api.mjs <pkg>@<rango> [--subpath "."] [--top <n>] [--pretty]
```

Por entrypoint con tipos: `symbols`, `symbolsTruncated`, `deprecatedExcluded`, `internalOmitted`,
`followedFiles`, `gaps`. `--top` limita cuántos entrypoints se listan (25 por defecto) y el resto
se resume en `entrypointsOmitted`.

## Por qué esto es un script y no instrucciones

El parseo de tar, la clasificación de composición y el filtro `@deprecated` son mecánicos y deben
dar idéntico en cada corrida. Descritos en prosa se reimplementan distinto cada vez y hay que
cargarlos en contexto para poder seguirlos. Como script se ejecutan sin costar contexto.

El parser de tar cubre el campo `prefix` de ustar, GNU longname y cabeceras PAX. Un parser que
solo lee los 100 bytes del campo `name` pierde archivos en silencio en paquetes con rutas
profundas, y eso produce gaps falsos del tipo "declarado en exports pero ausente del tarball".

## Herramientas opcionales (solo bajo petición explícita)

| Tool | Peso | Cuándo | Cómo |
|---|---|---|---|
| **publint** | ~200KB | validar `exports`/`types` mal formados | `npx --yes publint` dentro del directorio del paquete instalado. Verifica su CLI antes de usarla: sus flags cambian entre versiones y **no acepta una URL de tarball** |
| **@arethetypeswrong/cli** | ~500KB | comprobar que los tipos resuelven para `import` y `require` | `npx --yes @arethetypeswrong/cli <pkg>@<version>` |
| **ts-morph** | ~8MB + typescript | AST real de `.d.ts` | **no instalar**; solo si el proyecto ya lo tiene |
| **@microsoft/api-extractor** | ~30MB | rollup canónico de API | **no instalar**; solo si el tarball ya trae `api-extractor.json` |

### Regla de oro

> No instales `ts-morph` ni `api-extractor` para producir un reporte. El método por defecto es
> `extract_api.mjs`, y su limitación se documenta como gap:
> `Reason: símbolos listados por regex sobre .d.ts, excluye @deprecated`.

## Qué no hacer

- No `npm pack` ni escribir el `.tgz` a disco
- No pasar `--registry` a ningún comando
- No `npm i -D ts-morph` automático
- No reimplementar en la conversación lo que hacen los scripts
