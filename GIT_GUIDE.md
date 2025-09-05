# Git and GitHub: Commit & Push Guide

This project already uses Git. Use this guide to commit your changes and push them to a new or existing GitHub repository.

## 1) One‑time setup (identity and auth)

- Set your commit identity (local to this repo/run terminal 'zsh'):

  - `git config user.name "Your Name"`
  - `git config user.email "your-email@example.com"`
  - git config --global user.email "tavong1594@gmail.com"
  - git config --global user.name "iamyourdeveloper"

  - Tip: To keep your email private on GitHub, use the GitHub noreply format: `12345678+username@users.noreply.github.com`.

- Choose your auth method for GitHub:
  - HTTPS + Personal Access Token (recommended for simplicity), or
  - SSH keys (`ssh-keygen -t ed25519 -C "your-email@example.com"`, then add the public key to GitHub).

## 2) Commit workflow

- Check what changed: `git status -s`
- Stage files:
  - All changes: `git add -A`
  - Specific file(s): `git add path/to/file`
- Commit with a message: `git commit -m "feat: describe your change"`
- If you forgot to stage something, stage it and amend: `git commit --amend --no-edit`
- Unstage a file: `git restore --staged path/to/file`

## 3) Create or connect a GitHub repo

Option A — Create on GitHub.com (web):

- Create a new repository in your GitHub account (without initializing files).
- Copy the repo URL (HTTPS or SSH).
- In this project folder, connect it:
  - HTTPS: `git remote add origin https://github.com/<your-username>/<repo>.git`
  - SSH: `git remote add origin git@github.com:<your-username>/<repo>.git`
- Verify: `git remote -v`

Option B — Create with GitHub CLI (if installed):

- Log in: `gh auth login`
- Create and push in one go: `gh repo create <repo-name> --source . --private --push`

## 4) Push your branch

- First push (and set upstream): `git push -u origin main`
- Next pushes: `git push`
- Pull latest changes: `git pull --rebase`

## 5) Good practices for this repo

- Don’t commit secrets: real `.env` files should stay untracked. Use the provided `.env.example` files as templates.
- Keep commit messages clear and consistent (e.g., `feat:`, `fix:`, `chore:`).
- Prefer small, focused commits with descriptive messages.

## 6) Troubleshooting

- Authentication failed (HTTPS): Use a Personal Access Token with `repo` scope when prompted for a password.
- Wrong remote URL: `git remote set-url origin <new-url>`
- Rename the current branch to `main`: `git branch -M main`
- Undo the last commit but keep changes staged: `git reset --soft HEAD^`
- Undo the last commit and unstage changes: `git reset --mixed HEAD^`

---

Quick checklist to push right now:

1. `git add -A`
2. `git commit -m "chore: initial commit for Folio Weather"`
3. `git remote add origin https://github.com/<you>/<repo>.git`
4. `git push -u origin main`
