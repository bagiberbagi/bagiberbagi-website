const desktopMenu = document.querySelector('[data-program-menu]');
const desktopTrigger = desktopMenu?.querySelector('[data-program-trigger]');
const desktopPanel = desktopMenu?.querySelector('[data-program-panel]');
const desktopChevron = desktopMenu?.querySelector('[data-program-chevron]');

function closeDesktopMenu() {
  desktopPanel?.classList.add('hidden');
  desktopTrigger?.setAttribute('aria-expanded', 'false');
  desktopChevron?.classList.remove('rotate-180');
}

function openDesktopMenu() {
  desktopPanel?.classList.remove('hidden');
  desktopTrigger?.setAttribute('aria-expanded', 'true');
  desktopChevron?.classList.add('rotate-180');
}

if (desktopMenu && desktopTrigger && desktopPanel) {
  desktopTrigger.addEventListener('click', () => {
    const isOpen = desktopTrigger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeDesktopMenu() : openDesktopMenu();
  });

  document.addEventListener('click', (e) => {
    if (!desktopMenu.contains(e.target)) closeDesktopMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDesktopMenu();
  });
}

const mobileTrigger = document.querySelector('[data-program-trigger-mobile]');
const mobilePanel = document.querySelector('[data-program-panel-mobile]');
const mobileChevron = document.querySelector('[data-program-chevron-mobile]');

if (mobileTrigger && mobilePanel) {
  mobileTrigger.addEventListener('click', () => {
    const isOpen = mobilePanel.classList.toggle('flex');
    mobilePanel.classList.toggle('hidden', !isOpen);
    mobileTrigger.setAttribute('aria-expanded', String(isOpen));
    mobileChevron?.classList.toggle('rotate-180', isOpen);
  });
}
