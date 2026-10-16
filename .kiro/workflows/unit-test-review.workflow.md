# Workflow: Revisar y Completar Tests

Eres un experto en testing frontend. Tu objetivo es auditar tests existentes, generar los que faltan, ejecutarlos y confirmar que pasan — siguiendo los patrones exactos del proyecto.

---

## Telemetría — Metadatos del workflow

| Campo | Valor |
|---|---|
| `workflow-id` | `unit-test-review` |
| `user-story-id` | *(suministrado por ejecución)* |
| Step IDs | `detectar-stack`, `preguntas`, `auditoria`, `resumen-confirmar`, `ejecutar-tests`, `generar-reporte`, `notificar` |

> **REGLA NO NEGOCIABLE:** Todos los comandos `pragma-ai workflow ...` en este documento son de **ejecución OBLIGATORIA**. El agente DEBE ejecutarlos siempre — no son sugerencias ni documentación.
> Cada step finaliza con un **human approval gate** antes de continuar; el **gap report solo se ejecuta en steps que generan archivos de salida** (`--output-file`) — aquí: `resumen-confirmar` (spec) y `generar-reporte`. Orden no negociable: `finished` → aprobación humana → gap report → siguiente `started`.
> Los comandos asumen que el cwd del shell ya es la raíz del proyecto (`--project-dir` solo importa si se ejecuta desde otro lugar).

---

## Setup — Crear instancia del workflow

> ⚡ **OBLIGATORIO** — Ejecutar SIEMPRE al inicio antes de cualquier step.

### Resolver user-story-id (obligatorio)

El agente DEBE obtener el `user-story-id` antes de ejecutar `workflow create`. Orden de resolución:

1. **Contexto de sesión:** Si ya se proporcionó en esta sesión (flujo principal u otro sub-workflow), reutilizarlo sin preguntar.
2. **Archivo de proyecto:** Si existe `output/.active-user-story`, leer el ID de ahí.
3. **Preguntar al usuario:** Si no se puede resolver por ninguna de las anteriores, solicitar explícitamente:

```
Kratos: Para trackear el progreso necesito el user-story-id.
  ¿Cuál es la historia de usuario activa? (ej: US-12345, HU-678)
```

> Una vez obtenido, el agente DEBE persistirlo en `output/.active-user-story` para que otros workflows lo hereden.

```bash
# Persistir para otros workflows
echo "$USER_STORY_ID" > output/.active-user-story

# Crear instancia
INSTANCE_ID=$(pragma-ai workflow create \
  --workflow-id unit-test-review \
  --user-story-id "$USER_STORY_ID")
```

---

## Inputs — Definition of Ready (DoR)

Antes de iniciar, el workflow recopila automáticamente o pregunta lo mínimo necesario:

| Input | Fuente |
|-------|--------|
| **Stack del proyecto** | Detectado de `package.json` automáticamente |
| **Archivo de implementación** | Path provisto por el dev, o preguntado si no se mencionó |
| **Spec existente** | Detectado automáticamente (`*.spec.ts` / `*.test.tsx`) |
| **Estilo de tests del equipo** | 2 specs existentes del proyecto leídas automáticamente |
| **Cobertura mínima objetivo** | Detectada de `jest.config.*` / `karma.conf.*` / `angular.json` — o preguntada al dev |

---

## Outputs — Definition of Done (DoD)

El workflow está completo cuando se cumplen **todos** estos criterios:

| Output | Descripción |
|--------|-------------|
| **Spec corregido y completado** | Archivo actualizado directamente con tests nuevos y correcciones |
| **Tests ejecutados y pasando** | `npm test` / `ng test` corre sin errores antes de cerrar |
| **Cobertura ≥ objetivo** | Todos los métodos públicos y signals/computed cubiertos |
| **Reporte generado** | `reports/unit-test-review.md` con métricas, tabla de cobertura y resultados de ejecución |
| **Siguiente paso sugerido** | `/code-reviewer` para calidad del código fuente |

---

## Paso 1 — Detectar stack y leer contexto

