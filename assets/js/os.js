const asset = (path) => new URL(path, import.meta.url).href;
const resumeURL = asset('../images/Salman_CV.pdf');
const email = 'salman2330508@bscse.uiu.ac.bd';
const projects = [
  { name: 'PricePoint', type: 'MACHINE LEARNING', description: 'Used laptop pricing for Bangladesh. Four regression models evaluated with MAE, RMSE, and R² on a custom local dataset.', href: asset('../../projects/pricepoint.html'), symbol: '01' },
  { name: 'RouteGPT', type: 'NLP / TRANSPORT', description: 'A Dhaka transport assistant for routes, fares, and journeys with multiple transfers. Built with Python, NLP, and MySQL.', href: asset('../../projects/routegpt.html'), symbol: '02' },
  { name: 'MicroTeach', type: 'FULL STACK', description: 'A peer tutoring marketplace connecting learners and tutors. Built with React, Node.js, Express, and MySQL.', href: asset('../../projects/microteach.html'), symbol: '03' },
];

let stylesheet;
let desktop;
let returnFocus;
let activeView = null;
let minimized = false;
let terminal;
let terminalOutput;
let terminalInput;
const history = [];
let historyIndex = 0;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function link(text, href, className = 'os-link') {
  const node = element('a', className, text);
  node.href = href;
  return node;
}

function loadStyles() {
  if (!stylesheet) {
    stylesheet = new Promise((resolve, reject) => {
      const node = document.createElement('link');
      node.rel = 'stylesheet';
      node.href = asset('../css/os.css');
      node.onload = resolve;
      node.onerror = () => { node.remove(); stylesheet = null; reject(new Error('Could not load SalmanOS styles.')); };
      document.head.append(node);
    });
  }
  return stylesheet;
}

function buildDesktop() {
  desktop = element('dialog', 'os-dialog');
  desktop.setAttribute('aria-labelledby', 'os-title');
  desktop.innerHTML = `
    <div class="os-shell">
      <header class="os-topbar">
        <div class="os-brand"><span class="os-brand-mark" aria-hidden="true">S_</span><h2 id="os-title">SalmanOS</h2><span class="os-version">PERSONAL EDITION</span></div>
        <button class="os-exit" type="button" data-os-exit aria-label="Close SalmanOS">Back to portfolio <span aria-hidden="true">↗</span></button>
      </header>
      <div class="os-desktop">
        <div class="os-wallpaper" aria-hidden="true"><span>Stay curious.</span><span>Keep building.</span><small>A LITTLE CORNER OF MY INTERNET.</small></div>
        <nav class="os-icons" aria-label="Desktop applications">
          <button class="os-app" type="button" data-os-view="about"><span class="os-app-art os-art-about" aria-hidden="true">s.</span><span>About me</span></button>
          <button class="os-app" type="button" data-os-view="projects"><span class="os-app-art os-art-projects" aria-hidden="true">[&nbsp;]</span><span>Projects</span></button>
          <button class="os-app" type="button" data-os-view="terminal"><span class="os-app-art os-art-terminal" aria-hidden="true">&gt;_</span><span>Terminal</span></button>
          <button class="os-app" type="button" data-os-view="resume"><span class="os-app-art os-art-resume" aria-hidden="true">CV<span class="os-paper-lines"></span></span><span>Résumé</span></button>
        </nav>
        <section class="os-window" aria-labelledby="os-window-title" hidden>
          <header class="os-window-bar">
            <div class="os-window-controls"><button class="os-control os-control-close" type="button" data-os-close aria-label="Close window">×</button><button class="os-control os-control-min" type="button" data-os-minimize aria-label="Minimize window">−</button></div>
            <h3 id="os-window-title"></h3><span class="os-window-meta" aria-hidden="true">SALMAN / HOME</span>
          </header>
          <div class="os-window-content"></div>
        </section>
      </div>
      <footer class="os-taskbar"><span class="os-session"><span aria-hidden="true"></span>Dhaka, Bangladesh</span><button class="os-task" type="button" data-os-restore hidden></button><span class="os-key-hint"><kbd>esc</kbd> to leave</span></footer>
    </div>`;

  desktop.querySelector('[data-os-exit]').addEventListener('click', () => desktop.close());
  desktop.querySelectorAll('[data-os-view]').forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.osView));
  });
  desktop.querySelector('[data-os-close]').addEventListener('click', closeWindow);
  desktop.querySelector('[data-os-minimize]').addEventListener('click', () => {
    minimized = true;
    desktop.querySelector('.os-window').hidden = true;
    updateTask();
    desktop.querySelector('[data-os-restore]').focus({ preventScroll: true });
  });
  desktop.querySelector('[data-os-restore]').addEventListener('click', () => showView(activeView));
  desktop.addEventListener('close', () => {
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  desktop.addEventListener('click', (event) => {
    if (event.target === desktop) {
      const bounds = desktop.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) desktop.close();
    }
  });
  document.body.append(desktop);
}

