---
name: lib-pack-inspector
description: Analiza una librería npm (de registry público o privado) para responder cómo se instala,   cómo se importa y qué expone su API pública, leyendo el tarball publicado en lugar del repo.   Úsalo SIEMPRE que se pregunte si una librería es ESM o CJS, qué entrypoints o exports declara,   por qué falla un import o un require, si trae tipos propios o hace falta @types, qué   peerDependencies exige, qué símbolos exporta, cómo se usa una función concreta, o qué versión   resuelve un rango — incluso si no se dice "analizar" ni se da un número de versión exacto.   No lo uses para paquetes locales del monorepo sin publicar, para depurar la configuración de   build del propio proyecto, ni para preguntas conceptuales sobre npm que no involucren una   librería concreta.
---
# Lib Pack Inspector

Responde preguntas sobre una librería npm concreta a partir de lo que realmente se publica.

## Conceptos centrales

### El tarball es la fuente de verdad

Lo que se instala es el tarball, no el repositorio. El README de GitHub, el `src/` sin compilar
y la documentación del sitio pueden estar por delante o por detrás de lo publicado.

- ✅ **Fuente:** `package/package.json` y los archivos del `.tgz`, más `npm view <pkg> dist.*`
- ❌ **No fuente:** README del repo, `src/` sin compilar, docs del sitio oficial

Todo el análisis ocurre en memoria: se descarga el tarball a un `Buffer`, se descomprime y se
parsea a un `Map<ruta, Buffer>`. **Cero archivos escritos a disco.**

### Composición con etiquetas finas

Una de siete: `ESM-only`, `CJS-only`, `Dual-conditional`, `Hybrid-legacy`, `UMD-only`,
`UMD+ESM`, `Mixed`. Cada etiqueta exige 2 evidencias verificadas contra el tarball.
Ver [COMPOSITION-HEURISTICS.md](./references/COMPOSITION-HEURISTICS.md).

### Tipos

`Bundled-Types` (trae `.d.ts` propios), `Via-DefinitelyTyped` (existe `@types/<pkg>`) o
`Untyped`. Ver [TYPES-RESOLUTION.md](./references/TYPES-RESOLUTION.md).

### API pública sin `@deprecated`

Solo se listan los símbolos que un consumidor puede importar y que no están marcados
`@deprecated` en su JSDoc. Ver [PUBLIC-API-SHAPE.md](./references/PUBLIC-API-SHAPE.md).

---

## Herramientas

Dos scripts resuelven todo lo mecánico. **Ejecútalos; no reimplementes su lógica en la
conversación** — el parseo de tar, la detección de composición y el filtro `@deprecated`
deben dar idéntico en cada corrida.

```bash
node scripts/inspect_pack.mjs <pkg>@<rango> [--files] [--pretty]
node scripts/extract_api.mjs <pkg>@<rango> [--subpath "."] [--top <n>] [--pretty]
```

Requisitos: Node 18+ y `npm` en el PATH. Sin dependencias que instalar.
Ambos escriben JSON en stdout y `{"error": "..."}` con código 1 si fallan.
Detalle del contrato de salida en [TOOLCHAIN.md](./references/TOOLCHAIN.md).

---

## Flujo de trabajo

### Paso 0 — Contexto de registry

**Acciones:** el terminal ya resolvió registry y auth vía `.npmrc` y variables de entorno.
No pases `--registry` ni crees `.npmrc`. `inspect_pack.mjs` reporta el registry activo en
`meta.registry` únicamente para documentarlo.

**Criterio de paso:** registry anotado, sin exponer tokens.
[Detalle →](./references/PRIVATE-REGISTRY.md)

---

### Paso 1 — Analizar el paquete

**Entrada:** `<pkg>@<rango>` (exacto `1.2.3`, `^1.0.0`, `latest`, `next`, `*`).

**Acciones:**

```bash
node scripts/inspect_pack.mjs <pkg>@<rango> --pretty
```

Cubre en una sola corrida: resolución del rango, descarga del tarball, verificación de shasum,
lectura del manifiesto, señales de composición, mapa de entrypoints, señales de tipos y bloque
de instalación.

**Criterio de paso:** JSON obtenido con `meta.version` y `meta.shasum.match: true`.

**Si falla:**

| Error | Qué significa | Qué hacer |
|---|---|---|
| `el rango "..." no resuelve` | rango inválido o versión inexistente | pide el rango correcto; `npm view <pkg> versions --json` da el contexto. `Assessment: INCOMPLETE` |
| `npm view ... falló` con 401/403 | el registry exige auth que el terminal no tiene | no inyectes credenciales. Reporta el gap y para |
| `HTTP 404` en el tarball | versión despublicada o registry incompleto | documenta el gap. `Assessment: INCOMPLETE` |
| `shasum.match: false` | el tarball no coincide con lo que anuncia el registry | **no sigas**: repórtalo como hallazgo de integridad |

---

### Paso 2 — Clasificar la composición

**Entrada:** `composition` del JSON del Paso 1.

**Acciones:**

1. `composition.suggestedLabel` trae la etiqueta que sale de aplicar las heurísticas en orden.
2. Contrástala con la matriz de [COMPOSITION-HEURISTICS.md](./references/COMPOSITION-HEURISTICS.md)
   usando `composition.signals`.
