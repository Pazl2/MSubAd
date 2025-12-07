function showManageUsers() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'block';
  document.getElementById('manageAdTypesMode').style.display = 'none';
  document.getElementById('manageAdSpacesMode').style.display = 'none';
  document.getElementById('manageTemplatesMode').style.display = 'none';
  document.getElementById('checkTemplatesMode').style.display = 'none';
  document.getElementById('manageAuditLogsMode').style.display = 'none';
  document.getElementById('pageTitle').textContent = 'Управление пользователями';
  updateNavLink('manage-users');
  clearAdTypeForm();
}

function showManageAdTypes() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'none';
  document.getElementById('manageAdTypesMode').style.display = 'block';
  document.getElementById('manageAdSpacesMode').style.display = 'none';
  document.getElementById('manageTemplatesMode').style.display = 'none';
  document.getElementById('checkTemplatesMode').style.display = 'none';
  document.getElementById('manageAuditLogsMode').style.display = 'none';
  document.getElementById('pageTitle').textContent = 'Управление типами рекламы';
  updateNavLink('manage-ad-types');
  loadAdTypes();
}

function showManageAdSpaces() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'none';
  document.getElementById('manageAdTypesMode').style.display = 'none';
  document.getElementById('manageAdSpacesMode').style.display = 'block';
  document.getElementById('manageTemplatesMode').style.display = 'none';
  document.getElementById('checkTemplatesMode').style.display = 'none';
  document.getElementById('manageAuditLogsMode').style.display = 'none';
  document.getElementById('pageTitle').textContent = 'Управление рекламными местами';
  updateNavLink('manage-ad-spaces');
  loadAdSpacesOptions();
}

function downloadUsersDatabase() {
  fetch('/cabinet/download-users')
    .then(response => {
      if (!response.ok) throw new Error('Ошибка при скачивании');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'users_database.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка при скачивании базы данных пользователей');
    });
}

function downloadAdTypesDatabase() {
  fetch('/cabinet/download-ad-types')
    .then(response => {
      if (!response.ok) throw new Error('Ошибка при скачивании');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ad_types_database.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка при скачивании базы данных');
    });
}

function downloadAdSpacesDatabase() {
  fetch('/cabinet/download-ad-spaces')
    .then(response => {
      if (!response.ok) throw new Error('Ошибка при скачивании');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ad_spaces_database.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка при скачивании базы данных рекламных мест');
    });
}

function loadAdTypes() {
  fetch('/cabinet/get-ad-types')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        let adTypes = data.adTypes;
        const sortValue = document.getElementById('adTypeSort').value;
        
        if (sortValue === 'asc') {
          adTypes.sort((a, b) => a.base_price - b.base_price);
        } else if (sortValue === 'desc') {
          adTypes.sort((a, b) => b.base_price - a.base_price);
        }

        const listContainer = document.getElementById('adTypesList');
        listContainer.innerHTML = '';
        if (adTypes.length === 0) {
          listContainer.innerHTML = '<p style="color: #999;">Типы рекламы не найдены</p>';
          return;
        }
        adTypes.forEach(adType => {
          const item = document.createElement('div');
          item.className = 'ad-type-item';
          item.innerHTML = `
            <div class="ad-type-info">
              <h4>${adType.name}</h4>
              <p><strong>Описание:</strong> ${adType.description}</p>
              <p><strong>Размер:</strong> ${adType.width}x${adType.height} мм</p>
              <p><strong>Локация:</strong> ${adType.location ? 'Поезд' : 'Станция'}</p>
              <p><strong>Базовая цена:</strong> ${adType.base_price} Br</p>
            </div>
            <div class="ad-type-actions">
              <button class="confirm-button" onclick="selectAdType(${adType.id}, '${adType.name}', '${adType.description}', ${adType.width}, ${adType.height}, ${adType.location}, ${adType.base_price})">Выбрать</button>
              <button class="delete-button" onclick="deleteAdType(${adType.id})">Удалить</button>
            </div>
          `;
          listContainer.appendChild(item);
        });
      }
    })
    .catch(err => console.error(err));
}