const windowTitles = { about: 'About me.txt', projects: 'Selected projects', terminal: 'Terminal', resume: 'Salman_CV.pdf' };

function updateTask() {
  const task = desktop.querySelector('[data-os-restore]');
  task.hidden = !activeView;
  task.textContent = activeView ? `${minimized ? '↥' : '•'} ${windowTitles[activeView]}` : '';
  task.setAttribute('aria-label', `${minimized ? 'Restore' : 'Focus'} ${windowTitles[activeView] || 'window'}`);
  desktop.querySelectorAll('[data-os-view]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.osView === activeView && !minimized));
  });
}

function closeWindow() {
  const previous = activeView;
  activeView = null;
  minimized = false;
  desktop.querySelector('.os-window').hidden = true;
  updateTask();
  desktop.querySelector(`[data-os-view="${previous}"]`)?.focus({ preventScroll: true });
}

function showView(view) {
  if (!windowTitles[view]) return;
  const switchingView = activeView !== view;
  activeView = view;
  minimized = false;
  desktop.querySelector('#os-window-title').textContent = windowTitles[view];
  const content = desktop.querySelector('.os-window-content');
  content.classList.toggle('os-terminal-content', view === 'terminal');
  const renderers = { about: renderAbout, projects: renderProjects, resume: renderResume, terminal: renderTerminal };
  content.replaceChildren(renderers[view]());
  if (switchingView) content.scrollTop = 0;
  desktop.querySelector('.os-window').hidden = false;
  updateTask();
  if (view === 'terminal') terminalInput.focus({ preventScroll: true });
  else desktop.querySelector('[data-os-close]').focus({ preventScroll: true });
}

function renderAbout() {
  const wrapper = element('div', 'os-about');
  wrapper.append(element('p', 'os-eyebrow', 'HELLO, WORLD.'), element('h4', 'os-heading', 'I’m Salman.'));
  wrapper.append(element('p', 'os-description', 'A CSE student at United International University, exploring data science and building useful things for everyday problems.'));
  const facts = element('dl', 'os-facts');
  [['Based in', 'Dhaka, Bangladesh'], ['Education', 'B.Sc. in CSE · 2024–2028 (expected)'], ['Next chapter', 'Seeking a machine learning internship']].forEach(([label, value]) => {
    facts.append(element('dt', '', label), element('dd', '', value));
  });
  wrapper.append(facts, element('p', 'os-eyebrow', 'TOOLS ON MY DESK'));
  const tags = element('div', 'os-tags');
  ['Python', 'scikit-learn', 'pandas', 'NumPy', 'React', 'Node.js', 'SQL'].forEach((name) => tags.append(element('span', '', name)));
  wrapper.append(tags, link('Say hello ↗', `mailto:${email}`));
  return wrapper;
}

function renderProjects() {
  const wrapper = element('div', 'os-projects');
  wrapper.append(element('p', 'os-eyebrow', 'THREE IDEAS, BUILT INTO SOMETHING.'));
  projects.forEach((project) => {
    const card = element('article', 'os-project');
    const body = element('div', 'os-project-copy');
    body.append(element('p', 'os-eyebrow', project.type), element('h4', '', project.name), element('p', '', project.description));
    const detail = link('Explore project ↗', project.href);
    detail.addEventListener('click', () => desktop.close());
    body.append(detail);
    card.append(element('span', 'os-project-number', project.symbol), body);
    wrapper.append(card);
  });
  return wrapper;
}

