// FAQ page behaviour: accordion toggle, live search filter, TOC scrollspy.

// --- Accordion (independent toggle per item) ---
const items = Array.from(document.querySelectorAll('.faq-item'));

items.forEach((item) => {
  const trigger = item.querySelector('.faq-trigger');
  const answer = item.querySelector('.faq-answer');
  const chevron = item.querySelector('.faq-chevron');
  if (!trigger || !answer || !chevron) return;

  trigger.addEventListener('click', () => {
    const open = answer.classList.toggle('hidden');
    trigger.setAttribute('aria-expanded', String(!open));
    chevron.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
  });
});

// --- Search filter ---
const search = document.getElementById('faq-search');
const cats = Array.from(document.querySelectorAll('.faq-cat'));
const tocItems = Array.from(document.querySelectorAll('[data-toc-item]'));
const empty = document.getElementById('faq-empty');

function tocItemFor(slug) {
  return tocItems.find((el) => el.getAttribute('data-toc-item') === slug);
}

if (search) {
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let anyVisible = false;

    cats.forEach((cat) => {
      const catItems = Array.from(cat.querySelectorAll('.faq-item'));
      let catVisible = 0;

      catItems.forEach((item) => {
        const hay = (
          (item.getAttribute('data-q') || '') +
          ' ' +
          (item.getAttribute('data-a') || '')
        ).toLowerCase();
        const match = q === '' || hay.includes(q);
        item.classList.toggle('hidden', !match);
        if (match) catVisible++;
      });

      cat.classList.toggle('hidden', catVisible === 0);
      const toc = tocItemFor(cat.getAttribute('data-cat'));
      if (toc) toc.classList.toggle('hidden', catVisible === 0);
      if (catVisible > 0) anyVisible = true;
    });

    if (empty) empty.classList.toggle('hidden', anyVisible);
  });
}

// --- TOC scrollspy ---
const links = Array.from(document.querySelectorAll('[data-toc-link]'));
const ACTIVE = ['bg-brand-blueTint', 'border-brand-blue', 'text-ink', 'font-semibold'];
const INACTIVE = ['border-transparent', 'text-muted'];

function setActive(slug) {
  links.forEach((link) => {
    const on = link.getAttribute('data-toc-link') === slug;
    ACTIVE.forEach((c) => link.classList.toggle(c, on));
    INACTIVE.forEach((c) => link.classList.toggle(c, !on));
  });
}

if (links.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );
  cats.forEach((cat) => observer.observe(cat));
}