function selectAdType(id, name, description, width, height, location, basePrice) {
  document.getElementById('adTypeName').value = name;
  document.getElementById('adTypeDescription').value = description;
  document.getElementById('adTypeWidth').value = width;
  document.getElementById('adTypeHeight').value = height;
  document.getElementById('adTypeLocation').value = location ? '1' : '0';
  document.getElementById('adTypeBasePrice').value = basePrice;
  document.getElementById('adTypeName').dataset.adTypeId = id;
}

function addAdType() {
  const name = document.getElementById('adTypeName').value.trim();
  const description = document.getElementById('adTypeDescription').value.trim();
  const width = parseInt(document.getElementById('adTypeWidth').value);
  const height = parseInt(document.getElementById('adTypeHeight').value);
  const location = parseInt(document.getElementById('adTypeLocation').value);
  const basePrice = parseFloat(document.getElementById('adTypeBasePrice').value);
  const errorEl = document.getElementById('adTypeError');
  errorEl.textContent = '';

  if (!name || !description || !width || !height || !basePrice) {
    errorEl.textContent = 'Заполните все поля';
    return;
  }

  if (document.getElementById('adTypeName').dataset.adTypeId) {
    errorEl.textContent = 'Очистите форму перед добавлением нового типа';
    return;
  }

  fetch('/cabinet/add-ad-type', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, width, height, location, basePrice })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Тип рекламы успешно добавлен');
      clearAdTypeForm();
      loadAdTypes();
    } else {
      errorEl.textContent = data.message;
    }
  })
  .catch(err => {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера';
  });
}

function updateAdType() {
  const adTypeId = document.getElementById('adTypeName').dataset.adTypeId;
  if (!adTypeId) {
    document.getElementById('adTypeError').textContent = 'Выберите тип рекламы для изменения';
    return;
  }

  const name = document.getElementById('adTypeName').value.trim();
  const description = document.getElementById('adTypeDescription').value.trim();
  const width = parseInt(document.getElementById('adTypeWidth').value);
  const height = parseInt(document.getElementById('adTypeHeight').value);
  const location = parseInt(document.getElementById('adTypeLocation').value);
  const basePrice = parseFloat(document.getElementById('adTypeBasePrice').value);
  const errorEl = document.getElementById('adTypeError');
  errorEl.textContent = '';

  if (!name || !description || !width || !height || !basePrice) {
    errorEl.textContent = 'Заполните все поля';
    return;
  }

  fetch('/cabinet/update-ad-type', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: adTypeId, name, description, width, height, location, basePrice })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Тип рекламы успешно изменен');
      clearAdTypeForm();
      loadAdTypes();
    } else {
      errorEl.textContent = data.message;
    }
  })
  .catch(err => {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера';
  });
}

function deleteAdType(id) {
  if (!confirm('Вы уверены, что хотите удалить этот тип рекламы?')) {
    return;
  }

  fetch('/cabinet/delete-ad-type', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Тип рекламы успешно удален');
      loadAdTypes();
    } else {
      alert('Ошибка: ' + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert('Ошибка сервера');
  });
}

function loadAdSpacesOptions() {
  fetch('/cabinet/get-ad-types')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const select = document.getElementById('spaceAdType');
        select.innerHTML = '<option value="">Выберите тип рекламы</option>';
        select.disabled = true;
        data.adTypes.forEach(type => {
          select.innerHTML += `<option value="${type.id}" data-location="${type.location ? '1' : '0'}">${type.name}</option>`;
        });
      }
    })
    .catch(err => console.error('Error loading ad types:', err));

  fetch('/catalog/get-lines')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.lines) {
        const select = document.getElementById('spaceLine');
        select.innerHTML = '<option value="">Выберите линию</option>';
        select.disabled = true;
        data.lines.forEach(line => {
          select.innerHTML += `<option value="${line.id}">${line.name}</option>`;
        });
      }
    })
    .catch(err => console.error('Error loading lines:', err));
}

