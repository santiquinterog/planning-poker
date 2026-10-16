# Clean Architecture para React (view → service → adapter)

Organiza una app React por **bounded-contexts** (features) y separa cada uno en
tres capas con una regla de dependencia clara. El objetivo: que la UI no conozca
vendors, que la lógica de negocio sea testeable sin render, y que cambiar una
integración (tRPC → otra) no toque componentes.

## Regla de oro

```
view layer      → componentes, páginas — solo UI, sin SDKs de vendor
service layer   → lógica de caso de uso, transiciones de estado, flujos con política
adapter layer   → cliente tRPC, storage, SDKs de push, analytics
```

**Los componentes nunca importan SDKs de vendor directamente.** Toda integración
externa pasa por la capa adapter/service. La dependencia siempre apunta hacia
adentro: `view → service → adapter`, nunca al revés.

## Organización por bounded-context

Cada feature es una carpeta autocontenida; lo transversal vive en `shared/`:

```
src/
  contexts/
    visits/
      VisitsPage.tsx            # view: página
      VisitList.tsx             # view: componentes
      components/               # view: sub-componentes de la feature
      hooks/
        useVisitDetailVm.ts     # service: view-model (estado + casos de uso)
      visit-list-helpers.ts     # lógica pura, testeable sin React
      visit-list-helpers.test.ts
    reservations/
    payments/
  shared/
    ui/                         # componentes reutilizables (design system)
    api/                        # adapter: cliente tRPC
    store/                      # estado global (stores)
    hooks/  lib/  types/
```

Convenciones:
- Un contexto no importa de otro contexto; lo común sube a `shared/`.
- La **lógica pura** (cálculos, mapeos, validaciones de UI) vive en `*-helpers.ts`
  con su `*.test.ts` al lado. Sin React → test barato y rápido.
- Los **view-models** (`hooks/useXxxVm.ts`) concentran estado y orquestación; el
  componente solo renderiza lo que el hook expone.
- Alias `@/` → `src/`. Nunca rutas relativas de más de dos niveles.

## Disciplina de estado

Nunca leas `localStorage` / `sessionStorage` directo desde componentes. Todo el
estado global pasa por **stores** (p. ej. Zustand):

```tsx
const { role, userId } = useAuthStore();
const { selectedEntityId } = useAppStore();
```

Beneficio: una sola fuente de verdad, testeable y mockeable; el storage es un
detalle del adapter, no algo esparcido por la UI.

## Adopción incremental (importante y honesto)

En una base existente, los componentes suelen llamar al vendor (p. ej. `trpc`)
directo. **No hace falta reescribir todo de golpe:**

- **Features nuevas** → nacen ya con la separación en capas.
- **Código existente** → se refactoriza cuando se toca, no antes.

Regla práctica mientras no exista la capa service para un caso: se permite usar el
hook de datos directo, pero **encapsulado en el `useXxxVm`** del contexto, no
regado por varios componentes.

## Antipatrones a evitar

- ❌ Un componente que importa `@trpc`, el SDK de push o el storage directamente.
- ❌ Lógica de negocio dentro del JSX (mapeos/condiciones complejas en el render).
- ❌ Un contexto importando archivos de otro contexto (acople horizontal).
- ❌ Leer/escribir `localStorage` fuera de un store/adapter.
- ❌ Helpers de lógica pura sin test (si no tiene React, no hay excusa).

## Checklist por feature

- [ ] Carpeta propia bajo `contexts/`, sin depender de otros contextos.
- [ ] Componentes sin imports de vendor SDKs.
- [ ] Estado/orquestación en un `useXxxVm`; el componente solo renderiza.
- [ ] Lógica pura en `*-helpers.ts` con su `*.test.ts`.
- [ ] Estado global solo vía stores; cero acceso directo a storage.
- [ ] Lo reutilizable vive en `shared/`, no copiado entre contextos.

## Relación con otras skills

- Se combina con `trpc-zod-typesafe-api`: el cliente tRPC es un **adapter**; los
  componentes lo consumen a través del service/view-model, no directo.