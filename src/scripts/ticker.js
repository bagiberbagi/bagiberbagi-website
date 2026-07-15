import { ACTIVITIES } from '../consts';

const el = document.getElementById('activity-ticker');
let index = 0;

if (el) {
  setInterval(() => {
    index = (index + 1) % ACTIVITIES.length;
    el.textContent = ACTIVITIES[index];
  }, 4000);
}
