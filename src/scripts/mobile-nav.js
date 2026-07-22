const toggle = document.getElementById('nav-toggle');
const panel = document.getElementById('mobile-nav-panel');
// Header transparan di puncak; saat menu terbuka ia dipaksa solid (.menu-open)
// agar panel tak menembus foto zona hero.
const header = document.querySelector('[data-header]');

if (toggle && panel) {
  const setOpen = (isOpen) => {
    panel.classList.toggle('flex', isOpen);
    panel.classList.toggle('hidden', !isOpen);
    header?.classList.toggle('menu-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  toggle.addEventListener('click', () => {
    setOpen(panel.classList.contains('hidden'));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
}
