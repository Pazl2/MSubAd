let currentOrderTemplateId = null;
let currentOrderAdType = null;
let minPassengerFlow = 0;
let allLines = [];
let allStations = [];

function showOrderAd() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'none';
  document.getElementById('manageAdTypesMode').style.display = 'none';
  document.getElementById('manageAdSpacesMode').style.display = 'none';
  document.getElementById('manageTemplatesMode').style.display = 'none';
  document.getElementById('checkTemplatesMode').style.display = 'none';
  document.getElementById('manageAuditLogsMode').style.display = 'none';
  document.getElementById('manageOrderAdMode').style.display = 'block';
  
  document.getElementById('pageTitle').textContent = 'Заказ рекламы';
  updateNavLink('order-ad');
  
  loadOrderTemplates();
  loadOrderLines();
}

function switchOrderAdTab(tabName) {
  document.getElementById('order-create-tab').classList.remove('active');
  document.getElementById('order-pending-tab').classList.remove('active');
  document.getElementById('order-active-tab').classList.remove('active');
  document.getElementById('order-completed-tab').classList.remove('active');

  const buttons = document.querySelectorAll('#manageOrderAdMode .tab-button');
  buttons.forEach(btn => btn.classList.remove('active'));

  if (tabName === 'create') {
    document.getElementById('order-create-tab').classList.add('active');
    buttons[0].classList.add('active');
    loadOrderTemplates();
  } else if (tabName === 'pending') {
    document.getElementById('order-pending-tab').classList.add('active');
    buttons[1].classList.add('active');
    loadOrdersByStatus('pending');
  } else if (tabName === 'active') {
    document.getElementById('order-active-tab').classList.add('active');
    buttons[2].classList.add('active');
    loadOrdersByStatus('active');
  } else if (tabName === 'completed') {
    document.getElementById('order-completed-tab').classList.add('active');
    buttons[3].classList.add('active');
    loadOrdersByStatus('completed');
  }
}

function loadOrderTemplates() {
  // Сначала убеждаемся, что типы рекламы загружены
  if (!window.allAdTypes || window.allAdTypes.length === 0) {
    fetch('/cabinet/get-all-ad-types')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.allAdTypes = data.adTypes;
          loadOrderTemplatesData();
        }
      })
      .catch(err => console.error('Error:', err));
  } else {
    loadOrderTemplatesData();
  }
}

function loadOrderTemplatesData() {
  fetch('/cabinet/get-approved-templates')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        renderOrderTemplates(data.templates);
      }
    })
    .catch(err => console.error('Error:', err));
}

function renderOrderTemplates(templates) {
  const container = document.getElementById('orderTemplatesList');
  container.innerHTML = '';

  if (templates.length === 0) {
    container.innerHTML = '<p style="color: #999;">У вас нет одобренных шаблонов</p>';
    return;
  }

  templates.forEach(template => {
    const adType = window.allAdTypes?.find(t => t.id === template.type_id);
    let displayWidth = 350, displayHeight = 350;

    if (adType) {
      const width = parseInt(adType.width) || 100;
      const height = parseInt(adType.height) || 50;
      const aspectRatio = width / height;
      const maxW = 400, maxH = 300;

      if (aspectRatio > maxW / maxH) {
        displayWidth = maxW;
        displayHeight = maxW / aspectRatio;
      } else {
        displayHeight = maxH;
        displayWidth = maxH * aspectRatio;
      }
    }

    const imageHtml = template.content_url 
      ? `<div class="template-preview-image-container" style="width: ${displayWidth}px; height: ${displayHeight}px; margin: 0 auto;"><img src="${template.content_url}" alt="Template" style="width: 100%; height: 100%; object-fit: cover;"></div>`
      : '<p style="color: #999;">Изображение не загружено</p>';

    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = `
      <div class="template-item-header">
        <h4>${template.ad_title}</h4>
        <span class="template-status approved">Одобрено</span>
      </div>
      <div class="template-item-content">${imageHtml}</div>
      <div class="template-item-info">
        <p><strong>Тип рекламы:</strong> ${adType?.name || 'Неизвестный'}</p>
        <p><strong>Локация:</strong> ${adType?.location ? 'Поезд' : 'Станция'}</p>
        <p><strong>Размер:</strong> ${adType?.width}x${adType?.height} мм</p>
      </div>
      <div class="template-item-actions">
        <button class="confirm-button" onclick="openOrderModal(${template.id}, ${template.type_id}, '${adType?.name || ''}', ${adType?.location ? 1 : 0}, ${adType?.base_price || 0}, ${adType?.width || 0}, ${adType?.height || 0})">Заказать</button>
      </div>
    `;
    container.appendChild(item);
  });
}