> ⚡ **OBLIGATORIO** — Reportar `started` al iniciar este step.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id detectar-stack --status started
> ```

### 1a. Detectar stack automáticamente

Leer `package.json` y determinar:

```
@angular/core presente   → stack: Angular
react + react-dom        → stack: React
next presente            → stack: Next.js
```

Leer skills instalados según stack:
- Angular: `.claude/skills/angular-developer/SKILL.md`
- React/Next.js: `.claude/skills/react-best-practices/SKILL.md`

### 1b. Leer el archivo de implementación

**Antes de ver el spec**, leer el archivo fuente (`.ts`, `.tsx`, `.component.ts`) para entender:

- Todos los métodos públicos que deben tener tests
- Signals, computed, inputs, outputs en Angular
- Props, hooks internos, eventos emitidos en React
- Casos de error y estados de carga presentes en el código

### 1c. Detectar spec existente

Buscar automáticamente:

- Angular: `{nombre}.spec.ts`
- React: `{nombre}.test.tsx` o `{nombre}.test.ts`

Si no existe → crearlo desde cero siguiendo el estilo del equipo.

### 1d. Leer estilo del equipo

Buscar 2 specs existentes para aprender las convenciones:

- Angular: `src/**/presentation/**/*.spec.ts` (excluir `node_modules`)
- React: `src/**/*.test.tsx` (excluir `node_modules`)

> ⚡ **OBLIGATORIO** — Reportar `finished` al detectar stack, leer implementación, spec existente y estilo del equipo.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id detectar-stack --status finished
> ```
>
> **Stop aquí.** Obtener aprobación humana (ver *Human approval gate*). Una vez aprobado, continuar con Paso 2. *(Sin archivos de salida — no requiere gap report.)*

---

## Paso 2 — Preguntar solo lo necesario

> ⚡ **OBLIGATORIO** — Reportar `started` al iniciar este step.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id preguntas --status started
> ```

Si el dev no mencionó el archivo a revisar:

> ¿Qué archivo quieres revisar?
>
> Ejemplo: `src/app/presentation/pages/payments/payment-form.component.ts`

Detectar si hay cobertura mínima configurada:

- `jest.config.*` → `coverageThreshold`
- `karma.conf.*` → `coverageReporter`
- `angular.json` → `codeCoverage: true`

Si **no hay configuración**, preguntar una sola vez:

> ¿Qué cobertura mínima buscas?
>
> - **Básica (70%)** — métodos principales cubiertos
> - **Estándar (80%)** — recomendado para producción
> - **Exhaustiva (100%)** — todos los casos incluyendo errores

**Máximo 2 preguntas. No preguntar más.**

> ⚡ **OBLIGATORIO** — Reportar `finished` al resolver archivo objetivo y cobertura mínima.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id preguntas --status finished
> ```
>
> **Stop aquí.** Obtener aprobación humana (ver *Human approval gate*). Una vez aprobado, continuar con Paso 3. *(Sin archivos de salida — no requiere gap report.)*

---

## Paso 3 — Auditoría

> ⚡ **OBLIGATORIO** — Reportar `started` al iniciar este step.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id auditoria --status started
> ```

### Para componentes Angular

- ¿Falta test de estado inicial?
- ¿Falta test por cada `input()` / `@Input()`?
- ¿Falta test por cada método público?
- ¿Usa `detectChanges()` en vez de `await whenStable()`? → corregir
- ¿Hace `querySelector` directo en vez de harness? → migrar a harness
- ¿Solo testea la clase pero no el template?

### Para ViewModels Angular

- ¿Falta test de cada `signal()` y `computed()`?
- ¿No testea estado de error?
- ¿No testea estado de loading?

### Para UseCases

- ¿Falta test con gateway mock?
- ¿No testea el observable / promise?
- ¿No testea error del gateway?

### Para componentes React

- ¿Usa `querySelector` en vez de queries semánticas de RTL?
- ¿Usa `fireEvent` en vez de `userEvent`?
- ¿Falta test de estado inicial?
- ¿Falta test de cada prop relevante?
- ¿Falta test de interacciones del usuario?

### Para hooks React

- ¿Usa `renderHook` correctamente?
- ¿Testea estado inicial?
- ¿Testea actualizaciones de estado tras acciones?

---

## Reglas Angular (obligatorias)

- Patrón: **Act → `await fixture.whenStable()` → Assert**
- NUNCA `fixture.detectChanges()` manual
- Usar `ComponentHarness` del Angular CDK para interacciones DOM
- NUNCA mockear `Router` directamente — usar `RouterTestingHarness`
- Un `describe` por clase, un `it` por comportamiento observable

## Reglas React (obligatorias)

- `render()` + queries semánticas (`getByRole`, `getByText`, `getByLabelText`)
- `userEvent` para interacciones — NUNCA `fireEvent`
- `renderHook` para hooks — NUNCA testar internals
- Assertions con `expect().toBeInTheDocument()`, `expect().toHaveValue()`, etc.
- NUNCA `container.querySelector` — si lo necesitas, falta un role/aria

> ⚡ **OBLIGATORIO** — Reportar `finished` al completar la auditoría de los tests existentes y faltantes.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id auditoria --status finished
> ```
>
> **Stop aquí.** Obtener aprobación humana (ver *Human approval gate*). Una vez aprobado, continuar con Paso 4. *(Sin archivos de salida — no requiere gap report.)*

