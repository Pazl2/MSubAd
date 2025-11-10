// catalog.js
document.addEventListener('DOMContentLoaded', () => {
  const adsContainer = document.getElementById('ads-container');
  if (!adsContainer) return;

  // Example: when clicking the "Реклама в поезде" link, intercept and load via AJAX
  document.querySelectorAll('.ad-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (!href || !href.includes('/catalog/ads')) return;
      e.preventDefault();
      fetch(href, { headers: { 'Accept': 'application/json' } })
        .then(r => r.json())
        .then(data => {
          adsContainer.innerHTML = '';
          if (!data.ads || data.ads.length === 0) {
            adsContainer.innerHTML = '<p>Рекламных позиций не найдено.</p>';
            return;
          }
          data.ads.forEach(ad => {
            const div = document.createElement('div');
            div.className = 'ad-card';
            div.innerHTML = `<h4>${escapeHtml(ad.name)}</h4>
                             <p>${escapeHtml(ad.description)}</p>
                             <p><strong>Размер:</strong> ${ad.width}x${ad.height}</p>
                             <p><strong>Цена:</strong> ${ad.base_price}</p>`;
            adsContainer.appendChild(div);
          });
        })
        .catch(err => {
          console.error(err);
          adsContainer.innerHTML = '<p>Ошибка загрузки рекламы.</p>';
        });
    });
  });

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; });
  }
});
