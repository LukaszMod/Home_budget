# Templates Usage Guide

Templates are in `.claude/templates/` directory. Use them as starting points for new code.

## Component Template

**When to use:** Creating a new UI component

```bash
# Copy template
cp .claude/templates/component.template.tsx src/components/feature/NewComponent.tsx

# Then:
1. Replace {{ComponentName}} with actual name
2. Add props interface
3. Add content
4. Add translations
```

## Hook Template

**When to use:** Creating a custom React hook for data fetching

```bash
# Copy template
cp .claude/templates/hook.template.ts src/hooks/use{{HookName}}.ts

# Then:
1. Replace {{HookName}} with actual name
2. Update queryKey and API functions
3. Add error handling if needed
4. Add return type annotations
```

## Handler Template

**When to use:** Creating a new backend endpoint

```bash
# Copy template
cp .claude/templates/handler.template.rs src/handlers/entity.rs

# Then:
1. Replace Entity/entity names
2. Implement your SQL queries
3. Add validation
4. Update routes.rs to include the new handler
```

## Form Dialog Template

**When to use:** Creating a modal for form input (create/edit operations)

```bash
# Copy template
cp .claude/templates/form-dialog.template.tsx src/components/feature/Create{{Entity}}Dialog.tsx

# Then:
1. Replace {{EntityName}} with actual name
2. Add FormData fields
3. Add form fields with Controller
4. Update API mutation function
5. Add validation with Zod if needed
```

## Template Variables

- `{{ComponentName}}` → PascalCase component name
- `{{HookName}}` → camelCase (without 'use') for hook name
- `{{EntityName}}` → PascalCase entity name
- Replace with actual names when using

## Quick Copy-Paste

```bash
# List all templates
ls -la .claude/templates/

# Show template content
cat .claude/templates/hook.template.ts

# Copy and customize
cp .claude/templates/component.template.tsx src/components/feature/MyComponent.tsx
# Edit MyComponent.tsx...
```

## Customization Tips

1. **Always update imports** — match your directory structure
2. **Update queryKey** — must match API function name
3. **Add validation** — use Zod for forms
4. **Add translations** — use useTranslation()
5. **Test after** — npm run build (frontend) or cargo test (backend)

See Agent.md for detailed patterns!
