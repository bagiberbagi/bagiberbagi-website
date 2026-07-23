// Perilaku tombol bagikan (lihat Share.astro). Web Share API dipakai bila
// tersedia (share sheet native); tombol salin tautan menyalin URL ke clipboard
// lalu menampilkan centang sesaat. Semua fallback (WA/Telegram/X) tetap tautan
// biasa, jadi tanpa JS pun masih berfungsi.
document.querySelectorAll('[data-share]').forEach((el) => {
  const url = el.dataset.shareUrl || location.href;
  const title = el.dataset.shareTitle || document.title;
  const text = el.dataset.shareText || '';

  const nativeBtn = el.querySelector('[data-share-native]');
  const divider = el.querySelector('[data-share-divider]');
  if (nativeBtn && typeof navigator.share === 'function') {
    nativeBtn.hidden = false;
    if (divider) divider.hidden = false;
    nativeBtn.addEventListener('click', () => {
      navigator.share({ title, text, url }).catch(() => {});
    });
  }

  const copyBtn = el.querySelector('[data-share-copy]');
  if (copyBtn) {
    const idle = copyBtn.querySelector('[data-copy-idle]');
    const done = copyBtn.querySelector('[data-copy-done]');
    let resetTimer;
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        return;
      }
      if (idle) idle.classList.add('hidden');
      if (done) done.classList.remove('hidden');
      copyBtn.setAttribute('aria-label', 'Tautan tersalin');
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        if (idle) idle.classList.remove('hidden');
        if (done) done.classList.add('hidden');
        copyBtn.setAttribute('aria-label', 'Salin tautan');
      }, 1800);
    });
  }
});