---

## Paso 4 — Mostrar resumen y confirmar

> ⚡ **OBLIGATORIO** — Reportar `started` al iniciar este step (abarca la confirmación y la escritura del spec).
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id resumen-confirmar --status started
> ```

Antes de escribir cualquier archivo, mostrar:

```
◆ Tests a agregar/corregir en payment-form.component.spec.ts:

  Existentes:  3 tests
  A corregir:  1  (detectChanges → whenStable en línea 42)
  A agregar:   5  casos faltantes
    + estado inicial: isLoading signal = false
    + error cuando el UseCase falla
    + loading = true durante la llamada async
    + emit del outputEvent al completar
    + template: botón deshabilitado cuando isLoading = true

  Cobertura estimada tras cambios: ~85% (objetivo: 80%)

  ¿Confirmas? (s/n)
```

Solo escribir los archivos tras confirmación explícita.

> ⚡ **OBLIGATORIO (camino exitoso)** — Reportar `finished` con el spec creado/actualizado. Declarar la ruta real del spec:
>
> ```bash
> # Ajustar la ruta al spec realmente escrito
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id resumen-confirmar --status finished \
>   --output-file src/**/{nombre}.spec.ts
> ```
>
> **Stop aquí.** Obtener aprobación humana (ver *Human approval gate*). Una vez aprobado, ejecutar el **gap report** de `resumen-confirmar` (genera archivo — ver *Gap calculation & reporting*), luego continuar con Paso 5.

---

## Paso 5 — Ejecutar los tests

> ⚡ **OBLIGATORIO** — Reportar `started` al iniciar este step.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id ejecutar-tests --status started
> ```

Después de escribir los archivos, ejecutar los tests para verificar que pasan:

**Angular:**
```bash
ng test --include="**/payment-form.component.spec.ts" --watch=false --code-coverage
```

**React / Next.js:**
```bash
npx jest payment-form.test.tsx --coverage --watchAll=false
```

Si algún test falla:
1. Mostrar el error exacto al dev
2. Analizar la causa (implementación incorrecta del test o bug en el código)
3. Corregir y re-ejecutar
4. Repetir hasta que **todos los tests pasen**

**No marcar el workflow como completo hasta que todos los tests pasen.**

> ⚡ **OBLIGATORIO (condicional)** — Si tras corregir y reintentar los tests siguen fallando de forma irrecuperable y el workflow se detiene:
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id ejecutar-tests --status failed
> ```
> ❌ El workflow se detiene aquí.

> ⚡ **OBLIGATORIO (camino exitoso)** — Reportar `finished` cuando todos los tests pasan.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id ejecutar-tests --status finished
> ```
>
> **Stop aquí.** Obtener aprobación humana (ver *Human approval gate*). Una vez aprobado, continuar con Paso 6. *(Sin archivos de salida — no requiere gap report.)*

---

## Paso 6 — Generar reporte

> ⚡ **OBLIGATORIO** — Reportar `started` al iniciar este step.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id generar-reporte --status started
> ```

Generar `reports/unit-test-review.md`:

```markdown
# Unit Test Review — {Nombre del archivo}

**Fecha:** {fecha}
**Stack:** {Angular / React / Next.js}
**Archivo revisado:** {path completo}
**Spec:** {path del spec}

## Resumen

| Métrica | Valor |
|---------|-------|
| Tests existentes | X |
| Tests corregidos | Y |
| Tests agregados | Z |
| Total final | X+Z |
| Cobertura estimada | XX% |
| Objetivo de cobertura | XX% |
| Estado | ✅ Objetivo alcanzado / ⚠️ Por debajo del objetivo |

## Cobertura por método / comportamiento

| Método / Comportamiento | Test | Estado |
|------------------------|------|--------|
| estado inicial | it("should initialize with isLoading = false") | ✅ existente |
| manejo de error | it("should set error when UseCase fails") | ✅ agregado |
| estado de loading | it("should set isLoading = true during call") | ✅ agregado |

## Ejecución

✅ X/X tests passing — 0 failures
```

> ⚡ **OBLIGATORIO (camino exitoso)** — Reportar `finished` con el reporte generado:
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id generar-reporte --status finished --output-file reports/unit-test-review.md
> ```
>
> **Stop aquí.** Obtener aprobación humana (ver *Human approval gate*). Una vez aprobado, ejecutar el **gap report** de `generar-reporte` (genera archivo), luego continuar con Paso 7.