function updateSpaceOptions() {
  const location = document.getElementById('spaceLocation').value;
  const adTypeSelect = document.getElementById('spaceAdType');
  const lineSelect = document.getElementById('spaceLine');

  document.getElementById('spaceStation').value = '';
  document.getElementById('spaceTrain').value = '';
  document.getElementById('spaceStationLabel').style.display = 'none';
  document.getElementById('spaceStation').style.display = 'none';
  document.getElementById('spaceTrainLabel').style.display = 'none';
  document.getElementById('spaceTrain').style.display = 'none';

  if (location) {
    adTypeSelect.disabled = false;
    const options = adTypeSelect.querySelectorAll('option[data-location]');
    options.forEach(opt => {
      if (opt.dataset.location === location) {
        opt.style.display = 'block';
      } else {
        opt.style.display = 'none';
      }
    });
    adTypeSelect.value = '';
    lineSelect.disabled = true;
    lineSelect.value = '';
  } else {
    adTypeSelect.disabled = true;
    adTypeSelect.value = '';
    lineSelect.disabled = true;
    lineSelect.value = '';
  }
}

function onSpaceTypeChange() {
  const typeId = document.getElementById('spaceAdType').value;
  const lineSelect = document.getElementById('spaceLine');
  if (typeId) {
    lineSelect.disabled = false;
  } else {
    lineSelect.disabled = true;
    lineSelect.value = '';
  }
}

function updateSpaceStationsOrTrains() {
  const location = document.getElementById('spaceLocation').value;
  const typeId = document.getElementById('spaceAdType').value;
  const lineId = document.getElementById('spaceLine').value;

  if (!location || !typeId || !lineId) return;

  if (location === '0') {
    document.getElementById('spaceStationLabel').style.display = 'block';
    document.getElementById('spaceStation').style.display = 'block';
    document.getElementById('spaceTrainLabel').style.display = 'none';
    document.getElementById('spaceTrain').style.display = 'none';

    fetch(`/catalog/get-stations?line_id=${lineId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stations && data.stations.length > 0) {
          const select = document.getElementById('spaceStation');
          select.innerHTML = '<option value="">Выберите станцию</option>';
          data.stations.forEach(station => {
            select.innerHTML += `<option value="${station.id}">${station.name}</option>`;
          });
        } else {
          document.getElementById('spaceStation').innerHTML = '<option value="">Станции не найдены</option>';
        }
      })
      .catch(err => {
        console.error('Error loading stations:', err);
        document.getElementById('spaceStation').innerHTML = '<option value="">Ошибка загрузки</option>';
      });
  } else if (location === '1') {
    document.getElementById('spaceStationLabel').style.display = 'none';
    document.getElementById('spaceStation').style.display = 'none';
    document.getElementById('spaceTrainLabel').style.display = 'block';
    document.getElementById('spaceTrain').style.display = 'block';

    fetch(`/catalog/get-trains?line_id=${lineId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.trains && data.trains.length > 0) {
          const select = document.getElementById('spaceTrain');
          select.innerHTML = '<option value="">Выберите поезд</option>';
          data.trains.forEach(train => {
            select.innerHTML += `<option value="${train.id}">${train.number}</option>`;
          });
        } else {
          document.getElementById('spaceTrain').innerHTML = '<option value="">Поезда не найдены</option>';
        }
      })
      .catch(err => {
        console.error('Error loading trains:', err);
        document.getElementById('spaceTrain').innerHTML = '<option value="">Ошибка загрузки</option>';
      });
  }
}