function loadOrderLines() {
  fetch('/catalog/get-lines')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        allLines = data.lines || [];
      }
    })
    .catch(err => console.error('Error:', err));
}

function openOrderModal(templateId, adTypeId, adTypeName, location, basePrice, width, height) {
  currentOrderTemplateId = templateId;
  currentOrderAdType = {
    id: adTypeId,
    name: adTypeName,
    location: location,
    base_price: parseFloat(basePrice),
    width: parseInt(width),
    height: parseInt(height)
  };

  console.log('Opening modal with ad type:', currentOrderAdType);

  document.getElementById('orderError').textContent = '';
  document.getElementById('orderLine').value = '';
  document.getElementById('orderStation').value = '';
  document.getElementById('orderDays').value = '30';
  document.getElementById('orderBasePrice').textContent = currentOrderAdType.base_price.toFixed(2);
  document.getElementById('orderCoefficient').textContent = '1.00';
  document.getElementById('orderTotalPrice').textContent = (currentOrderAdType.base_price * 30).toFixed(2);

  // Загружаем доступные линии
  populateOrderLines();

  document.getElementById('orderModal').style.display = 'flex';
}

function populateOrderLines() {
  const lineSelect = document.getElementById('orderLine');
  lineSelect.innerHTML = '<option value="">Выберите линию</option>';

  if (!allLines.length) {
    console.error('Lines not loaded');
    document.getElementById('orderError').textContent = 'Ошибка: линии не загружены';
    return;
  }

  const isTrainAd = currentOrderAdType.location;
  console.log('Fetching available lines for location:', isTrainAd ? 'train' : 'station');

  fetch(`/cabinet/get-available-lines?location=${isTrainAd ? 1 : 0}`)
    .then(res => res.json())
    .then(data => {
      console.log('Available lines response:', data);
      
      if (data.success && data.lines) {
        console.log('Available line IDs:', data.lines);
        console.log('All lines:', allLines);
        
        let addedCount = 0;
        data.lines.forEach(lineId => {
          const line = allLines.find(l => l.id === lineId);
          console.log(`Line ${lineId}:`, line);
          
          if (line) {
            const option = document.createElement('option');
            option.value = line.id;
            option.textContent = line.name;
            lineSelect.appendChild(option);
            addedCount++;
          }
        });
        
        console.log(`Added ${addedCount} lines to select`);
        
        if (addedCount === 0) {
          document.getElementById('orderError').textContent = 'Нет доступных линий для выбранного типа рекламы';
        }
      } else {
        console.error('No lines in response or error:', data.message);
        document.getElementById('orderError').textContent = data.message || 'Ошибка при загрузке линий';
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      document.getElementById('orderError').textContent = 'Ошибка при загрузке линий';
    });
}

function updateOrderStations() {
  const lineId = document.getElementById('orderLine').value;
  const stationLabel = document.getElementById('orderStationLabel');
  const stationSelect = document.getElementById('orderStation');
  const isTrainAd = currentOrderAdType.location;

  console.log('=== UPDATE ORDER STATIONS ===');
  console.log('lineId:', lineId);
  console.log('isTrainAd:', isTrainAd);
  console.log('currentOrderAdType:', currentOrderAdType);

  stationSelect.value = '';
  stationSelect.innerHTML = '<option value="">Выберите станцию</option>';
  document.getElementById('orderError').textContent = '';

  if (!lineId) {
    console.log('No line selected, hiding stations');
    stationLabel.style.display = 'none';
    stationSelect.style.display = 'none';
    document.getElementById('orderCoefficient').textContent = '1.00';
    updateOrderPrice();
    return;
  }

  if (isTrainAd) {
    console.log('Train ad - hiding stations');
    stationLabel.style.display = 'none';
    stationSelect.style.display = 'none';
    document.getElementById('orderCoefficient').textContent = '1.00';
    updateOrderPrice();
  } else {
    console.log('Station ad - loading stations for line:', lineId);
    fetch(`/catalog/get-stations-with-availability?line_id=${lineId}`)
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Stations response:', data);
        
        if (data.success && data.stations && data.stations.length > 0) {
          console.log('Found stations:', data.stations.length);
          stationLabel.style.display = 'block';
          stationSelect.style.display = 'block';

          // Находим минимальный пассажиропоток
          const minFlow = Math.min(...data.stations.map(s => s.passenger_flow));
          minPassengerFlow = minFlow;
          console.log('Min passenger flow:', minFlow);

          data.stations.forEach(station => {
            console.log(`Adding station: ${station.name} (flow: ${station.passenger_flow})`);
            const option = document.createElement('option');
            option.value = station.id;
            option.textContent = station.name;
            option.dataset.flow = station.passenger_flow;
            stationSelect.appendChild(option);
          });

          updateOrderPrice();
        } else {
          console.error('No stations found or error:', data.message);
          stationLabel.style.display = 'block';
          stationSelect.style.display = 'block';
          stationSelect.innerHTML = '<option value="">Нет доступных станций на этой линии</option>';
          document.getElementById('orderError').textContent = data.message || 'Нет доступных станций';
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        stationLabel.style.display = 'block';
        stationSelect.style.display = 'block';
        stationSelect.innerHTML = '<option value="">Ошибка загрузки станций</option>';
        document.getElementById('orderError').textContent = 'Ошибка при загрузке станций: ' + err.message;
      });
  }
}

