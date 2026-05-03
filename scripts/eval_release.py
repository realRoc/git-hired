#!/usr/bin/env python3

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "README.md").exists() and (candidate / "docs" / "index.html").exists():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def run(repo_root: Path, command: list[str]) -> None:
    print(f"$ {' '.join(command)}", flush=True)
    subprocess.run(command, cwd=repo_root, check=True)


def main() -> int:
    repo_root = find_repo_root(Path.cwd())
    checks = (
        ["node", "--check", "docs/quick-test.js"],
        ["python3", "evals/analytics_contract_eval.py"],
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
