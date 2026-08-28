#!/usr/bin/env python3
"""
Regenerates the auto file list in README.md between the markers
<!-- REPORTS:START --> ... <!-- REPORTS:END -->

For each *.html file in the repo root:
  - title  <- <title>...</title> in the file, else the filename
  - descr  <- <!-- readme-desc: ... --> comment in the file, if present
  - date   <- date of the last git commit that touched the file

Run by .github/workflows/update-readme.yml on every push.
"""
import os
import re
import subprocess
import html

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
README_PATH = os.path.join(REPO_ROOT, "README.md")
START_MARKER = "<!-- REPORTS:START -->"
END_MARKER = "<!-- REPORTS:END -->"

# GitHub Pages base URL for this repo (Settings -> Pages -> Deploy from
# branch "main" / root). Links point here instead of the GitHub source
# view, so files open as rendered pages, not as code.
PAGES_BASE_URL = "https://ivazovaruzana.github.io/Otcheti"

MONTHS_RU = {
    1: "январь", 2: "февраль", 3: "март", 4: "апрель", 5: "май", 6: "июнь",
    7: "июль", 8: "август", 9: "сентябрь", 10: "октябрь", 11: "ноябрь", 12: "декабрь",
}


def git_last_modified(path):
    try:
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%cI", "--", path],
            cwd=REPO_ROOT, text=True,
        ).strip()
        if not out:
            return None, None
        year, month = int(out[0:4]), int(out[5:7])
        return f"{MONTHS_RU[month]} {year}", out
    except Exception:
        return None, None


def extract_title(path):
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            content = f.read(20000)
    except Exception:
        return None
    m = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
    if m:
        return html.unescape(re.sub(r"\s+", " ", m.group(1)).strip())
    return None


def extract_description(path):
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            content = f.read(20000)
    except Exception:
        return None
    m = re.search(r"<!--\s*readme-desc:\s*(.*?)-->", content, re.IGNORECASE | re.DOTALL)
    if m:
        return re.sub(r"\s+", " ", m.group(1)).strip()
    return None


def collect_files():
    entries = []
    for name in sorted(os.listdir(REPO_ROOT)):
        if not name.lower().endswith((".html", ".htm")):
            continue
        path = os.path.join(REPO_ROOT, name)
        if not os.path.isfile(path):
            continue
        title = extract_title(path) or name
        desc = extract_description(path)
        updated_label, updated_iso = git_last_modified(path)
        entries.append((name, title, desc, updated_label, updated_iso))
    entries.sort(key=lambda e: e[4] or "", reverse=True)
    return entries


def build_list(entries):
    lines = []
    for name, title, desc, updated_label, _ in entries:
        url = f"{PAGES_BASE_URL}/{name}"
        line = f"- **[{title}]({url})**"
        if desc:
            line += f" — {desc}."
        if updated_label:
            line += f" Обновлён: {updated_label}."
        lines.append(line)
    return "\n".join(lines)


def main():
    with open(README_PATH, encoding="utf-8") as f:
        readme = f.read()

    if START_MARKER not in readme or END_MARKER not in readme:
        raise SystemExit(
            f"В README.md нет меток {START_MARKER} / {END_MARKER} — "
            "добавь их вокруг списка «Доступные отчёты» один раз вручную."
        )

    entries = collect_files()
    new_list = build_list(entries) if entries else "_Пока нет загруженных отчётов._"

    pattern = re.compile(re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.DOTALL)
    replacement = f"{START_MARKER}\n{new_list}\n{END_MARKER}"
    new_readme = pattern.sub(replacement, readme)

    if new_readme != readme:
        with open(README_PATH, "w", encoding="utf-8") as f:
            f.write(new_readme)
        print("README.md обновлён.")
    else:
        print("Изменений нет.")


if __name__ == "__main__":
    main()