---

## Paso 7 — Notificar y sugerir siguiente paso

> ⚡ **OBLIGATORIO** — Reportar `started` al iniciar este step.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id notificar --status started
> ```

```
✔ {X} tests existentes revisados, {Y} corregidos, {Z} agregados
✔ Todos los tests pasan (X/X)
✔ Cobertura: XX% (objetivo: XX%)
✔ Reporte generado: reports/unit-test-review.md

Siguiente paso sugerido:
→ /code-reviewer   para revisar calidad del código fuente del componente
```

> ⚡ **OBLIGATORIO** — Reportar `finished` al notificar y sugerir el siguiente paso.
>
> ```bash
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id notificar --status finished
> ```
>
> **Stop aquí.** Obtener aprobación humana (ver *Human approval gate*). Una vez aprobado, el workflow está completo. *(Sin archivos de salida — no requiere gap report.)*

---

## Human approval gate

> ⚡ **OBLIGATORIO** — Se ejecuta SIEMPRE después de cada `finished`. No se puede omitir ni inferir aprobación del silencio.

Al finalizar cada step, presentar el resultado y solicitar aprobación **explícita**:

```
Agente: He completado [nombre del step]. ¿Apruebas el resultado?
  1. ✅ Aprobado — continuar
  2. ✏️ Ajustes — indicar qué cambiar
  3. ❌ Rechazado — rehacer desde cero
```

- **Si aprueba:** Si el step genera archivos (`resumen-confirmar`, `generar-reporte`), proceder al gap report y luego al siguiente step. Si no genera archivos, pasar directamente al siguiente step.
- **Si solicita ajustes:** Aplicar los cambios, mantener `finished`, volver a presentar para aprobación.
- **Si rechaza:** Reportar `re_started`, regenerar, reportar `finished` de nuevo, reiniciar el gate.

> ⚡ **OBLIGATORIO** — En caso de rechazo:
>
> ```bash
> # 1. Reportar re_started
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id <step-id> --status re_started
> # 2. ... regenerar el artefacto ...
> # 3. Reportar finished de nuevo (recaptura baseline si hay --output-file)
> pragma-ai workflow report --instance-id "$INSTANCE_ID" --workflow-id unit-test-review --step-id <step-id> --status finished
> # 4. Reiniciar el approval gate
> ```

---

## Gap calculation & reporting (por step)

> ⚡ **OBLIGATORIO solo para steps con archivos de salida.** En este workflow: **`resumen-confirmar`** (el spec) y **`generar-reporte`** (`reports/unit-test-review.md`).
> Ejecutar inmediatamente después de que el approval gate de cada uno de esos steps sea aprobado — no batchear al final.

**Fase A — Generar gap report (repetir por cada step con archivos):**
```bash
pragma-ai workflow gap-report --instance-id "$INSTANCE_ID" --step-id resumen-confirmar
```

**Fase B — Enviar gap report:**
```bash
pragma-ai workflow gap-report --instance-id "$INSTANCE_ID" --step-id resumen-confirmar --submit --report-id <id-del-reporte> --summary "<resumen del gap detectado o 'sin cambios'>"
```

---

## Progress reporting (a nivel de instancia)

Usar en cualquier momento para consultar el estado general:

```bash
pragma-ai workflow list --user-story-id <user-story-id>
pragma-ai workflow status "$INSTANCE_ID"
```

---

## Resumen de comandos para este workflow

| Comando | Cuándo |
|---|---|
| `pragma-ai workflow create --workflow-id unit-test-review --user-story-id <id>` | Al inicio, una vez |
| `pragma-ai workflow report ... --status started` | Al iniciar cada step |
| `pragma-ai workflow report ... --status finished [--output-file <archivos>]` | Al completar cada step (`--output-file` en `resumen-confirmar` y `generar-reporte`) |
| `pragma-ai workflow report ... --status failed` | Si `ejecutar-tests` falla irrecuperablemente |
| `pragma-ai workflow report ... --status re_started` | Si el humano rechaza y se rehace el step |
| `pragma-ai workflow gap-report --instance-id "$INSTANCE_ID" --step-id <step>` | Tras aprobación de un step con archivos (Fase A) |
| `pragma-ai workflow gap-report ... --submit --report-id <id> --summary "<text>"` | Después de Fase A (Fase B) |
| `pragma-ai workflow list --user-story-id <id>` | Consultar progreso general |
| `pragma-ai workflow status "$INSTANCE_ID"` | Consultar detalle de la instancia |