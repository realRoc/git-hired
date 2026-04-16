#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path


CANVAS_W = 640
CANVAS_H = 820
OUTER_X = 44
OUTER_Y = 36
OUTER_W = 552
OUTER_H = 738
PANEL_X = 126
PANEL_Y = 206
PANEL_W = 388
PANEL_H = 334
BADGE_Y = 616
BADGE_SIZE = 88
BADGE_GAP = 18
ASSET_BASE_URL = "https://realroc.github.io/git-hired/assets/mbti"


LETTER_FONT = {
    "E": ["11111", "10000", "11110", "10000", "11111"],
    "F": ["11111", "10000", "11110", "10000", "10000"],
    "I": ["11111", "00100", "00100", "00100", "11111"],
    "J": ["11111", "00010", "00010", "10010", "01100"],
    "N": ["10001", "11001", "10101", "10011", "10001"],
    "P": ["11110", "10010", "11110", "10000", "10000"],
    "S": ["01111", "10000", "01110", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100"],
}


TYPE_META = {
    "INTJ": {"descriptor_en": "quiet systems strategist", "descriptor_zh": "安静型系统策士"},
    "INTP": {"descriptor_en": "pattern-first tool thinker", "descriptor_zh": "模式优先的工具思考者"},
    "ENTJ": {"descriptor_en": "decisive build commander", "descriptor_zh": "果断推进的搭建指挥官"},
    "ENTP": {"descriptor_en": "prototype-hungry idea hacker", "descriptor_zh": "原型上瘾的点子黑客"},
    "INFJ": {"descriptor_en": "signal-reading meaning weaver", "descriptor_zh": "擅长读信号的意义编织者"},
    "INFP": {"descriptor_en": "value-led craft idealist", "descriptor_zh": "价值驱动的创作理想派"},
    "ENFJ": {"descriptor_en": "team-lifting catalyst", "descriptor_zh": "带动团队的催化者"},
    "ENFP": {"descriptor_en": "spark-chasing possibility scout", "descriptor_zh": "追逐火花的可能性侦察兵"},
    "ISTJ": {"descriptor_en": "process-locking keeper", "descriptor_zh": "流程锁定的守成者"},
    "ISFJ": {"descriptor_en": "trust-first stabilizer", "descriptor_zh": "以信任为先的稳定器"},
    "ESTJ": {"descriptor_en": "hard-closing operator", "descriptor_zh": "强执行的收口型操盘手"},
    "ESFJ": {"descriptor_en": "care-driven coordinator", "descriptor_zh": "关照型协同组织者"},
    "ISTP": {"descriptor_en": "debug-minded field mechanic", "descriptor_zh": "调试脑的现场机械师"},
    "ISFP": {"descriptor_en": "taste-heavy quiet maker", "descriptor_zh": "审美驱动的安静创作者"},
    "ESTP": {"descriptor_en": "impact-first mover", "descriptor_zh": "冲击优先的行动派"},
    "ESFP": {"descriptor_en": "audience-aware live wire", "descriptor_zh": "感知现场的高能导体"},
}


TEMPERAMENT_ICON = {
    "NT": [
        "..####....",
        ".######...",
        "##....##..",
        "##....##..",
        "##....##..",
        ".######...",
        "..####....",
        "..####....",
        ".######...",
        "##....##..",
        "##....##..",
        "..####....",
    ],
    "NF": [
        "...##.....",
        "..####....",
        ".######...",
        ".##..##...",
        "..####....",
        "...##.....",
        "..####....",
        ".######...",
        "##.##.##..",
        "..####....",
        "...##.....",
        "...##.....",
    ],
    "SJ": [
        ".######...",
        ".#....#...",
        ".######...",
        ".#....#...",
        ".######...",
        ".#....#...",
        ".######...",
        ".#....#...",
        ".######...",
        ".#....#...",
        ".######...",
        "..........",
    ],
    "SP": [
        "...##.....",
        "..####....",
        ".######...",
        "..####....",
        "..####....",
        "..####....",
        "..####....",
        ".######...",
        ".##..##...",
        ".##..##...",
        "##....##..",
        "..........",
    ],
}


def svg_rect(x: int, y: int, w: int, h: int, *, fill: str = "none", stroke: str = "none", sw: int = 0) -> str:
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" />'
    )