function addAdSpaces() {
  const location = parseInt(document.getElementById('spaceLocation').value);
  const typeId = parseInt(document.getElementById('spaceAdType').value);
  const quantity = parseInt(document.getElementById('spaceQuantity').value);
  const errorEl = document.getElementById('spaceError');
  errorEl.textContent = '';

  let stationId = null, trainId = null;

  if (location === 0) {
    stationId = parseInt(document.getElementById('spaceStation').value);
    if (!stationId || isNaN(stationId)) {
      errorEl.textContent = 'Выберите станцию';
      return;
    }
  } else if (location === 1) {
    trainId = parseInt(document.getElementById('spaceTrain').value);
    if (!trainId || isNaN(trainId)) {
      errorEl.textContent = 'Выберите поезд';
      return;
    }
  } else {
    errorEl.textContent = 'Выберите локацию';
    return;
  }

  if (!typeId || isNaN(typeId) || !quantity || isNaN(quantity) || quantity < 1) {
    errorEl.textContent = 'Заполните все поля корректно';
    return;
  }

  fetch('/cabinet/add-ad-spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ typeId, quantity, stationId, trainId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(data.message);
      document.getElementById('spaceLocation').value = '';
      document.getElementById('spaceAdType').value = '';
      document.getElementById('spaceLine').value = '';
      document.getElementById('spaceStation').value = '';
      document.getElementById('spaceTrain').value = '';
      document.getElementById('spaceQuantity').value = '';
      updateSpaceOptions();
    } else {
      errorEl.textContent = data.message;
    }
  })
  .catch(err => {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера';
  });
}

function deleteAdSpaces() {
  const location = parseInt(document.getElementById('spaceLocation').value);
  const typeId = parseInt(document.getElementById('spaceAdType').value);
  const quantity = parseInt(document.getElementById('spaceQuantity').value);
  const errorEl = document.getElementById('spaceError');
  errorEl.textContent = '';

  let stationId = null, trainId = null;

  if (location === 0) {
    stationId = parseInt(document.getElementById('spaceStation').value);
    if (!stationId || isNaN(stationId)) {
      errorEl.textContent = 'Выберите станцию';
      return;
    }
  } else if (location === 1) {
    trainId = parseInt(document.getElementById('spaceTrain').value);
    if (!trainId || isNaN(trainId)) {
      errorEl.textContent = 'Выберите поезд';
      return;
    }
  } else {
    errorEl.textContent = 'Выберите локацию';
    return;
  }

  if (!typeId || isNaN(typeId) || !quantity || isNaN(quantity) || quantity < 1) {
    errorEl.textContent = 'Заполните все поля корректно';
    return;
  }

  if (!confirm('Вы уверены, что хотите удалить эти рекламные места?')) {
    return;
  }

  fetch('/cabinet/delete-ad-spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ typeId, quantity, stationId, trainId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(data.message);
      document.getElementById('spaceLocation').value = '';
      document.getElementById('spaceAdType').value = '';
      document.getElementById('spaceLine').value = '';
      document.getElementById('spaceStation').value = '';
      document.getElementById('spaceTrain').value = '';
      document.getElementById('spaceQuantity').value = '';
      updateSpaceOptions();
    } else {
      errorEl.textContent = data.message;
    }
  })
  .catch(err => {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера';
  });
}

function clearAdTypeForm() {
  document.getElementById('adTypeName').value = '';
  document.getElementById('adTypeDescription').value = '';
  document.getElementById('adTypeWidth').value = '';
  document.getElementById('adTypeHeight').value = '';
  document.getElementById('adTypeLocation').value = '0';
  document.getElementById('adTypeBasePrice').value = '';
  document.getElementById('adTypeError').textContent = '';
  delete document.getElementById('adTypeName').dataset.adTypeId;
}

function changeUserRole() {
  const username = document.getElementById('changeRoleUsername').value.trim();
  const role = document.getElementById('roleSelect').value;
  const errorEl = document.getElementById('changeRoleError');
  errorEl.textContent = '';

  if (!username) {
    errorEl.textContent = 'Введите логин пользователя';
    return;
  }

  fetch('/cabinet/change-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, role })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        document.getElementById('changeRoleUsername').value = '';
      } else {
        errorEl.textContent = data.message;
      }
    })
    .catch(err => {
      console.error(err);
      errorEl.textContent = 'Ошибка сервера';
    });
}

