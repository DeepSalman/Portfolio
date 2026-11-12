#!/usr/bin/env python3
"""Render project cards from data/projects.json. Uses only the Python standard library."""
import argparse
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START, END = '<!-- PROJECTS:START -->', '<!-- PROJECTS:END -->'
ICONS = {
    'pricepoint': '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M1 21h22M7 13l3-3 3 2 4-5"/>',
    'routegpt': '<circle cx="5" cy="18" r="3"/><circle cx="19" cy="6" r="3"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h4"/>',
    'microteach': '<path d="m2 8 10-5 10 5-10 5-10-5Zm4 3v6c4 3 8 3 12 0v-6m4-3v9"/>',
    'banglalens': '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21zM4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8m-8 3h8"/>',
    'uiu-lost-and-found': '<path d="M4 7h16l-1 14H5L4 7Zm4 0V5a4 4 0 0 1 8 0v2m-4 4v6m-3-3h6"/>'
}

def render():
    projects = json.loads((ROOT / 'data/projects.json').read_text())
    cards = []
    for project in projects:
        if not project.get('featured'):
            continue
        esc = html.escape
        tags = ''.join(f'<li>{esc(tag)}</li>' for tag in project['cardTags'])
        tech = f'<ul class="work-tech" aria-label="Key technologies">{tags}</ul>' if tags else ''
        url = project.get('url') or project['caseStudy']
        external = bool(project.get('url'))
        target = ' target="_blank" rel="noopener noreferrer"' if external else ''
        action = 'Open project' if external else 'View project'
        cards.append(f'''        <li class="work-item" data-reveal>
          <a class="work-project" href="{esc(url, quote=True)}"{target} aria-label="{action}: {esc(project['title'])} — {esc(project['cardLabel'])}">
            <span class="work-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">{ICONS[project['slug']]}</svg></span>
            <div class="work-name"><h3>{esc(project['title'])}</h3><span>{esc(project['cardLabel'])}</span></div>
            <div class="work-summary"><p>{esc(project['cardSummary'])}</p>{tech}</div>
            <span class="work-link">{action} <span aria-hidden="true">↗</span></span>
          </a>
        </li>''')
    return '\n      <ul class="work-list" id="project-grid" aria-label="Selected projects">\n' + '\n'.join(cards) + '\n      </ul>\n      '

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true', help='Fail if committed project cards are stale')
args = parser.parse_args()
path = ROOT / 'index.html'
original = path.read_text()
head, rest = original.split(START, 1)
_, tail = rest.split(END, 1)
updated = head + START + render() + END + tail
if args.check:
    if updated != original:
        raise SystemExit('Project cards are stale. Run python3 scripts/build-projects.py')
    print('Project cards match data/projects.json')
else:
    path.write_text(updated)
    print('Rendered project cards in index.html')
