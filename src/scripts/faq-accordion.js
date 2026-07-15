const items = document.querySelectorAll('.faq-item');

let openIndex = 0;

function render() {
  items.forEach((item, i) => {
    const answer = item.querySelector('.faq-answer');
    const chevron = item.querySelector('.faq-chevron');
    const isOpen = i === openIndex;
    answer.classList.toggle('hidden', !isOpen);
    chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  });
}

items.forEach((item, i) => {
  item.addEventListener('click', () => {
    openIndex = openIndex === i ? -1 : i;
    render();
  });
});

render();
