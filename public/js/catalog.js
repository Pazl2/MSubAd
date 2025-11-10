class CatalogManager {
    constructor() {
        this.elements = {
            errorDiv: document.getElementById('error-message'),
            adsPanel: document.getElementById('ads-panel'),
            stationsSection: document.getElementById('stations-section'),
            stationSection: document.getElementById('station-section'),
            adsWrapper: document.querySelector('.ads-wrapper'),
            advertisingButtons: document.querySelector('.advertising-buttons'),
            backButton: document.getElementById('back-to-ads-btn'),
            adsContainer: document.getElementById('ads-container')
        };
        
        this.activeAdButton = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.addClickOutsideListener();
    }

    bindEvents() {
        // Делегирование событий для динамических элементов
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-tab="ads"]');
            if (target) {
                this.handleAdButtonClick(target);
                return;
            }

            const lineBtn = e.target.closest('.line-btn');
            if (lineBtn) {
                this.handleLineButtonClick(lineBtn);
                return;
            }

            const stationBtn = e.target.closest('.carousel-item');
            if (stationBtn) {
                this.handleStationButtonClick(stationBtn);
            }
        });

        this.elements.backButton.addEventListener('click', () => this.resetAdsView());
    }

    addClickOutsideListener() {
        document.addEventListener('click', (e) => {
            const { adsPanel, backButton } = this.elements;
            const isAdButton = e.target.closest('[data-tab="ads"]');
            const isBackButton = e.target.closest('#back-to-ads-btn');
            
            if (!adsPanel.contains(e.target) && !isAdButton && !isBackButton && 
                adsPanel.classList.contains('show')) {
                this.resetAdsView();
            }
        });
    }

    handleAdButtonClick(button) {
        if (this.activeAdButton === button) {
            this.resetAdsView();
            return;
        }

        this.setActiveAdButton(button);
        const location = button.getAttribute('data-location') === 'true';
        this.loadAds(location);
    }

    setActiveAdButton(button) {
        if (this.activeAdButton) {
            this.activeAdButton.classList.remove('active');
        }
        this.activeAdButton = button;
        button.classList.add('active');
    }

    async loadAds(location) {
        this.hideSections();
        this.showAdsPanel();

        try {
            const url = `/catalog/api/ads?location=${location}`;
            const response = await fetch(url);
            const data = await response.json();
            
            this.renderAds(data.ads);
        } catch (error) {
            this.showError('Ошибка загрузки рекламы');
        }
    }

    renderAds(ads) {
        if (ads && ads.length) {
            this.elements.adsContainer.innerHTML = ads.map(ad => `
                <div class="ad-card">
                    <h4>${ad.name}</h4>
                    <p>${ad.description}</p>
                    <p><strong>Размер:</strong> ${ad.width}x${ad.height}</p>
                    <p><strong>Цена:</strong> ${ad.base_price}</p>
                </div>
            `).join('');
        } else {
            this.elements.adsContainer.innerHTML = '<p>Рекламных позиций не найдено.</p>';
        }
    }

    showAdsPanel() {
        const { advertisingButtons, adsPanel, adsWrapper, backButton } = this.elements;
        
        advertisingButtons.classList.add('compact');
        adsPanel.classList.add('show');
        adsWrapper.classList.add('shift-left');
        backButton.classList.add('show');
        adsPanel.style.display = 'block';
    }

    resetAdsView() {
        if (this.activeAdButton) {
            this.activeAdButton.classList.remove('active');
            this.activeAdButton = null;
        }

        const { advertisingButtons, adsPanel, adsWrapper, backButton } = this.elements;
        
        advertisingButtons.classList.remove('compact');
        adsPanel.classList.remove('show');
        adsWrapper.classList.remove('shift-left');
        backButton.classList.remove('show');
        
        setTimeout(() => {
            adsPanel.style.display = 'none';
        }, 300);
    }

    async handleLineButtonClick(button) {
        const line_id = button.getAttribute('data-line-id');
        this.resetAdsView();
        this.hideSections(['stationSection']);

        try {
            const response = await fetch(`/catalog/api/line/${line_id}`);
            if (!response.ok) throw new Error('Линия не найдена');
            
            const data = await response.json();
            this.renderLineStations(data);
        } catch (error) {
            this.showError(error.message);
        }
    }

    renderLineStations(data) {
        this.elements.stationsSection.style.display = 'block';
        
        document.getElementById('selected-line-name').textContent = data.line.name;
        
        const carousel = document.getElementById('station-carousel');
        carousel.style.backgroundColor = data.line.color_code;
        carousel.innerHTML = data.stations.map(station => 
            `<button class="carousel-item" data-station-id="${station.id}">
                ${station.name}
            </button>`
        ).join('');
    }

    async handleStationButtonClick(button) {
        const stationId = button.getAttribute('data-station-id');
        this.resetAdsView();
        this.hideSections(['stationsSection']);

        try {
            const response = await fetch(`/catalog/api/station/${stationId}`);
            if (!response.ok) throw new Error('Станция не найдена');
            
            const data = await response.json();
            this.renderStationDetails(data.station);
        } catch (error) {
            this.showError(error.message);
        }
    }

    renderStationDetails(station) {
        this.elements.stationSection.style.display = 'block';
        
        document.getElementById('station-name').textContent = station.name;
        document.getElementById('station-name').style.color = station.Line?.color_code || '#000';
        document.getElementById('station-id').textContent = station.id;
        document.getElementById('station-opening-year').textContent = station.opening_year;
        document.getElementById('station-passenger-flow').textContent = station.passenger_flow;
        document.getElementById('station-description').textContent = station.description;
        document.getElementById('station-location').textContent = station.location;
        document.getElementById('station-line').textContent = station.Line?.name || '';
    }

    hideSections(exclude = []) {
        const sections = {
            stationsSection: this.elements.stationsSection,
            stationSection: this.elements.stationSection,
            errorDiv: this.elements.errorDiv
        };

        Object.entries(sections).forEach(([key, element]) => {
            if (!exclude.includes(key)) {
                element.style.display = 'none';
            }
        });
    }

    showError(message) {
        this.elements.errorDiv.textContent = message;
        this.elements.errorDiv.style.display = 'block';
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new CatalogManager();
});