3. Solo cámbiala si hay evidencia que la contradiga, y entonces **explica por qué** en el reporte.

**Criterio de paso:** 1 etiqueta de 7 con 2 evidencias concretas citadas desde `signals`.

---

### Paso 3 — Entrypoints

**Entrada:** `entrypoints` del JSON del Paso 1.

**Acciones:** para cada subpath, registra `subpath → archivo → formato` y el valor de
`inTarball`. Un `false` es un gap real: el paquete declara algo que no publicó.

Los subpaths con `wildcard: true` no son archivos concretos; usa `matches` para decir cuántos
archivos satisfacen el patrón. **Nunca los reportes como gap.**

**Criterio de paso:** ≥1 entrypoint mapeado; cada `inTarball: false` con su `Reason:`.
[Detalle →](./references/ENTRYPOINTS-MAP.md)

---

### Paso 4 — Tipos

**Entrada:** `types` del JSON del Paso 1.

**Acciones:** `types.suggestedLabel` ya aplica el árbol de decisión, incluida la consulta a
`@types/<pkg>` con la transformación de scope. Verifica `types.brokenTypeDeclarations`: si
tiene entradas, el paquete declara tipos que no publicó y eso es un gap crítico.

**Criterio de paso:** etiqueta asignada con evidencia (ruta del `.d.ts`, versión de `@types`, o gap).
[Detalle →](./references/TYPES-RESOLUTION.md)

---

### Paso 5 — API pública

**Acciones:**

```bash
node scripts/extract_api.mjs <pkg>@<rango> --pretty
```

Devuelve, por entrypoint con tipos: `symbols` (públicos), `deprecatedExcluded`,
`internalOmitted`, `followedFiles` (re-exports seguidos) y `gaps`.

- Reporta el conteo público y menciona cuántos se excluyeron por `@deprecated`: esa cifra suele
  ser la respuesta a "¿por qué la guía que vi no funciona?".
- Si `symbolsTruncated > 0` o hay `entrypointsOmitted`, dilo; no presentes la lista como completa.
- Para un subpath concreto usa `--subpath "./loquesea"`.

**Criterio de paso:** ≥1 entrypoint con símbolos listados, o `Untyped` justificado.
[Detalle →](./references/PUBLIC-API-SHAPE.md)

---

### Paso 6 — Instalación y uso

**Entrada:** `install` del JSON del Paso 1.

**Acciones:** usa `install.command` (ya lleva la versión resuelta, sin `--registry`),
`install.peers` con sus rangos y su marca `optional`, y `install.engines`.

Sobre `install.readmeSnippet`: es un bloque de código extraído del README **publicado**.
Preséntalo como lo que es. Si es `null`, no inventes un ejemplo: di que el paquete no trae
uno y apóyate en los símbolos del Paso 5 y en las condiciones del entrypoint para describir
la forma del import correcta.

**Criterio de paso:** comando de instalación + peers + forma de import.

---

### Paso 7 — Reporte

Imprime el bloque `LIB-REPORT:` en el chat siguiendo
[REPORT-FORMAT.md](./references/REPORT-FORMAT.md). No escribas ningún archivo.

**Criterio de paso:** reporte completo, cada gap con su `Reason:`, `Assessment` honesto.

---

## Criterio de finalización

- ✅ **Resolución:** rango → versión resuelta + tarball
- ✅ **Integridad:** shasum verificado, 0 archivos a disco
- ✅ **Composición:** 1 de 7 etiquetas con 2 evidencias
- ✅ **Entrypoints:** ≥1 subpath verificado contra el tarball
- ✅ **Tipos:** `Bundled-Types | Via-DefinitelyTyped | Untyped`
- ✅ **API:** símbolos sin `@deprecated`, con el conteo de excluidos
- ✅ **Instalación:** comando + peerDeps + forma de import
- ✅ **Reporte:** tabla resumen + gaps + `PRAGMATICALLY COMPLETE | COMPLETE | INCOMPLETE`

## Alcance

Esta skill analiza **una versión resuelta a la vez**. Comparar dos versiones o generar ejemplos
de uso sintetizados a partir de las firmas de tipos queda fuera: si te lo piden, dilo en lugar
de improvisarlo.

---

## Referencias

- **[PRIVATE-REGISTRY.md](./references/PRIVATE-REGISTRY.md)** — registry privado vía `.npmrc`/env
- **[COMPOSITION-HEURISTICS.md](./references/COMPOSITION-HEURISTICS.md)** — matriz de 7 etiquetas y evidencias
- **[ENTRYPOINTS-MAP.md](./references/ENTRYPOINTS-MAP.md)** — cómo se resuelven `exports` y los fallback legacy
- **[TYPES-RESOLUTION.md](./references/TYPES-RESOLUTION.md)** — árbol Bundled vs DefinitelyTyped vs Untyped
- **[PUBLIC-API-SHAPE.md](./references/PUBLIC-API-SHAPE.md)** — qué cuenta como API pública y qué se excluye
- **[TOOLCHAIN.md](./references/TOOLCHAIN.md)** — contrato de los scripts y herramientas opcionales
- **[REPORT-FORMAT.md](./references/REPORT-FORMAT.md)** — plantilla del reporte y checklist
