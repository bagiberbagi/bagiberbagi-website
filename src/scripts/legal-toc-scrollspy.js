const links = document.querySelectorAll('[data-toc-link]');

const setActive = (slug) => {
  links.forEach((link) => {
    const isActive = link.getAttribute('data-toc-link') === slug;
    link.classList.toggle('border-brand-blue', isActive);
    link.classList.toggle('text-ink', isActive);
    link.classList.toggle('font-semibold', isActive);
    link.classList.toggle('border-transparent', !isActive);
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

links.forEach((link) => {
  const slug = link.getAttribute('data-toc-link');
  const el = slug ? document.getElementById(slug) : null;
  if (el) observer.observe(el);
});