def svg_line(x1: int, y1: int, x2: int, y2: int, *, stroke: str = "#000", sw: int = 4) -> str:
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" />'


def svg_text(x: int, y: int, value: str, *, size: int = 18, weight: int = 700, anchor: str = "start") -> str:
    return (
        f'<text x="{x}" y="{y}" font-family="monospace" font-size="{size}" font-weight="{weight}" '
        f'text-anchor="{anchor}" fill="#000">{value}</text>'
    )


def bitmap_group(pattern: list[str], *, x: int, y: int, pixel: int) -> str:
    parts: list[str] = []
    for row_index, row in enumerate(pattern):
        for col_index, value in enumerate(row):
            if value not in {".", "0", " "}:
                parts.append(svg_rect(x + col_index * pixel, y + row_index * pixel, pixel, pixel, fill="#000"))
    return "".join(parts)


def render_word(word: str, *, x: int, y: int, pixel: int = 12, letter_gap: int = 10) -> str:
    parts: list[str] = []
    cursor = x
    for char in word:
        pattern = LETTER_FONT[char]
        parts.append(bitmap_group(pattern, x=cursor, y=y, pixel=pixel))
        cursor += len(pattern[0]) * pixel + letter_gap
    return "".join(parts)


def draw_badge_frame(x: int, letter: str, label: str) -> str:
    parts = [
        svg_rect(x, BADGE_Y, BADGE_SIZE, BADGE_SIZE, fill="#fff", stroke="#000", sw=4),
        svg_text(x + BADGE_SIZE // 2, BADGE_Y + 24, letter, size=20, weight=800, anchor="middle"),
        svg_text(x + BADGE_SIZE // 2, BADGE_Y + 76, label, size=12, weight=600, anchor="middle"),
    ]
    return "".join(parts)


def badge_icon(letter: str, x: int, y: int, pixel: int = 6) -> str:
    px = x + 18
    py = y + 28
    if letter == "E":
        pattern = [
            ".######.",
            "##....##",
            "##....##",
            ".######.",
            "...##...",
            "..##....",
        ]
    elif letter == "I":
        pattern = [
            ".######.",
            ".#....#.",
            ".#....#.",
            ".#....#.",
            ".######.",
            "........",
        ]
    elif letter == "S":
        pattern = [
            "##......",
            "##......",
            "########",
            "....##..",
            "....##..",
            "########",
        ]
    elif letter == "N":
        pattern = [
            "..##..##",
            ".########",
            "..######",
            ".########",
            "##..##..",
            "....##..",
        ]
    elif letter == "T":
        pattern = [
            "...##...",
            "..####..",
            ".######.",
            "...##...",
            "..####..",
            "...##...",
        ]
    elif letter == "F":
        pattern = [
            "..##.##.",
            ".########",
            ".########",
            "..######",
            "...####.",
            "....##..",
        ]
    elif letter == "J":
        pattern = [
            "##......",
            ".##.....",
            "..##....",
            "...##...",
            ".##.##..",
            "..###...",
        ]
    else:
        pattern = [
            "..####..",
            ".##..##.",
            "....##..",
            "...##...",
            "..##....",
            ".######.",
        ]
    return bitmap_group(pattern, x=px, y=py, pixel=pixel)


def central_icon(mbti: str) -> str:
    temperament = f"{mbti[1]}{mbti[2] if mbti[1] == 'N' else mbti[3]}"
    pattern = TEMPERAMENT_ICON[temperament]
    icon = [bitmap_group(pattern, x=PANEL_X + 116, y=PANEL_Y + 84, pixel=16)]
    if mbti[0] == "E":
        icon.append(svg_rect(PANEL_X + 292, PANEL_Y + 48, 36, 36, fill="#000"))
        icon.append(svg_rect(PANEL_X + 302, PANEL_Y + 58, 16, 16, fill="#fff"))
    else:
        icon.append(svg_rect(PANEL_X + 58, PANEL_Y + 48, 36, 36, fill="#000"))
        icon.append(svg_rect(PANEL_X + 68, PANEL_Y + 58, 16, 16, fill="#fff"))
    if mbti[3] == "J":
        icon.append(svg_line(PANEL_X + 72, PANEL_Y + 282, PANEL_X + 312, PANEL_Y + 282))
        icon.append(svg_line(PANEL_X + 72, PANEL_Y + 304, PANEL_X + 276, PANEL_Y + 304))
    else:
        icon.append(svg_line(PANEL_X + 72, PANEL_Y + 294, PANEL_X + 140, PANEL_Y + 272))
        icon.append(svg_line(PANEL_X + 140, PANEL_Y + 272, PANEL_X + 212, PANEL_Y + 306))
        icon.append(svg_line(PANEL_X + 212, PANEL_Y + 306, PANEL_X + 308, PANEL_Y + 268))
    return "".join(icon)


def build_svg(mbti: str, descriptor_en: str) -> str:
    parts: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_W}" height="{CANVAS_H}" '
            f'viewBox="0 0 {CANVAS_W} {CANVAS_H}" shape-rendering="crispEdges">'
        ),
        svg_rect(0, 0, CANVAS_W, CANVAS_H, fill="#fff"),
        svg_rect(OUTER_X, OUTER_Y, OUTER_W, OUTER_H, fill="#fff", stroke="#000", sw=4),
        svg_rect(OUTER_X, OUTER_Y, OUTER_W, 34, fill="#fff", stroke="#000", sw=4),
        svg_rect(OUTER_X + 12, OUTER_Y + 10, 16, 16, fill="#fff", stroke="#000", sw=3),
        svg_rect(OUTER_X + 36, OUTER_Y + 10, 16, 16, fill="#fff", stroke="#000", sw=3),
        svg_rect(OUTER_X + 60, OUTER_Y + 10, 16, 16, fill="#fff", stroke="#000", sw=3),
        svg_text(OUTER_X + OUTER_W // 2, OUTER_Y + 24, f"git-hired // {mbti} MBTI Work Persona", size=16, weight=700, anchor="middle"),
        svg_rect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, fill="#fff", stroke="#000", sw=4),
        svg_line(PANEL_X + 24, PANEL_Y + 44, PANEL_X + PANEL_W - 24, PANEL_Y + 44),
        svg_line(PANEL_X + 24, PANEL_Y + PANEL_H - 42, PANEL_X + PANEL_W - 24, PANEL_Y + PANEL_H - 42),
        render_word(mbti, x=154, y=108, pixel=16, letter_gap=12),
        svg_text(CANVAS_W // 2, 194, descriptor_en, size=18, weight=700, anchor="middle"),
        central_icon(mbti),
        svg_text(CANVAS_W // 2, 572, "work personality", size=18, weight=700, anchor="middle"),
    ]

    badge_labels = {
        "E": "energy",
        "I": "focus",
        "S": "detail",
        "N": "pattern",
        "T": "logic",
        "F": "people",
        "J": "closure",
        "P": "explore",
    }
    badge_x = 86
    for letter in mbti:
        parts.append(draw_badge_frame(badge_x, letter, badge_labels[letter]))
        parts.append(badge_icon(letter, badge_x, BADGE_Y))
        badge_x += BADGE_SIZE + BADGE_GAP

    parts.extend(
        [
            svg_text(CANVAS_W // 2, 742, "shareable local-only card", size=16, weight=700, anchor="middle"),
            "</svg>",
        ]
    )
    return "".join(parts)


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "roles.json").exists() and (candidate / "docs").is_dir():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def main() -> None:
    repo_root = find_repo_root(Path.cwd())
    asset_dir = repo_root / "docs" / "assets" / "mbti"
    asset_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, dict[str, str]] = {}
    for mbti, meta in TYPE_META.items():
        filename = f"{mbti.lower()}.svg"
        relative_path = f"assets/mbti/{filename}"
        svg = build_svg(mbti, meta["descriptor_en"])
        (asset_dir / filename).write_text(svg, encoding="utf-8")
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
                "types": manifest,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Generated {len(TYPE_META)} MBTI cards in {asset_dir}")


if __name__ == "__main__":
    main()
