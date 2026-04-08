# Plan: Diff View + Branching для демо

## 1. Diff View (построчные изменения между коммитами)

### API
- `GET /api/diff?slug=X&base=SHA1&head=SHA2` → вызывает `coregit.diff.compare(repo, base, head, { patch: true })`

### UI
- В CommitHistory: кнопка "Diff" рядом с Restore (сравнивает коммит с предыдущим)
- Новый компонент `DiffViewer` — показывает файлы + построчный patch (зелёный/красный)
- Встраивается как вкладка "Diff" в PreviewPanel (4-я вкладка), либо заменяет Code при просмотре

### Компоненты
- `components/preview/diff-viewer.tsx` — парсит patch, рендерит +/- строки
- `app/api/diff/route.ts` — API endpoint

---

## 2. Branching (форк от любого коммита, переключение веток)

### API
- `GET /api/branches?slug=X` → `coregit.branches.list(repo)`
- `POST /api/branches` → `coregit.branches.create(repo, { name, from_sha })`
- `POST /api/branches/merge` → `coregit.branches.merge(repo, target, { source })`

### UI
- Branch selector (dropdown) в header ChatView — показывает текущую ветку, позволяет переключать
- В CommitHistory: кнопка "Branch" — создаёт ветку от этого коммита
- При переключении ветки: обновляется file tree, preview, commit history

### Hook
- `hooks/use-branches.ts` — `{ branches, activeBranch, switchBranch, createBranch }`

### Изменения в существующем коде
- `activeBranch` (state) поднимается в AppShell, прокидывается во все компоненты
- Все API вызовы где `ref=main` → `ref={activeBranch}`
- AI tools (commitFiles и др.) используют `activeBranch` вместо hardcoded "main"
- useWebContainer.syncAndRun при смене ветки делает полный re-sync

---

## Порядок

1. API endpoints (diff, branches, branches/merge)
2. DiffViewer компонент + вкладка в PreviewPanel
3. Кнопка Diff в CommitHistory
4. useBranches hook
5. Branch selector в ChatView header
6. Кнопка Branch в CommitHistory
7. Прокинуть activeBranch через весь стек (AppShell → tools → API calls)
8. Тест: создать ветку, переключиться, сделать коммит, посмотреть diff, смержить
