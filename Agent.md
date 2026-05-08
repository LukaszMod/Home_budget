---
name: AI Development Guidelines for Home Budget Project
description: Rules and patterns for AI-assisted code development in this TypeScript/React + Rust project
type: agent
applyTo: ["*.tsx", "*.ts", "*.rs", "*.md"]
---

# Home Budget — Agent Development Guidelines

This document provides guidelines for AI-assisted code development in the Home Budget project.

## Project Overview

- **Frontend**: React 18 + TypeScript + Vite + Material-UI (MUI)
- **Backend**: Rust + Axum web framework + PostgreSQL + SQLx
- **State Management**: Zustand (frontend), React Query for server state
- **Internationalization**: i18next (Polish as primary language)
- **UI Components**: Material-UI with custom Emotion styling
- **Forms**: React Hook Form with Zod validation

---

## Frontend Development Guidelines

### Structure & Organization

1. **File Organization** (follows existing structure):
   - Components grouped by functionality in `/frontend/src/components/`
   - Custom hooks in `/frontend/src/hooks/`
   - Pages in `/frontend/src/pages/`
   - API calls centralized in `/frontend/src/lib/api.ts`
   - Global store in `/frontend/src/store.ts`
   - Contexts in `/frontend/src/contexts/`

2. **Component Naming**:
   - PascalCase for React components (e.g., `AddOperationModal.tsx`)
   - camelCase for hooks with `use` prefix (e.g., `useOperations.ts`)
   - Descriptive names reflecting functionality
   - Separate files for each component (no multiple components per file)

### Component Patterns

1. **Functional Components**:
   - Always use functional components with hooks
   - Props interface defined above component (e.g., `AddOperationModalProps`)
   - Use destructuring for props

   ```typescript
   interface ComponentNameProps {
     open: boolean;
     onClose: () => void;
     data?: DataType[];
   }

   const ComponentName = ({ open, onClose, data }: ComponentNameProps) => {
     // component logic
   };

   export default ComponentName;
   ```

2. **Form Handling**:
   - Use React Hook Form + Zod for validation
   - Wrap with `FormProvider` for complex nested forms
   - Use `Controller` for MUI controlled components
   - Example pattern from `AddOperationModal`:
     ```typescript
     const methods = useForm<FormData>({
       defaultValues: { /* ... */ },
     });
     const { control, handleSubmit, reset, watch, setValue } = methods;
     ```

3. **State Management**:
   - Use **Zustand store** for UI state (theme, language, active tab)
   - Use **React Query** for server data fetching
   - Use **local state (useState)** for component-level UI state
   - Use **context** for cross-cutting concerns (DatePickerProvider, SettingsContext)

### Hooks Pattern

Custom hooks follow this structure:

```typescript
export const useCustomHook = () => {
  const qc = useQueryClient();
  const notifier = useNotifier();

  const query = useQuery<DataType[], Error>({
    queryKey: ['entityName'],
    queryFn: apiFunction,
    staleTime: 0,
  });

  const mutation = useMutation<ResponseType, Error, PayloadType>({
    mutationFn: (payload) => apiFunction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entityName'] });
      notifier.notify('Success message', 'success');
    },
  });

  return { query, mutation };
};
```

### Form Components

- Use **MUI TextField**, **Select**, **Autocomplete** for inputs
- Use **CalcTextField** for numeric calculation fields
- Use **DatePicker** from `@mui/x-date-pickers`
- Use custom **ControlledTextField**, **ControlledSingleSelect**, **CategoryAutocomplete** for consistent styling
- Always wrap forms in `<FormProvider>` when using Controller

### Styling

- **MUI system**: Use `sx` prop for inline styles or `styled` from `@emotion/styled`
- **Grid system**: Use MUI `Grid` for layout
- **Stack**: Use for flexbox layouts (rows/columns)
- **Box**: Use for generic containers
- Theme customization: Check `/frontend/src/theme.ts`

### Internationalization

- All user-facing text must use i18next translation keys
- Use `useTranslation()` hook: `const { t } = useTranslation();`
- All labels, buttons, error messages should be translated
- Translation keys follow pattern: `namespace:key`

Example:
```typescript
const { t } = useTranslation();
return <Button>{t('common:save')}</Button>;
```

### API Integration

- All API calls in `/frontend/src/lib/api.ts`
- Export types from API file (e.g., `type Operation`, `type Account`)
- Use proper TypeScript types for request/response payloads
- Handle errors with `notifier.notify(message, 'error')`

---

## Backend (Rust) Development Guidelines

### Project Structure

```
backend/
├── src/
│   ├── handlers/        # API route handlers
│   ├── models.rs        # Data models (FromRow, Serialize)
│   ├── routes.rs        # Route definitions
│   ├── main.rs          # Application entry point
│   └── utils.rs         # Helper functions
├── migrations/          # SQL migrations
└── Cargo.toml
```

### Code Patterns

1. **Models** (`models.rs`):
   - Use `#[derive(Serialize, FromRow)]` for database models
   - Use `#[derive(Deserialize)]` for request payloads
   - Use `sqlx::FromRow` for automatic SQL mapping
   - Handle field name mismatches with `#[sqlx(rename = "...")]`

   ```rust
   #[derive(Serialize, FromRow)]
   pub struct Operation {
       pub id: i32,
       pub amount: BigDecimal,
       pub description: String,
       #[sqlx(rename = "type")]
       pub r#type: String,
   }

   #[derive(Deserialize)]
   pub struct CreateOperation {
       pub amount: BigDecimal,
       pub description: String,
   }
   ```

