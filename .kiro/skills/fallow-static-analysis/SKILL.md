---
name: fallow-static-analysis
description: 'Deja un proyecto JS/TS (cualquier arquitectura: single-repo o monorepo) configurado con Fallow para análisis estático determinista, con scripts locales para ver qué trabajar y un gate de CI que impide subir código malo (dead code, exports/dependencias sin usar, ciclos, complejidad/CRAP, duplicación). Actívala cuando se pida "configurar Fallow", "detectar código muerto", "medir complejidad/CRAP", "poner un gate de calidad en CI", "que el PR no pase si queda algo mal", o "auditar exports/dependencias sin uso".'
---
# Fallow — análisis estático que impide subir código malo

Fallow analiza el grafo real de módulos y encuentra lo que ESLint no ve a nivel de
proyecto: archivos y exports muertos, dependencias sin usar, ciclos, complejidad
(cyclomatic / cognitive / **CRAP**) y duplicación. Es determinista y rápido.

**Meta de esta skill:** dejar el proyecto configurado para que (1) el dev vea
localmente qué hay que arreglar y (2) el CI **bloquee el merge** si el cambio
introduce código malo. Aplica a **cualquier arquitectura** — un solo paquete o un
monorepo.

## Cuándo usar esta skill

- Un proyecto JS/TS (app única, librería o monorepo) sin red que atrape dead code
  y deuda técnica.
- Quieres prevención real: que el código malo **no llegue a main**.
- Quieres medir complejidad con contexto de cobertura (CRAP = complejidad × falta
  de tests).

---

## 1. Instalar

```bash
pnpm add -D fallow      # o npm i -D fallow / yarn add -D fallow
```

## 2. Configuración: `.fallowrc.json`

Fallow necesita saber por dónde entra tu código; con eso construye el grafo de
alcanzabilidad. Config mínima para un proyecto de una sola app:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/fallow-rs/fallow/main/schema.json",

  // Puntos de entrada REALES. Sin esto, Fallow no sabe qué es alcanzable
  // y marca todo como muerto. Ajusta a tu arquitectura:
  //   - app front:  "src/main.tsx" / "src/index.tsx"
  //   - servicio:   "src/index.ts" / "src/server.ts"
  //   - CLI/lib:    el/los entry(s) del bin o el barrel público
  "entry": ["src/index.ts"],

  // Ruido que no debe analizarse.
  "ignorePatterns": [
    "**/dist/**", "**/build/**", "**/coverage/**",
    "**/*.generated.ts", "**/*.test.ts", "**/*.test.tsx"
  ],

  // Módulos cargados dinámicamente (lazy routes, plugins) → no son dead code.
  "dynamicallyLoaded": ["src/pages/**/*.tsx"],

  // Exports usados por convención (design system, barrels) que el grafo no
  // resuelve. Suprimir SOLO falsos positivos confirmados, no para callar.
  "ignoreExports": [],

  // Deps que existen a propósito aunque el grafo no las "vea".
  "ignoreDependencies": [],

  "rules": {
    "unused-files": "error",
    "unused-exports": "error",
    "unused-types": "error",
    "circular-dependencies": "error",
    "duplicate-exports": "error",
    "unused-dependencies": "error"
  },

  // Umbrales de salud. CRAP combina complejidad ciclomática con cobertura.
  "health": { "maxCyclomatic": 25, "maxCognitive": 25, "maxCrap": 50 },
  "duplicates": { "minLines": 50 }
}
```

## 3. Scripts locales (ver qué hay que trabajar)

```json
{
  "scripts": {
    "fallow": "fallow",
    "fallow:audit": "fallow audit",
    "fallow:fix": "fallow fix",
    "fallow:coverage": "npm test -- --coverage && fallow audit"
  }
}
```

Uso diario:
- `npm run fallow:audit` → **la foto**: qué está muerto, qué es circular, qué está
  muy complejo. Es lo que corres antes de abrir un PR.
- `npm run fallow:fix` → aplica correcciones automáticas seguras (p. ej. eliminar
  exports muertos).
- `npm run fallow:coverage` → corre tests con cobertura y audita, para que el
  análisis **CRAP** use datos de cobertura reales.

### Prevención local (opcional pero recomendado): pre-push hook

Frena el código malo antes de que salga de tu máquina. Con Husky:

```bash
# .husky/pre-push
npm run fallow:audit
```

Así el push falla localmente si introduces dead code o superas los umbrales, sin
esperar al CI.

---

## 4. Gate de CI — que el PR no pase si queda algo mal

El objetivo real: **branch protection** que exija que Fallow pase. Versión simple
(un solo paquete):

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request, push]

jobs:
  fallow:
    name: Fallow — static analysis
    runs-on: ubuntu-latest
    permissions: { contents: read, pull-requests: write }
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0            # historial completo → análisis de churn/hotspots (git log)

      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test -- --coverage --passWithNoTests   # genera coverage-final.json para CRAP

      - name: Run Fallow
        uses: fallow-rs/fallow@v2
        with:
          command: audit
          gate: new-only           # ← solo falla si ESTE cambio introduce issues nuevos
          comment: true            # resumen en el PR
          review-comments: true    # comentarios inline en las líneas afectadas
          annotations: true        # anotaciones en la pestaña Checks
          coverage: 'coverage/coverage-final.json'
```

