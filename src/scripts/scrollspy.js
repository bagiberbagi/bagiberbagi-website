import { NAV_SECTION_IDS } from '../consts';

const links = document.querySelectorAll('[data-nav-link]');

const setActive = (id) => {
  links.forEach((link) => {
    const isActive = link.getAttribute('data-nav-link') === id;
    link.classList.toggle('font-bold', isActive);
    link.classList.toggle('text-ink', isActive);
    link.classList.toggle('font-medium', !isActive);
    link.classList.toggle('text-muted', !isActive);
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  },
  { rootMargin: '-40% 0px -50% 0px' }
);

NAV_SECTION_IDS.forEach((id) => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});
