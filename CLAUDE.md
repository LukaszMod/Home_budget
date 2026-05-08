# CLAUDE.md — Home Budget Workspace Guidelines

This file contains workspace-specific guidance for Claude. Read this before starting work.

---

## 🎯 How Claude Should Approach Work Here

### Before Starting Any Task

1. **Always read existing code first** — understand patterns before writing
2. **Check Agent.md for conventions** — this is the style guide
3. **Use `git log --oneline` to see recent changes** — understand project rhythm
4. **Verify file locations** — don't guess where things go
5. **Run tests/type checking** — before claiming success

### Decision Hierarchy

When unsure what approach to use:

1. **What does existing code do?** (most important)
2. **What does Agent.md say?** (conventions)
3. **What's the simplest solution?** (Occam's razor)
4. **Type safety first** — TypeScript strict mode is enabled

---

## ⚡ Token Optimization Tips

### Write Shorter Prompts

Instead of:
```
"I have a problem with my React component where the form is not working correctly 
when I fill in data and the validation isn't showing up properly..."
```

Write:
```
"Fix form validation not showing in <ComponentName>"
```
→ Provide file path and line number, let Claude find context

### Provide Context Upfront

- **Always give file paths** — saves time reading wrong files
- **Include line numbers** — e.g., `UserForm.tsx:34-50`
- **Quote the error/problem** — exact error messages are gold
- **Don't explain the "why"** — Claude will figure it out from code

### Use Git for Context

```bash
git log -p --follow <file>     # See what changed and why
git diff main <branch>         # What changed since main
git blame <file>               # Who changed what
```

These are better than explaining context in prose.

---

## 🚀 Common Workflows

### Adding a New Feature

1. **Start with data model** — what data does it need?
2. **Add backend API endpoint** — implement in Rust first
3. **Add frontend hook** — wrap the API
4. **Add component/page** — use the hook
5. **Test in browser** — don't just assume it works
6. **Commit with descriptive message**

Example commit messages:
```
feat: add category hiding functionality
fix: resolve split operation balance calculation
refactor: extract OperationForm into reusable component
```

### Debugging

When something is broken:

1. **Check tsconfig/strict mode errors first** — type errors are real
2. **Look at console errors** — browser dev tools
3. **Run tests if available** — `cargo test` for backend
4. **Add debug logs** — but remove before commit
5. **Check recent changes** — `git log -p <file>` on the file

### Code Review Checklist

Before committing:

- [ ] Does TypeScript compile? (`npm run build` in frontend)
- [ ] No unused imports/variables? (tsconfig catches these)
- [ ] All text is translated (using `useTranslation()`)?
- [ ] Proper error handling? (users see error messages)
- [ ] Forms have validation?
- [ ] Loading states show during mutations?
- [ ] No console errors/warnings?
- [ ] Follows Agent.md patterns?

---

## 🛑 Common Mistakes (Avoid These)

### Frontend

❌ **Don't**:
- Create new components without checking if similar one exists
- Add manual error handling when React Query has it
- Forget to invalidate queries after mutations
- Use direct fetch instead of API client (`/lib/api.ts`)
- Hardcode strings without translation
- Use multiple state sources for same data

✅ **Do**:
- Reuse existing components from `components/common/ui/`
- Use React Query mutations with `onSuccess` invalidation
- Check API client for existing functions
- Always use `useTranslation()` and translation keys
- Use single source of truth (React Query or Zustand)

### Backend

❌ **Don't**:
- Write raw SQL without SQLx compile-time checking
- Forget error handling in handlers
- Skip transactions for multi-step operations
- Return unhelpful error messages

✅ **Do**:
- Use `sqlx::query_as!()` for type-safe queries
- Return `Result<Json<T>, ApiError>`
- Wrap related operations in transactions
- Return meaningful error messages with context

### Both

❌ **Don't**:
- Commit broken code (TypeScript errors, failing tests)
- Add debug logs and forget to remove them
- Use magic numbers/strings — extract to constants
- Make files too large (split into smaller pieces)