Luego, en **Settings → Branches → Branch protection**, marca el check de Fallow
como *required status check*. Con eso, **ningún PR con código malo nuevo se
mergea**.

### El detalle que hace viable la adopción: `gate: new-only`

En una base existente hay deuda pre-existente. Si el gate fallara por todo, nadie
podría mergear. `gate: new-only` **solo bloquea si el cambio introduce issues
nuevos**; la deuda vieja queda visible pero no frena el merge. Así lo adoptas en un
repo real desde el día uno.

---

## 5. Monorepo (sección opcional avanzada)

Si tienes varios paquetes, cambia solo dos cosas:

1. **`entry` con los puntos de entrada de cada app/paquete**:
   ```jsonc
   "entry": ["apps/web/src/main.tsx", "apps/api/src/index.ts"]
   ```
2. **Fusiona la cobertura de cada paquete** antes de pasarla a Fallow (para que
   CRAP la considere completa):
   ```yaml
   - name: Merge coverage reports
     run: |
       files=()
       [ -f apps/api/coverage/coverage-final.json ]  && files+=(apps/api/coverage/coverage-final.json)
       [ -f apps/web/coverage/coverage-final.json ]  && files+=(apps/web/coverage/coverage-final.json)
       case ${#files[@]} in
         0) echo '{}' > merged-coverage.json ;;
         1) cp "${files[0]}" merged-coverage.json ;;
         *) jq -s '.[0] * .[1]' "${files[@]}" > merged-coverage.json ;;
       esac
   # luego pasa coverage: 'merged-coverage.json' al step de Fallow
   ```

El resto (gate, comments, branch protection) es idéntico.

---

## Política de warnings

- **Corrige, no suprimas.** Un warning de Fallow es señal, no ruido.
- **Suprimir solo falsos positivos confirmados**, explícitos en `ignoreExports` /
  `ignoreDependencies` / `dynamicallyLoaded` — nunca con un ignore genérico para
  callar el linter.
- La deuda pre-existente (complejidad/duplicación) se documenta como baseline y se
  ataca en PRs pequeñas con tests primero, no refactorizando a ciegas para bajar un
  umbral.

## Antipatrones a evitar

- ❌ Correr Fallow sin `entry` bien definido → marca medio repo como muerto.
- ❌ `gate: all` en un repo con deuda pre-existente → CI siempre rojo, se ignora.
- ❌ Suprimir warnings con ignores amplios en vez de arreglar la causa.
- ❌ `fetch-depth: 1` → rompe el análisis de churn/hotspots (necesita git log).
- ❌ Correr CRAP sin cobertura → el número pierde sentido.

## Checklist de adopción

- [ ] `fallow` instalado como devDependency.
- [ ] `.fallowrc.json` con `entry` reales + `ignorePatterns` de build/generados/tests.
- [ ] `dynamicallyLoaded` para lazy routes; `ignoreDependencies` para deps especiales.
- [ ] Scripts locales `audit` / `fix` / `coverage` en `package.json`.
- [ ] (Opcional) pre-push hook que corre `fallow:audit`.
- [ ] Job de CI con `fetch-depth: 0`, cobertura, `command: audit`, `gate: new-only`.
- [ ] Check de Fallow marcado como **required** en branch protection.
- [ ] Supresiones solo para falsos positivos confirmados.