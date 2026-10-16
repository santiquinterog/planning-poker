# Private Registry — El entorno ya lo resolvió

> Regla única: documentar, nunca inyectar. El terminal ya resolvió registry y auth vía `.npmrc`
> y variables de entorno antes de que esta skill se ejecute.

## Precedencia que npm aplica

1. Flag `--registry` en el comando (**evítalo siempre**)
2. `.npmrc` del proyecto y del usuario, más `NPM_TOKEN` / `NPM_CONFIG_REGISTRY`
3. Por defecto, `https://registry.npmjs.org`

Como los scripts nunca pasan `--registry`, el mismo comando funciona para un paquete público y
para uno privado. `meta.registry` en la salida refleja lo que `npm config get registry` devuelve,
y está ahí solo para dejar constancia en el reporte.

## Auth

| Método | Dónde vive | Qué hace la skill |
|---|---|---|
| variable de entorno | `NPM_TOKEN` | nada; npm la lee desde `.npmrc` |
| token en npmrc | `//host/:_authToken=${NPM_TOKEN}` | nada; ya resuelto |
| `_auth` legacy | `//host/:_auth=...` | nada; ya resuelto |

Los scripts enmascaran tokens y credenciales embebidas en cualquier mensaje de error antes de
emitirlo. Aun así, no pegues contenido de `.npmrc` en el reporte.

## Caso mixto: librería privada, tipos públicos

`@types/<pkg>` vive en el registry público. Si el registry privado está configurado como espejo,
la consulta funciona igual. Si no resuelve, **no fuerces el registry**: documenta el gap.

```
Reason: @types/<pkg> no resuelve desde el registry configurado
```

## Cuando la auth falla

Un `npm view` con 401 o 403 significa que el terminal no tiene credenciales válidas para ese
registry. No es algo que la skill deba arreglar.

Reporta el gap, marca `Assessment: INCOMPLETE` y detente. Nunca generes un `.npmrc`, nunca
construyas una línea `_authToken=`, nunca pidas el token para ponerlo en un comando.

## Qué no hacer

- No imprimir tokens ni volcar `.npmrc`
- No crear ni modificar `.npmrc`
- No pasar `--registry`
- No asumir `registry.npmjs.org` si `npm config get registry` devuelve otra cosa
