#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import subprocess
import sys
from pathlib import Path


GENERATED_PATHS = (
    "docs/index.html",
    "README.md",
    "README.zh-CN.md",
    "skill.md",
    "docs/skill.md",
)


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "README.md").exists() and (candidate / "roles.json").exists():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def digest(path: Path) -> str:
    if not path.exists():
        return "<missing>"
    return hashlib.sha256(path.read_bytes()).hexdigest()


def snapshot(repo_root: Path) -> dict[str, str]:
    return {path: digest(repo_root / path) for path in GENERATED_PATHS}


def run(repo_root: Path, command: list[str]) -> None:
    print(f"$ {' '.join(command)}", flush=True)
    subprocess.run(command, cwd=repo_root, check=True)


def main() -> int:
    repo_root = find_repo_root(Path.cwd())
    before = snapshot(repo_root)

    try:
        run(repo_root, ["python3", ".codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py"])
        run(repo_root, ["python3", ".codex/skills/git-hired-jd-ops/scripts/sync_skill_entry.py"])
    except subprocess.CalledProcessError as error:
        return error.returncode

    after = snapshot(repo_root)
    stale = [path for path in GENERATED_PATHS if before[path] != after[path]]
    if stale:
        print("\nGenerated surfaces were stale. Review and commit regenerated files, then rerun eval:")
        for path in stale:
            print(f"- {path}")
        return 1

    checks = (
        ["python3", ".codex/skills/git-hired-jd-ops/scripts/validate_roles.py"],
        ["python3", "evals/skill_contract_eval.py"],
        ["git", "diff", "--check"],
    )
    for command in checks:
        try:
            run(repo_root, command)
        except subprocess.CalledProcessError as error:
            return error.returncode

    print("\nRelease eval passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