2. **Handlers** (`handlers/*.rs`):
   - Use async/await with Tokio
   - Take `State` as parameter: `State(state): State<AppState>`
   - Return `Result<Json<T>, ApiError>`
   - Use transactions for multi-step operations

   ```rust
   pub async fn create_operation(
       State(state): State<AppState>,
       Json(payload): Json<CreateOperation>,
   ) -> Result<Json<Operation>, ApiError> {
       // handler logic
   }
   ```

3. **Database Operations**:
   - Use SQLx with compile-time checked queries
   - Use transactions for atomic operations
   - Use `sqlx::query_as!()` for type safety
   - Return `Result` with proper error handling

4. **Routes** (`routes.rs`):
   - Define all routes in Router builder
   - Group related routes (e.g., `/operations/...`)
   - Use proper HTTP methods (POST, PUT, DELETE, GET)

### Error Handling

- Define custom error types that implement `IntoResponse`
- Return meaningful error messages
- Use appropriate HTTP status codes (400, 404, 500, etc.)

---

## Common Patterns & Best Practices

### Query Invalidation

After mutations in React Query hooks:
```typescript
onSuccess: () => {
  qc.invalidateQueries({ queryKey: ['entityName'] });
  notifier.notify('Success message', 'success');
}
```

### Confirmation Dialogs

Use `ConfirmDialog` for destructive actions:
```typescript
const [confirmOpen, setConfirmOpen] = useState(false);

return (
  <>
    <Button onClick={() => setConfirmOpen(true)}>Delete</Button>
    <ConfirmDialog
      open={confirmOpen}
      onConfirm={() => { /* handle */ }}
      onCancel={() => setConfirmOpen(false)}
      title="Confirm"
      message="Are you sure?"
    />
  </>
);
```

### Loading States

- Use `isLoading` from React Query for UI feedback
- Show `CircularProgress` during loading
- Disable buttons during mutations: `disabled={mutation.isPending}`

### Error Handling

```typescript
if (query.isError) {
  return <Typography color="error">{query.error?.message}</Typography>;
}
```

---

## Features & Considerations

### Split Operations

- Supported for operations that span multiple categories
- Child operations inherit parent properties
- Use `SplitOperationDialog` for UI
- Parent-child relationships managed in database

### Asset System

- Multiple asset types: liquid, investments, real estate, vehicles, valuables, liabilities
- Transfers between assets tracked separately
- Asset valuations with history
- Investment transactions with history

### Automatic Account Balance

- Calculated via SQL triggers (not in code)
- Updated automatically after each operation
- Split operation children excluded from calculations

### URL Routing

- React Router for page navigation
- Bookmarking and history support
- Direct links to specific pages

---

## Testing Guidelines

### Frontend

- Component tests should verify:
  - Correct rendering with props
  - User interactions (clicks, form submissions)
  - API integration
- Use React Testing Library patterns

### Backend

- Test handlers with `#[tokio::test]`
- Use test database or mocks
- Verify correct HTTP responses
- Test error cases

---

## Git Workflow

1. **Commit Messages**: Descriptive, atomic commits
2. **Branch**: Feature branches for new work
3. **Testing**: Test before committing
4. **Push**: Regular pushes to origin

---

## Environment Setup

### Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql://user:password@localhost/home_budget
RUST_LOG=info
```

**Frontend** (`VITE_BACKEND_URL`):
```
VITE_BACKEND_URL=http://localhost:3000
```

### Development Servers

```bash
# Backend
cd backend && cargo run

# Frontend
cd frontend && npm run dev
```

---

## Performance Considerations

1. **Data Fetching**:
   - React Query handles caching and deduplication
   - `staleTime: 0` in most queries for fresh data
   - Invalidate after mutations

2. **Rendering**:
   - Use React.memo for expensive components
   - useCallback for stable function references
   - useMemo for expensive computations

3. **Bundle Size**:
   - Tree-shake unused imports
   - Check MUI components being imported
   - Lazy load pages with React.lazy if needed

---

## Common Commands

```bash
# Backend
cargo run                  # Run dev server
cargo test                 # Run tests
cargo fmt                  # Format code
cargo clippy               # Linting

# Frontend
npm run dev                # Dev server
npm run build              # Production build
npm run preview            # Preview build

# Database
sqlx migrate run           # Run migrations
```

---

## Import Conventions

**Frontend**:
```typescript
// Prefer importing from index files
import { ComponentName } from '../components';
import { useHook } from '../hooks';

// Also acceptable - direct imports
import ComponentName from '../components/subdir/ComponentName';
import { useHook } from '../hooks/useHook';
```

**Backend**:
```rust
// Use fully qualified paths
use crate::handlers::*;
use crate::models::*;
use axum::{/*...*/};
use sqlx::{/*...*/};
```

---

## Key Files to Know

- `/frontend/src/lib/api.ts` — All API client functions and types
- `/frontend/src/store.ts` — Global Zustand store
- `/frontend/src/theme.ts` — MUI theme configuration
- `/frontend/src/components/common/` — Reusable components
- `/backend/src/models.rs` — All data structures
- `/backend/src/routes.rs` — Route definitions
- `/backend/migrations/` — Database migrations

---

## Important Notes

1. **Always maintain type safety** — both TypeScript and Rust are strongly typed
2. **Use existing patterns** — don't introduce new patterns without justification
3. **Keep components focused** — single responsibility principle
4. **Test before committing** — especially for backend changes
5. **Follow i18n** — all user-facing text should be translatable
6. **Consider accessibility** — use proper ARIA labels and semantic HTML
7. **Error handling** — never silently fail, always provide user feedback
