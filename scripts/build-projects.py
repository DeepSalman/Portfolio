#!/usr/bin/env python3
"""Render project cards from data/projects.json. Uses only the Python standard library."""
import argparse
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START, END = '<!-- PROJECTS:START -->', '<!-- PROJECTS:END -->'
ART = {
    'pricepoint': '''<div class="project-art art-pricepoint" aria-hidden="true"><div class="model-window"><div class="model-window-top"><i></i><i></i><i></i><span>pricepoint / model_comparison.py</span></div><div class="model-window-title">From specifications to value <span>REGRESSION</span></div><svg class="model-chart" viewBox="0 0 300 105" fill="none"><path d="M8 15H295M8 45H295M8 75H295M8 103H295" stroke="#ffffff10"/><path d="M10 95 290 10" stroke="#e7ac83" stroke-width="1.7"/><g fill="#b7c9a0"><circle cx="25" cy="81" r="3"/><circle cx="43" cy="89" r="3"/><circle cx="59" cy="69" r="3"/><circle cx="74" cy="80" r="3"/><circle cx="95" cy="57" r="3"/><circle cx="112" cy="70" r="3"/><circle cx="134" cy="46" r="3"/><circle cx="152" cy="59" r="3"/><circle cx="177" cy="36" r="3"/><circle cx="190" cy="52" r="3"/><circle cx="211" cy="27" r="3"/><circle cx="231" cy="35" r="3"/><circle cx="252" cy="17" r="3"/><circle cx="273" cy="24" r="3"/></g></svg><div class="model-footer"><span>4 MODELS</span><span>MAE · RMSE · R²</span><span>LOCAL DATA</span></div></div><div class="art-caption"><span>REGRESSION / CONCEPT ILLUSTRATION</span><span>01</span></div></div>''',
    'routegpt': '''<div class="project-art art-routegpt" aria-hidden="true"><svg class="route-diagram" viewBox="0 0 460 230" fill="none"><path d="M0 180H460M0 100H460M80 0V230M210 0V230M350 0V230" stroke="#7a8d6f" stroke-opacity=".25" stroke-width="18"/><path d="M70 185H190Q210 185 210 165V125Q210 105 230 105H330Q350 105 350 85V40" stroke="#365139" stroke-width="4" stroke-linecap="round"/><path d="M210 165V225" stroke="#718663" stroke-width="2" stroke-dasharray="5 5"/><circle cx="70" cy="185" r="9" fill="#f0f0e4" stroke="#365139" stroke-width="3"/><circle cx="210" cy="125" r="9" fill="#365139" stroke="#e2e7d7" stroke-width="4"/><circle cx="350" cy="40" r="9" fill="#365139" stroke="#e2e7d7" stroke-width="4"/><g fill="#354832" font-family="monospace" font-size="9"><text x="49" y="212">ORIGIN</text><text x="232" y="145">TRANSFER</text><text x="370" y="43">ARRIVAL</text></g></svg><div class="route-callout"><span>ASK ROUTEGPT</span>Find a way through the city. ↗</div><div class="art-caption"><span>JOURNEY / CONCEPT ILLUSTRATION</span><span>02</span></div></div>''',
    'microteach': '''<div class="project-art art-microteach" aria-hidden="true"><div class="teach-board"><div class="teach-card"><span>ONE TOPIC. A LITTLE HELP.</span><strong>Let’s untangle algorithms.</strong><small>A student asks. A peer steps in.</small><div class="teach-avatars"><i>S</i><i>A</i></div></div><div class="teach-card second"><span>LEARN TOGETHER</span><strong>“Let’s work through it.”</strong><small>Find your topic. Find your people. ↗</small></div></div><div class="art-caption"><span>PEER LEARNING / CONCEPT ILLUSTRATION</span><span>03</span></div></div>'''
}

def render():
    projects = json.loads((ROOT / 'data/projects.json').read_text())
    cards = []
    for index, project in enumerate(projects, 1):
        if not project.get('featured'):
            continue
        esc = html.escape
        tags = ''.join(f'<span>{esc(tag)}</span>' for tag in project['tags'])
        featured = ' featured' if not cards else ''
        cards.append(f'''        <a class="project-card{featured}" href="{esc(project['caseStudy'], quote=True)}" aria-label="Read the {esc(project['title'])} case study" data-reveal>
          <div class="project-copy"><span class="project-index">{index:02d} / {esc(project['category']).upper()}</span><h3>{esc(project['title'])}</h3><p>{esc(project['description'])}</p><div class="project-tags">{tags}</div><span class="project-cta">Explore the case study <span class="arrow-circle" aria-hidden="true">↗</span></span></div>
          {ART[project['slug']]}
        </a>''')
    return '\n      <div class="project-grid" id="project-grid">\n' + '\n'.join(cards) + '\n      </div>\n      '

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
