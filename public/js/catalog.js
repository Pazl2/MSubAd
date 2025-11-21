// static/js/catalog.js
class CatalogManager {
  constructor() {
    this.el = {
      adsMetro: document.getElementById('ads-metro-container'),
      adsTrain: document.getElementById('ads-train-container'),
      linesWrap: document.getElementById('line-buttons'),
      stationsSection: document.getElementById('stations-section'),
      stationCarousel: document.getElementById('station-carousel'),
      stationSection: document.getElementById('station-section'),
      selectedLineName: document.getElementById('selected-line-name'),
      error: document.getElementById('error-message'),
      stationName: document.getElementById('station-name'),
      stationId: document.getElementById('station-id'),
      stationYear: document.getElementById('station-opening-year'),
      stationFlow: document.getElementById('station-passenger-flow'),
      stationDesc: document.getElementById('station-description'),
      stationLocation: document.getElementById('station-location'),
      stationLine: document.getElementById('station-line')
    };
    this.init();
  }

  init(){
    this.bind();
    this.loadAds();
    // hide station UI
    if (this.el.stationsSection) this.el.stationsSection.style.display = 'none';
    if (this.el.stationSection) this.el.stationSection.style.display = 'none';

    // search/filter elements
    this.searchInput = document.getElementById('ads-search');
    if (this.searchInput) this.searchInput.addEventListener('input', ()=> this.filterAds());
  }

  bind(){
    document.addEventListener('click', (e)=>{
      const lineBtn = e.target.closest('[data-tab="line"]');
      if(lineBtn){
        e.preventDefault();
        const id = lineBtn.getAttribute('data-line-id');
        if(id) this.loadLine(id);
        return;
      }
      const stationBtn = e.target.closest('.carousel-item');
      if (stationBtn){
        const sid = stationBtn.getAttribute('data-station-id');
        if(sid) this.loadStation(sid);
      }
    });
  }

  async loadAds(){
    // concurrent load
    await Promise.all([
      this.fetchAndRenderAds(false, this.el.adsMetro),
      this.fetchAndRenderAds(true, this.el.adsTrain),
    ]);
  }