function deleteUser() {
  const username = document.getElementById('deleteUsername').value.trim();
  const errorEl = document.getElementById('deleteUserError');
  errorEl.textContent = '';

  if (!username) {
    errorEl.textContent = 'Введите логин пользователя';
    return;
  }

  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
    return;
  }

  fetch('/cabinet/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        document.getElementById('deleteUsername').value = '';
      } else {
        errorEl.textContent = data.message;
      }
    })
    .catch(err => {
      console.error(err);
      errorEl.textContent = 'Ошибка сервера';
    });
}

function addUserBalance() {
  const username = document.getElementById('changeBalanceUsername').value.trim();
  const amount = document.getElementById('balanceInput').value.trim();
  const errorEl = document.getElementById('changeBalanceError');
  errorEl.textContent = '';

  if (!username) {
    errorEl.textContent = 'Введите логин пользователя';
    return;
  }

  if (!amount || isNaN(amount) || parseFloat(amount) < 0) {
    errorEl.textContent = 'Введите корректное значение суммы';
    return;
  }

  fetch('/cabinet/add-user-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, amount: parseFloat(amount) })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        document.getElementById('changeBalanceUsername').value = '';
        document.getElementById('balanceInput').value = '';
        location.reload();
      } else {
        errorEl.textContent = data.message;
      }
    })
    .catch(err => {
      console.error(err);
      errorEl.textContent = 'Ошибка сервера';
    });
}

function subtractUserBalance() {
  const username = document.getElementById('changeBalanceUsername').value.trim();
  const amount = document.getElementById('balanceInput').value.trim();
  const errorEl = document.getElementById('changeBalanceError');
  errorEl.textContent = '';

  if (!username) {
    errorEl.textContent = 'Введите логин пользователя';
    return;
  }

  if (!amount || isNaN(amount) || parseFloat(amount) < 0) {
    errorEl.textContent = 'Введите корректное значение суммы';
    return;
  }

  fetch('/cabinet/subtract-user-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, amount: parseFloat(amount) })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        document.getElementById('changeBalanceUsername').value = '';
        document.getElementById('balanceInput').value = '';
        location.reload();
      } else {
        errorEl.textContent = data.message;
      }
    })
    .catch(err => {
      console.error(err);
      errorEl.textContent = 'Ошибка сервера';
    });
}

function setUserBalance() {
  const username = document.getElementById('changeBalanceUsername').value.trim();
  const balance = document.getElementById('balanceInput').value.trim();
  const errorEl = document.getElementById('changeBalanceError');
  errorEl.textContent = '';

  if (!username) {
    errorEl.textContent = 'Введите логин пользователя';
    return;
  }

  if (!balance || isNaN(balance)) {
    errorEl.textContent = 'Введите корректное значение баланса';
    return;
  }

  fetch('/cabinet/change-user-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, balance: parseFloat(balance) })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        document.getElementById('changeBalanceUsername').value = '';
        document.getElementById('balanceInput').value = '';
        location.reload();
      } else {
        errorEl.textContent = data.message;
      }
    })
    .catch(err => {
      console.error(err);
      errorEl.textContent = 'Ошибка сервера';
    });
}

function showManageAuditLogs() {
  // Скрываем все остальные разделы
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'none';
  document.getElementById('manageAdTypesMode').style.display = 'none';
  document.getElementById('manageAdSpacesMode').style.display = 'none';
  document.getElementById('manageTemplatesMode').style.display = 'none';
  document.getElementById('checkTemplatesMode').style.display = 'none';
  document.getElementById('manageAuditLogsMode').style.display = 'block';
  document.getElementById('pageTitle').textContent = 'История изменений';
  
  // Обновляем активную ссылку в навигации
  updateNavLink('audit-logs');
  
  // Загружаем логи
  loadAuditLogs();
}

