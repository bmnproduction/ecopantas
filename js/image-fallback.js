// Jaga agar typo/asset yang hilang tidak menampilkan ikon gambar rusak di UI.
(() => {
  const placeholder = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 120'%3E%3Crect width='160' height='120' rx='18' fill='%23eef5df'/%3E%3Cpath d='M45 76c14-28 40-35 70-40-1 28-13 51-42 55-13 2-23-4-28-15Z' fill='%237bb879'/%3E%3Cpath d='M45 84c18-12 35-25 62-39' stroke='%234b8654' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";
  const seen = new WeakSet();
  function protect(img) {
    if (!(img instanceof HTMLImageElement) || seen.has(img)) return;
    seen.add(img);
    img.addEventListener('error', () => {
      if (img.dataset.ecoFallback) return;
      img.dataset.ecoFallback = '1';
      console.warn('[ECO PANTAS] Aset gambar tidak ditemukan:', img.getAttribute('src'));
      img.src = placeholder;
      if (!img.alt) img.alt = 'Ilustrasi daun';
      img.classList.add('image-fallback');
    }, { once: true });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      // The error event may have fired before this listener was attached.
      queueMicrotask(() => { if (!img.naturalWidth && !img.dataset.ecoFallback) img.dispatchEvent(new Event('error')); });
    }
  }
  document.querySelectorAll('img').forEach(protect);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node instanceof HTMLImageElement) protect(node);
    else if (node instanceof Element) node.querySelectorAll('img').forEach(protect);
  }))).observe(document.documentElement, { childList: true, subtree: true });
})();
