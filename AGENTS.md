## Public Footer Style

Every public HTML page under `docs/`:

- Chinese: `MIT 开源 — git hired 还是 git rejected，你说了算。` + `$ whoami 作者：realRoc。 仓库地址：github.com/realRoc/git-hired。`
- English: direct equivalent preserving MIT, `git hired`/`git rejected`, `$ whoami`, `realRoc`, repo link
- No source prompt filenames or links in footer. Horizontally centered on desktop and mobile.
- `docs/404.html` uses English footer (no language switch).

## Commit Policy

- If a turn changes files and work is complete, automatically `git add`, `git commit`, `git push`
- Run validation before commit if applicable
- If validation fails, fix or report before pushing
- User can opt out by explicitly saying not to commit/push