  async fetchAndRenderAds(location, container){
    if(!container) return;
    container.innerHTML = '<div class="ad-loading">Загрузка...</div>';
    try{
      const res = await fetch(`/catalog/api/ads?location=${location}`, {headers:{'Accept':'application/json'}});
      if(!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json();
      this.renderAds(container, data.ads || []);
    }catch(err){
      console.error(err);
      container.innerHTML = '<div class="ad-error">Не удалось загрузить объявления</div>';
    }
  }

  renderAds(container, ads){
    if(!ads || !ads.length){
      container.innerHTML = '<div class="ad-empty">Рекламных позиций не найдено.</div>';
      return;
    }
    container.innerHTML = ads.map((a, idx) => {
      const price = a.base_price != null ? `${this.escape(a.base_price)} ₽` : 'Свяжитесь';
      // --- Новый блок для placeholder ---
      let imgBlock;
      if (a.image_url) {
        imgBlock = `<div class="ad-card__img" style="background-image:url('${this.escape(a.image_url)}')" role="img" aria-label="${this.escape(a.name)}"></div>`;
      } else {
        // Пропорциональное масштабирование
        let w = parseInt(a.width) || 100, h = parseInt(a.height) || 50;
        const maxSide = 180;
        let scale = Math.min(maxSide / w, maxSide / h, 1);
        let svgW = Math.round(w * scale), svgH = Math.round(h * scale);
        let sizeText = `${this.escape(a.width||'-')}×${this.escape(a.height||'-')}`;
        imgBlock = `
          <div class="ad-card__img ad-card__img--placeholder" aria-hidden="true" style="display:flex;align-items:center;justify-content:center;">
            <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="background:#f5f5f5;border-radius:6px;">
              <rect x="0" y="0" width="${svgW}" height="${svgH}" rx="8" fill="#fdecea" stroke="#c62828" stroke-width="2"/>
              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#c62828" font-family="Segoe UI, Arial" font-weight="bold">${sizeText}</text>
            </svg>
          </div>
        `;
      }
      // add data attributes for client-side filtering
      const loc = a.location ? 'train' : 'metro';
      const searchText = this.escape((a.name || '') + ' ' + (a.description || ''));
      return `
        <article class="ad-card" tabindex="0" style="animation-delay:${idx * 40}ms" data-location="${loc}" data-search="${searchText}">
          ${imgBlock}
          <div class="ad-card__body">
            <div class="ad-card__meta">
              <h3 class="ad-card__title">${this.escape(a.name)}</h3>
            </div>
            <p class="ad-card__desc">${this.escape(a.description||'')}</p>
            <div class="ad-card__footer">
              <div class="ad-card__price">${price}</div>
            </div>
            <div class="ad-card__actions"><button class="btn btn--ghost" type="button">Заказать</button></div>
          </div>
        </article>
      `;
    }).join('');

    // after render, apply filter (in case user typed search earlier)
    this.filterAds();
  }

  filterAds(){
    const q = (this.searchInput && this.searchInput.value || '').trim().toLowerCase();
    const containers = [this.el.adsMetro, this.el.adsTrain];
    containers.forEach(cont => {
      if (!cont) return;
      const cards = cont.querySelectorAll('.ad-card');
      let visibleCount = 0;
      cards.forEach(card => {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const matchesQuery = !q || text.indexOf(q) !== -1;
        if (matchesQuery) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
      // show empty placeholder if none visible
      const emptyEl = cont.querySelector('.ad-empty');
      if (emptyEl) emptyEl.style.display = visibleCount ? 'none' : '';
    });
  }

  async loadLine(lineId){
    // hide station detail
    this.hideStations();
    try{
      const res = await fetch(`/catalog/api/line/${lineId}`, {headers:{'Accept':'application/json'}});
      if(!res.ok) throw new Error('Линия не найдена');
      const data = await res.json();
      this.showStations(data);
    }catch(err){
      console.error(err);
      this.showError(err.message || 'Ошибка при загрузке линии');
    }
  }

  showStations(data){
    if(!data || !data.line) return;
    this.el.stationsSection.style.display = 'block';
    this.el.selectedLineName.textContent = `Станции линии: ${data.line.name}`;
    
    // Сохраняем цвет линии для использования в стилях
    const lineColor = data.line.color_code || '#c62828';
    document.documentElement.style.setProperty('--station-color', lineColor);
    
    if(this.el.stationCarousel){
      this.el.stationCarousel.innerHTML = (data.stations || []).map(s => {
        return `<button class="carousel-item" data-station-id="${s.id}">${this.escape(s.name)}</button>`;
      }).join('');
      this.el.stationCarousel.scrollLeft = 0;
    }
  }

  async loadStation(stationId){
    this.hideStations();
    try{
      const res = await fetch(`/catalog/api/station/${stationId}`, {headers:{'Accept':'application/json'}});
      if(!res.ok) throw new Error('Станция не найдена');
      const data = await res.json();
      this.showStationDetail(data.station);
    }catch(err){
      console.error(err);
      this.showError(err.message || 'Ошибка при загрузке станции');
    }
  }

  showStationDetail(station){
    if(!station) return;
    this.el.stationSection.style.display = 'block';
    this.el.stationName.textContent = station.name || '';
    
    // Устанавливаем цвет линии для деталей станции
    const lineColor = (station.Line && station.Line.color_code) ? station.Line.color_code : '#c62828';
    document.documentElement.style.setProperty('--station-line-color', lineColor);
    this.el.stationName.style.color = lineColor;
    
    this.el.stationId.textContent = station.id || '';
    this.el.stationYear.textContent = station.opening_year || '';
    this.el.stationFlow.textContent = station.passenger_flow || '';
    this.el.stationDesc.textContent = station.description || '';
    this.el.stationLocation.textContent = station.location || '';
    this.el.stationLine.textContent = station.Line ? station.Line.name : '';
    this.el.stationSection.scrollIntoView({behavior:'smooth', block:'start'});
  }

  hideStations(){
    if(this.el.stationsSection) this.el.stationsSection.style.display = 'none';
    if(this.el.stationSection) this.el.stationSection.style.display = 'none';
    this.clearError();
  }

  showError(msg){
    if(!this.el.error) return;
    this.el.error.textContent = msg;
    this.el.error.style.display = 'block';
    setTimeout(()=>{ this.clearError(); }, 6000);
  }

  clearError(){
    if(!this.el.error) return;
    this.el.error.textContent = '';
    this.el.error.style.display = 'none';
  }

  escape(v){
    if(v == null) return '';
    return String(v)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
}

document.addEventListener('DOMContentLoaded', ()=> {
  window.catalogManager = new CatalogManager();
});
