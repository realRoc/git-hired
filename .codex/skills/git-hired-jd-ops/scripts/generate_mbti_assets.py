#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path


CARD_WIDTH = 28
ASSET_BASE_URL = "https://realroc.github.io/git-hired/assets/mbti"


TYPE_META = {
    "INTJ": {
        "descriptor_en": "strategist tower",
        "descriptor_zh": "策略塔台",
        "motif": [
            "            /\\",
            "           /##\\",
            "          /####\\",
            "          | [] |",
            "          |____|",
        ],
    },
    "INTP": {
        "descriptor_en": "pattern notebook",
        "descriptor_zh": "模式笔记本",
        "motif": [
            "         ________",
            "        / ____  /|",
            "       / /___/ / |",
            "      /______/ /|",
            "      |______|/ |",
        ],
    },
    "ENTJ": {
        "descriptor_en": "command citadel",
        "descriptor_zh": "指挥城塞",
        "motif": [
            "          |\\",
            "       ___| \\__",
            "      |  _ [] _|",
            "      | |____| |",
            "      |________|",
        ],
    },
    "ENTP": {
        "descriptor_en": "signal glider",
        "descriptor_zh": "信号滑翔机",
        "motif": [
            "        __/\\__",
            "     __/      \\__",
            "    /  _  /\\_   \\",
            "    \\_/ \\/   \\__/",
            "         ||",
        ],
    },
    "INFJ": {
        "descriptor_en": "quiet lantern",
        "descriptor_zh": "静默提灯",
        "motif": [
            "            __",
            "           /__\\",
            "           \\  /",
            "          /====\\",
            "          |::::|",
        ],
    },
    "INFP": {
        "descriptor_en": "moon garden",
        "descriptor_zh": "月夜花园",
        "motif": [
            "          _..._",
            "        .:::::::.",
            "        ':::::::'",
            "          /\\/\\",
            "         /_/\\_\\",
        ],
    },
    "ENFJ": {
        "descriptor_en": "bridge caller",
        "descriptor_zh": "桥梁号手",
        "motif": [
            "      ____    ____",
            "   __/ __ \\__/ __ \\__",
            "  /__/  \\____/  \\__\\",
            "      \\__    __/",
            "         \\__/",
        ],
    },
    "ENFP": {
        "descriptor_en": "spark kite",
        "descriptor_zh": "火花风筝",
        "motif": [
            "            /\\",
            "           /  \\",
            "           \\  /",
            "            \\/",
            "            ||",
        ],
    },
    "ISTJ": {
        "descriptor_en": "archive vault",
        "descriptor_zh": "档案库",
        "motif": [
            "        __________",
            "       / ________ \\",
            "      | |[][][][]| |",
            "      | |[][][][]| |",
            "      | |________| |",
        ],
    },
    "ISFJ": {
        "descriptor_en": "hearth keeper",
        "descriptor_zh": "壁炉守护者",
        "motif": [
            "         ______",
            "        / ____ \\",
            "       | | /\\ | |",
            "       | ||  || |",
            "       | ||__|| |",
        ],
    },
    "ESTJ": {
        "descriptor_en": "stamped checklist",
        "descriptor_zh": "盖章清单",
        "motif": [
            "        __________",
            "       | [x] [x] |",
            "       | [x] [ ] |",
            "       | [x] [x] |",
            "       |____  ___|",
        ],
    },
    "ESFJ": {
        "descriptor_en": "roundtable host",
        "descriptor_zh": "圆桌主持人",
        "motif": [
            "         .------.",
            "      .-'  __    '-.",
            "     /   .'  '.    \\",
            "    |   | ()  |    |",
            "     \\   '.__.'   /",
        ],
    },
    "ISTP": {
        "descriptor_en": "field wrench",
        "descriptor_zh": "现场扳手",
        "motif": [
            "         _====",
            "     ____\\__  \\__",
            "    / __  _/  __)",
            "   /_/ /_/ |_/",
            "         /_/",
        ],
    },
    "ISFP": {
        "descriptor_en": "quiet palette",
        "descriptor_zh": "静音调色盘",
        "motif": [
            "       .--------.",
            "     .'  o  o    '.",
            "    /  o   __  o   \\",
            "    |   o (__)  o  |",
            "     \\      o     /",
        ],
    },
    "ESTP": {
        "descriptor_en": "lightning rail",
        "descriptor_zh": "闪电轨道",
        "motif": [
            "            / /",
            "           /_/__",
            "          __  _/",
            "         /_  /__",
            "           /___/",
        ],
    },
    "ESFP": {
        "descriptor_en": "stage boombox",
        "descriptor_zh": "舞台音箱",
        "motif": [
            "       .------------.",
            "       |  []  []    |",
            "       |    .--.    |",
            "       |   (____)   |",
            "       '------------'",
        ],
    },
}


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "roles.json").exists() and (candidate / "docs").is_dir():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def line(content: str) -> str:
    return f"| {content:<{CARD_WIDTH}} |"


def centered_line(content: str) -> str:
    return f"| {content:^{CARD_WIDTH}} |"


def build_card(mbti: str, descriptor_en: str, motif: list[str]) -> str:
    border = "+" + "-" * (CARD_WIDTH + 2) + "+"
    rows = [
        border,
        line(f"git-hired / {mbti}"),
        line(descriptor_en),
        line(""),
    ]
    rows.extend(centered_line(item) for item in motif)
    rows.append(border)
    return "\n".join(rows) + "\n"


def main() -> None:
    repo_root = find_repo_root(Path.cwd())
    asset_dir = repo_root / "docs" / "assets" / "mbti"
    asset_dir.mkdir(parents=True, exist_ok=True)

    for old_svg in asset_dir.glob("*.svg"):
        old_svg.unlink()

    manifest: dict[str, dict[str, str]] = {}
    for mbti, meta in TYPE_META.items():
        filename = f"{mbti.lower()}.txt"
        relative_path = f"assets/mbti/{filename}"
        card = build_card(mbti, meta["descriptor_en"], meta["motif"])
        (asset_dir / filename).write_text(card, encoding="utf-8")
        manifest[mbti] = {
            "file": relative_path,
            "url": f"{ASSET_BASE_URL}/{filename}",
            "descriptor_en": meta["descriptor_en"],
            "descriptor_zh": meta["descriptor_zh"],
        }

    (asset_dir / "manifest.json").write_text(
        json.dumps(
            {
                "base_url": ASSET_BASE_URL,
                "format": "txt",
                "types": manifest,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Generated {len(TYPE_META)} MBTI ASCII cards in {asset_dir}")


if __name__ == "__main__":
    main()