✅ **Do**:
- Run type checker before committing
- Test the golden path AND edge cases
- Use meaningful names (don't abbreviate)
- Keep components/handlers focused

---

## 📁 File Location Reference

### Frontend

```
/frontend/src/
  components/
    common/             ← Shared components (Button, Modal, etc)
    common/ui/          ← Form controls (TextField, Select, etc)
    [feature]/          ← Feature-specific components
  hooks/                ← Custom React hooks (useOperations, etc)
  pages/                ← Page components for routing
  lib/api.ts            ← ALL API calls go here
  store.ts              ← Zustand store (global UI state)
  contexts/             ← Context providers
```

**When adding something, ask:**
- Is this a reusable control? → `components/common/ui/`
- Is this feature-specific? → `components/[feature]/`
- Is this a page? → `pages/`
- Is this a data fetching hook? → `hooks/`

### Backend

```
/backend/src/
  handlers/             ← Route handlers (get_users, create_operation, etc)
  models.rs             ← Data structures
  routes.rs             ← Route definitions
  main.rs               ← App setup
  utils.rs              ← Helper functions
  migrations/           ← SQL migrations
```

**When adding something, ask:**
- Is this a new data type? → `models.rs`
- Is this an API endpoint? → `handlers/` (new file if domain)
- Is this a new route? → `routes.rs`

---

## 🔍 Quick Diagnostics

### "TypeScript won't compile"

1. Check `noUnusedLocals`, `noUnusedParameters` — remove unused stuff
2. Check types match — especially function parameters
3. Run `npm run build` — get full error list

### "Mutation doesn't update UI"

1. Did you invalidate the query? (`qc.invalidateQueries()`)
2. Is the queryKey correct? (must match the fetch function)
3. Did you return the right data from API?

### "Form doesn't work"

1. Is form wrapped in `<FormProvider>`?
2. Are fields using `Controller` from react-hook-form?
3. Is validation schema (Zod) correct?
4. Does button have `type="submit"`?

### "Backend returns 500"

1. Check backend logs — actual error is there
2. Run `cargo test` — might show what broke
3. Check migrations ran — database schema correct?
4. Verify SQL syntax with `sqlx-cli` if needed

---

## 📊 Performance Notes

### Frontend

- React Query caches aggressively — can use `staleTime: 0` for fresh data
- Components are functional (hooks) — no class component overhead
- MUI is heavy — be careful importing entire icons
- DatePicker from MUI is slow — consider alternatives if needed

### Backend

- SQLx compile-time checks prevent runtime SQL errors
- Use indexes on frequently filtered columns
- Transactions have overhead — use only when needed
- BigDecimal for money (never use floats)

---

## 🧪 Testing

### Frontend

```bash
# Type check
npm run build

# Run tests (if added)
npm test
```

### Backend

```bash
# Run tests
cargo test

# Run specific test
cargo test operation_creation

# With logs
RUST_LOG=debug cargo test -- --nocapture
```

**Good test practices:**
- Test the feature, not the implementation
- Test error cases, not just happy path
- Use descriptive test names: `test_split_operation_creates_children`

---

## 🔐 Security Reminders

- **Never commit `.env` files** — use `.env.example`
- **No hardcoded credentials** — use environment variables
- **Backend validates input** — frontend validation is UX only
- **SQL injection risk** — only use parameterized queries (SQLx does this)
- **CORS config** — check `main.rs` if changing endpoints

---

## 📝 Commit Message Examples

```
✅ Good:
- "add split operation validation"
- "fix calculation in budget summary"
- "refactor OperationModal into smaller components"

❌ Bad:
- "fix" (too vague)
- "update files" (meaningless)
- "wip" (don't commit WIP)
```

Format: `<type>: <subject>`
- `feat:` new feature
- `fix:` bug fix
- `refactor:` code reorganization
- `docs:` documentation
- `chore:` maintenance

---

## 🆘 When Stuck

### Strategy

1. **Check git history** — has this been done before?
   ```bash
   git log -p -S "keyword" -- "*.tsx"
   ```

2. **Look for similar code** — reuse patterns
   ```bash
   grep -r "pattern" frontend/src/
   ```

3. **Check comments** — sometimes there's context
   ```bash
   grep -r "TODO\|FIXME\|NOTE" src/
   ```

4. **Run tests** — what breaks?
   ```bash
   cargo test
   npm run build
   ```

5. **Ask for context** — if still unclear, ask the user

---

## 🎓 Learning Resources in This Project

- **Component patterns** → `frontend/src/components/common/StyledModal.tsx`
- **Hook patterns** → `frontend/src/hooks/useOperations.ts`
- **Form patterns** → `frontend/src/components/operations/AddOperationModal.tsx`
- **API integration** → `frontend/src/lib/api.ts`
- **Backend patterns** → `backend/src/handlers/*.rs`
- **Database models** → `backend/src/models.rs`

---

## 🚪 Exit Criteria (How to Know You're Done)

✅ Task is complete when:
- Code follows Agent.md conventions
- TypeScript/Rust compile without warnings
- No console errors/warnings in browser
- Feature works in browser (manually test)
- Commit message is descriptive
- Related tests pass (if exist)

❌ Don't claim success if:
- "Should work" (test it!)
- Types compile but runtime might break
- Only frontend done, needs backend
- Partial implementation
- Warnings in logs

---

## 💡 Pro Tips

1. **Use `git stash` to save work temporarily** — test different approaches
2. **Read error messages carefully** — they usually say exactly what's wrong
3. **TypeScript strict mode is your friend** — trust it
4. **React Query DevTools in browser** — shows cache state
5. **Check `_app` / `main.tsx`** — global setup happens there
6. **Prettier formats code** — don't fight it, let it format
7. **i18next is configured at startup** — all languages work
8. **Asset types are separate from accounts** — learn the data model

---

## 📋 Checklist for New Features

Before marking done:

- [ ] Feature works in browser (tested manually)
- [ ] Follows Agent.md patterns
- [ ] TypeScript strict mode passes
- [ ] Rust compiles without warnings
- [ ] No console errors
- [ ] All user-visible text is translated
- [ ] Error handling shows user messages
- [ ] Loading states work
- [ ] Forms validate input
- [ ] Mutations invalidate correct queries
- [ ] Commit message is clear
- [ ] Branch is up to date with main

---

## 🔗 Quick Links

- Agent.md → Coding conventions and patterns
- README.md → Setup and project overview
- /frontend/src/lib/api.ts → All API functions
- /backend/src/models.rs → Data structure definitions
- /frontend/src/store.ts → Global state (Zustand)

---

**Last updated:** 2026-05-08
**Maintained by:** Project team
**For questions:** Check git log and existing code first!
