const toggle = document.getElementById('nav-toggle');
const panel = document.getElementById('mobile-nav-panel');

if (toggle && panel) {
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('flex');
    panel.classList.toggle('hidden', !isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      panel.classList.add('hidden');
      panel.classList.remove('flex');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}
