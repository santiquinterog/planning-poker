# Public API Shape — Qué cuenta como API pública

> API pública = lo que un consumidor puede importar desde un entrypoint declarado,
> excluyendo lo marcado `@deprecated` y lo que la librería considera interno.

`extract_api.mjs` produce esta lista. Este documento explica sus criterios y sus límites.

## Qué entra y qué no

- ✅ `export declare function x` / `export interface X` / `export type X` / `export class X`
- ✅ `export { A, B as C }` — se registra el nombre expuesto (el alias, si lo hay)
- ✅ `export * from "./x"` — se sigue dentro del tarball
- ❌ Cualquier símbolo cuyo JSDoc inmediato contenga `@deprecated` → va a `deprecatedExcluded`
- ❌ Símbolos internos por convención (prefijo `ɵ` de Angular, `__`, `_Mayúscula`) → `internalOmitted`
- ❌ Re-exports desde rutas `internal/`, `_internal`, `__private`

## El filtro `@deprecated`

Se busca el bloque JSDoc **inmediatamente anterior** al símbolo: entre el `*/` y la declaración
solo puede haber espacios en blanco.

Esto importa. Una ventana ciega de N caracteres hacia atrás marca como obsoleto al símbolo que
viene después de uno deprecado, que es exactamente el error que hace inútil el filtro en
archivos densos como `index.d.ts` de un framework.

El conteo de `deprecatedExcluded` merece salir en el reporte: suele explicar por qué un ejemplo
encontrado en internet ya no compila.

## Re-exports

`export * from "./x"` se resuelve dentro del tarball probando `x.d.ts`, `x.d.mts`, `x.d.cts` y
`x/index.d.ts`, con profundidad máxima 6 y guarda contra ciclos. Los archivos visitados salen en
`followedFiles`.

Solo queda gap cuando el destino está fuera del paquete:

```
Reason: re-export hacia paquete externo "otra-lib": símbolos no trazados
```

## Límites del método

El listado sale de expresiones regulares sobre los `.d.ts`, no de un AST. Consecuencias que hay
que declarar en el reporte cuando apliquen:

- No se resuelven tipos condicionales, genéricos ni sobrecargas: se lista el nombre, no la firma
- `export default` aparece como el símbolo `default`, sin resolver a qué apunta
- `symbolsTruncated > 0` significa que la lista mostrada está recortada
- `entrypointsOmitted` significa que hay más subpaths sin listar (usa `--top` o `--subpath`)

Fuente a citar: `Reason: símbolos listados por regex sobre .d.ts, excluye @deprecated`.

## Alternativa con ts-morph

Solo si el proyecto **ya** tiene `ts-morph` instalado. No lo instales para esto.

```ts
import { Project } from "ts-morph";
const project = new Project({ useInMemoryFileSystem: true });
const sf = project.createSourceFile("index.d.ts", dtsContent);
for (const [name, decls] of sf.getExportedDeclarations()) {
  const dep = decls.some((d) =>
    d.getJsDocs?.().some((j) => j.getTags().some((t) => t.getTagName() === "deprecated"))
  );
  if (!dep) console.log(name);
}
```

## Si el tarball trae api-extractor

Si existe `etc/<pkg>.api.md` dentro del tarball, esa es la API canónica declarada por el autor:
úsala como fuente prioritaria y dilo en el reporte.

## Checklist

- [ ] Cada entrypoint con tipos tiene su lista (o `0 símbolos` con su razón)
- [ ] Conteo de `@deprecated` excluidos reportado
- [ ] `internalOmitted` mencionado si es > 0
- [ ] Truncamientos declarados, nunca presentados como lista completa
- [ ] Método anotado como fuente