function updateOrderPrice() {
  const days = parseInt(document.getElementById('orderDays').value) || 1;
  const stationId = document.getElementById('orderStation').value;
  const basePrice = currentOrderAdType.base_price;
  let coefficient = 1.00;

  if (stationId) {
    const stationOption = document.querySelector(`#orderStation option[value="${stationId}"]`);
    if (stationOption) {
      const flow = parseInt(stationOption.dataset.flow);
      coefficient = flow / minPassengerFlow;
    }
  }

  const totalPrice = basePrice * coefficient * days;

  document.getElementById('orderCoefficient').textContent = coefficient.toFixed(2);
  document.getElementById('orderTotalPrice').textContent = totalPrice.toFixed(2);
}

function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
  currentOrderTemplateId = null;
  currentOrderAdType = null;
}

function submitOrder() {
  const lineId = parseInt(document.getElementById('orderLine').value);
  const stationId = document.getElementById('orderStation').value ? parseInt(document.getElementById('orderStation').value) : null;
  const days = parseInt(document.getElementById('orderDays').value);
  const totalPrice = parseFloat(document.getElementById('orderTotalPrice').textContent);
  const errorEl = document.getElementById('orderError');

  errorEl.textContent = '';

  if (!lineId) {
    errorEl.textContent = 'Выберите линию метро';
    return;
  }

  if (!currentOrderAdType.location && !stationId) {
    errorEl.textContent = 'Выберите станцию';
    return;
  }

  if (days < 1) {
    errorEl.textContent = 'Период должен быть не менее 1 дня';
    return;
  }

  fetch('/cabinet/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: currentOrderTemplateId,
      line_id: lineId,
      station_id: stationId,
      days: days,
      total_price: totalPrice
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Заказ успешно создан!');
        closeOrderModal();
        loadOrdersByStatus('pending');
        switchOrderAdTab('pending');
      } else {
        errorEl.textContent = data.message;
      }
    })
    .catch(err => {
      console.error(err);
      errorEl.textContent = 'Ошибка сервера';
    });
}