function renderResume() {
  const wrapper = element('div', 'os-resume');
  wrapper.append(element('div', 'os-document-art', 'CV'), element('p', 'os-eyebrow', 'THE DETAILS, ALL IN ONE PLACE.'), element('h4', 'os-heading', 'A little more on paper.'), element('p', 'os-description', 'Education, technical skills, and selected projects. Download my current résumé as a PDF.'));
  const download = link('Download résumé ↓', resumeURL, 'os-primary-link');
  download.download = 'Salman_CV.pdf';
  const preview = link('Open PDF ↗', resumeURL);
  preview.target = '_blank';
  preview.rel = 'noopener';
  const actions = element('div', 'os-resume-actions');
  actions.append(download, preview);
  wrapper.append(actions);
  return wrapper;
}

function printLine(text, type = 'output') {
  const line = element('div', `os-terminal-line os-terminal-${type}`, text);
  terminalOutput.append(line);
  while (terminalOutput.children.length > 100) terminalOutput.firstElementChild.remove();
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function printLink(label, href, download = false) {
  const line = element('div', 'os-terminal-line');
  const anchor = link(label, href, 'os-terminal-link');
  if (download) anchor.download = 'Salman_CV.pdf';
  line.append(anchor);
  terminalOutput.append(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function runCommand(raw) {
  const command = raw.trim().toLowerCase();
  if (!command) return;
  printLine(`salman@home ~ $ ${raw.trim()}`, 'command');
  switch (command) {
    case 'help':
      printLine('about     A little about me\nprojects  Explore three selected projects\nresume    Download my résumé\ncontact   Get in touch\nclear     Clear this terminal\nexit      Close the terminal');
      break;
    case 'about':
    case 'whoami':
      printLine('Salman · CSE / Data Science undergraduate\nUnited International University · 2024–2028 (expected)\nDhaka, Bangladesh\nSeeking a machine learning internship.');
      break;
    case 'projects':
    case 'ls':
      projects.forEach((project) => printLink(`${project.symbol}  ${project.name} ↗`, project.href));
      break;
    case 'resume': printLink('Download Salman_CV.pdf ↓', resumeURL, true); break;
    case 'contact':
      printLink(email, `mailto:${email}`);
      printLink('github.com/DeepSalman ↗', 'https://github.com/DeepSalman');
      break;
    case 'clear': terminalOutput.replaceChildren(); break;
    case 'exit': closeWindow(); break;
    default: printLine(`Command not found: ${raw.trim()}. Type “help” to see available commands.`, 'muted');
  }
}

function renderTerminal() {
  if (terminal) return terminal;
  terminal = element('div', 'os-terminal');
  terminalOutput = element('div', 'os-terminal-output');
  terminalOutput.setAttribute('role', 'log');
  terminalOutput.setAttribute('aria-label', 'Terminal output');
  terminalOutput.setAttribute('aria-live', 'polite');
  terminalOutput.tabIndex = 0;
  const form = element('form', 'os-terminal-form');
  const label = element('label', 'os-terminal-prompt', 'salman@home ~ $');
  label.htmlFor = 'os-terminal-input';
  terminalInput = element('input', 'os-terminal-input');
  terminalInput.id = 'os-terminal-input';
  terminalInput.type = 'text';
  terminalInput.setAttribute('aria-label', 'Terminal command');
  terminalInput.autocomplete = 'off';
  terminalInput.autocapitalize = 'off';
  terminalInput.spellcheck = false;
  terminalInput.maxLength = 300;
  const submit = element('button', 'os-terminal-submit', '↵');
  submit.type = 'submit';
  submit.setAttribute('aria-label', 'Run command');
  form.append(label, terminalInput, submit);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = terminalInput.value;
    if (command.trim()) {
      history.push(command);
      if (history.length > 50) history.shift();
    }
    historyIndex = history.length;
    terminalInput.value = '';
    runCommand(command);
  });
  terminalInput.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
    terminalInput.value = history[historyIndex] || '';
    terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
  });
  terminal.append(terminalOutput, form);
  printLine('SalmanOS / personal edition', 'greeting');
  printLine('A small window into my world. Type “help” to begin.', 'muted');
  return terminal;
}

export async function openOS(trigger) {
  await loadStyles();
  if (!desktop) buildDesktop();
  if (desktop.open) return;
  returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
  desktop.showModal();
  if (activeView === 'terminal' && !minimized) terminalInput.focus({ preventScroll: true });
  else desktop.querySelector('[data-os-view="about"]').focus({ preventScroll: true });
}