let currentAuditPage = 1;
let auditLogs = [];
let filteredLogs = [];

function loadAuditLogs() {
  fetch(`/cabinet/get-audit-logs?page=${currentAuditPage}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        auditLogs = data.logs;
        filteredLogs = data.logs;
        renderAuditLogs();
        updatePaginationInfo(data.currentPage, data.pages);
      } else {
        console.error('Ошибка загрузки:', data.message);
        document.getElementById('auditLogsList').innerHTML = '<p style="color: #999;">Ошибка загрузки истории</p>';
      }
    })
    .catch(err => {
      console.error('Ошибка:', err);
      document.getElementById('auditLogsList').innerHTML = '<p style="color: #999;">Ошибка загрузки истории</p>';
    });
}

function renderAuditLogs() {
  const container = document.getElementById('auditLogsList');
  
  if (!filteredLogs || filteredLogs.length === 0) {
    container.innerHTML = '<p style="color: #999; text-align: center;">История не найдена</p>';
    return;
  }

  container.innerHTML = filteredLogs.map(log => {
    const operationColors = {
      'INSERT': '#4CAF50',
      'UPDATE': '#2196F3',
      'DELETE': '#f44336'
    };

    const operationEmoji = {
      'INSERT': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️'
    };

    const oldValues = log.old_values ? JSON.stringify(log.old_values, null, 2) : 'N/A';
    const newValues = log.new_values ? JSON.stringify(log.new_values, null, 2) : 'N/A';

    return `
      <div class="audit-log-item">
        <div class="audit-log-header" onclick="toggleAuditDetails(this)">
          <div class="audit-log-main">
            <span class="audit-operation" style="background-color: ${operationColors[log.operation]}">
              ${operationEmoji[log.operation]} ${log.operation}
            </span>
            <span class="audit-table"><strong>Таблица:</strong> ${log.table_name}</span>
            <span class="audit-id"><strong>ID:</strong> ${log.record_id || 'N/A'}</span>
          </div>
          <div class="audit-timestamp">
            <small>${new Date(log.timestamp).toLocaleString('ru-RU')}</small>
          </div>
        </div>
        <div class="audit-details" style="display: none;">
          ${log.old_values ? `
            <div class="audit-section">
              <h4>Старые значения:</h4>
              <pre><code>${escapeHtml(oldValues)}</code></pre>
            </div>
          ` : ''}
          ${log.new_values ? `
            <div class="audit-section">
              <h4>Новые значения:</h4>
              <pre><code>${escapeHtml(newValues)}</code></pre>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function toggleAuditDetails(element) {
  const details = element.nextElementSibling;
  if (details) {
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
  }
}

function filterAuditLogs() {
  const tableFilter = document.getElementById('auditTableFilter').value;
  const operationFilter = document.getElementById('auditOperationFilter').value;

  filteredLogs = auditLogs.filter(log => {
    const matchTable = !tableFilter || log.table_name === tableFilter;
    const matchOperation = !operationFilter || log.operation === operationFilter;
    return matchTable && matchOperation;
  });

  currentAuditPage = 1;
  renderAuditLogs();
}

function updatePaginationInfo(currentPage, totalPages) {
  document.getElementById('pageInfo').textContent = `Страница ${currentPage} из ${totalPages}`;
  document.getElementById('prevPageBtn').disabled = currentPage === 1;
  document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
}

function prevAuditPage() {
  if (currentAuditPage > 1) {
    currentAuditPage--;
    loadAuditLogs();
  }
}

function nextAuditPage() {
  currentAuditPage++;
  loadAuditLogs();
}

function downloadAuditLogs() {
  fetch('/cabinet/download-audit-logs')
    .then(response => {
      if (!response.ok) throw new Error('Ошибка при скачивании');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'audit_logs.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка при скачивании истории');
    });
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}