function loadOrdersByStatus(status) {
  fetch(`/cabinet/get-orders?status=${status}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        renderOrders(data.orders, status);
      }
    })
    .catch(err => console.error('Error:', err));
}

function renderOrders(orders, status) {
  const containerId = `order${status.charAt(0).toUpperCase() + status.slice(1)}List`;
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  console.log(`Rendering ${status} orders:`, orders);

  if (orders.length === 0) {
    container.innerHTML = '<p style="color: #999;">Заказы не найдены</p>';
    return;
  }

  orders.forEach(order => {
    console.log('Order data:', order);
    
    const template = order.Advertisement;
    if (!template) {
      console.error('Template not found for order:', order);
      return;
    }

    const adType = window.allAdTypes?.find(t => t.id === template.type_id);
    
    let displayWidth = 350, displayHeight = 350;
    if (adType) {
      const width = parseInt(adType.width) || 100;
      const height = parseInt(adType.height) || 50;
      const aspectRatio = width / height;
      const maxW = 400, maxH = 300;

      if (aspectRatio > maxW / maxH) {
        displayWidth = maxW;
        displayHeight = maxW / aspectRatio;
      } else {
        displayHeight = maxH;
        displayWidth = maxH * aspectRatio;
      }
    }

    const imageHtml = template.content_url 
      ? `<div class="template-preview-image-container" style="width: ${displayWidth}px; height: ${displayHeight}px; margin: 0 auto;"><img src="${template.content_url}" alt="Template" style="width: 100%; height: 100%; object-fit: cover;"></div>`
      : '<p style="color: #999;">Изображение не загружено</p>';

    const statusBadges = {
      'pending': 'Ожидает оплаты',
      'active': 'Активно',
      'completed': 'Завершено'
    };

    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = `
      <div class="template-item-header">
        <h4>${template.ad_title}</h4>
        <span class="template-status ${status}">${statusBadges[status]}</span>
      </div>
      <div class="template-item-content">${imageHtml}</div>
      <div class="template-item-info">
        <p><strong>Контракт:</strong> ${order.contract_number || 'Не выдан'}</p>
        <p><strong>Период:</strong> ${new Date(order.start_date).toLocaleDateString('ru-RU')} — ${new Date(order.end_date).toLocaleDateString('ru-RU')}</p>
        <p><strong>Сумма:</strong> ${parseFloat(order.total_price).toFixed(2)} BYN</p>
      </div>
      <div class="template-item-actions">
        ${status === 'pending' ? `<button class="confirm-button" onclick="payOrder(${order.id}, ${parseFloat(order.total_price)})">Оплатить</button>` : ''}
      </div>
    `;
    container.appendChild(item);
  });
}

function payOrder(orderId, amount) {
  if (confirm(`Вы уверены, что хотите оплатить ${amount.toFixed(2)} BYN?`)) {
    fetch('/cabinet/pay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        amount: amount
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(`Оплата успешно произведена!\nНовый баланс: ${data.newBalance} BYN`);
        loadOrdersByStatus('pending');
        loadOrdersByStatus('active');
        // Обновляем баланс если он отображается на странице
        const balanceElements = document.querySelectorAll('.user-balance strong');
        balanceElements.forEach(el => {
          if (el.textContent.includes('BYN')) {
            el.textContent = `${data.newBalance} BYN`;
          }
        });
      } else {
        alert(`Ошибка оплаты: ${data.message}`);
      }
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка при оплате заказа');
    });
  }
}
