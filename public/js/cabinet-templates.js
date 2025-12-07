// Инициализируем типы рекламы при загрузке страницы
function initializeAdTypes() {
  fetch('/cabinet/get-all-ad-types')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.allAdTypes = data.adTypes;
        console.log('Ad types loaded:', window.allAdTypes.length);
      }
    })
    .catch(err => console.error('Error loading ad types:', err));
}

function showCreateTemplate() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'none';
  document.getElementById('manageAdTypesMode').style.display = 'none';
  document.getElementById('manageAdSpacesMode').style.display = 'none';
  document.getElementById('manageTemplatesMode').style.display = 'block';
  document.getElementById('checkTemplatesMode').style.display = 'none';
  document.getElementById('manageAuditLogsMode').style.display = 'none';
  document.getElementById('pageTitle').textContent = 'Создать шаблон';
  updateNavLink('create-template');
  loadTemplateAdTypes();
  loadTemplates();
}

function showCheckTemplates() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'none';
  document.getElementById('manageAdTypesMode').style.display = 'none';
  document.getElementById('manageAdSpacesMode').style.display = 'none';
  document.getElementById('manageTemplatesMode').style.display = 'none';
  document.getElementById('checkTemplatesMode').style.display = 'block';
  document.getElementById('manageAuditLogsMode').style.display = 'none';
  document.getElementById('pageTitle').textContent = 'Проверка рекламы';
  updateNavLink('check-templates');
  loadCheckTemplates();
}

function switchTemplateTab(tabName) {
  document.getElementById('template-create-tab').classList.remove('active');
  document.getElementById('template-pending-tab').classList.remove('active');
  document.getElementById('template-approved-tab').classList.remove('active');
  document.getElementById('template-rejected-tab').classList.remove('active');

  const buttons = document.querySelectorAll('#manageTemplatesMode .tab-button');
  buttons.forEach(btn => btn.classList.remove('active'));

  if (tabName === 'create') {
    document.getElementById('template-create-tab').classList.add('active');
    buttons[0].classList.add('active');
  } else if (tabName === 'pending') {
    document.getElementById('template-pending-tab').classList.add('active');
    buttons[1].classList.add('active');
    loadTemplatesByStatus('pending');
  } else if (tabName === 'approved') {
    document.getElementById('template-approved-tab').classList.add('active');
    buttons[2].classList.add('active');
    loadTemplatesByStatus('approved');
  } else if (tabName === 'rejected') {
    document.getElementById('template-rejected-tab').classList.add('active');
    buttons[3].classList.add('active');
    loadTemplatesByStatus('rejected');
  }
}

function switchCheckTab(tabName) {
  document.getElementById('check-pending-tab').classList.remove('active');
  document.getElementById('check-approved-tab').classList.remove('active');
  document.getElementById('check-rejected-tab').classList.remove('active');

  const buttons = document.querySelectorAll('#checkTemplatesMode .tab-button');
  buttons.forEach(btn => btn.classList.remove('active'));

  if (tabName === 'pending') {
    document.getElementById('check-pending-tab').classList.add('active');
    buttons[0].classList.add('active');
    loadCheckTemplatesByStatus('pending');
  } else if (tabName === 'approved') {
    document.getElementById('check-approved-tab').classList.add('active');
    buttons[1].classList.add('active');
    loadCheckTemplatesByStatus('approved');
  } else if (tabName === 'rejected') {
    document.getElementById('check-rejected-tab').classList.add('active');
    buttons[2].classList.add('active');
    loadCheckTemplatesByStatus('rejected');
  }
}

function loadTemplateAdTypes() {
  if (window.allAdTypes && window.allAdTypes.length > 0) {
    updateTemplateLocationAndTypes();
    return;
  }
  
  fetch('/cabinet/get-all-ad-types')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.allAdTypes = data.adTypes;
        updateTemplateLocationAndTypes();
      }
    })
    .catch(err => console.error('Error loading ad types:', err));
}

function updateTemplateFormState() {
  const nameInput = document.getElementById('templateName');
  const locationSelect = document.getElementById('templateLocation');

  if (nameInput.value.trim()) {
    locationSelect.disabled = false;
  } else {
    locationSelect.disabled = true;
    locationSelect.value = '';
    updateTemplateLocationAndTypes();
  }
}

function updateTemplateLocationAndTypes() {
  const location = document.getElementById('templateLocation').value;
  const typeSelect = document.getElementById('templateAdType');
  const imageInput = document.getElementById('templateImageFile');

  typeSelect.innerHTML = '<option value="">Выберите тип рекламы</option>';
  imageInput.value = '';
  updateTemplatePreview();

  if (!location) {
    typeSelect.disabled = true;
    imageInput.disabled = true;
    return;
  }

  typeSelect.disabled = false;
  const locationValue = parseInt(location);

  if (window.allAdTypes) {
    window.allAdTypes.forEach(type => {
      if ((type.location ? 1 : 0) === locationValue) {
        typeSelect.innerHTML += `<option value="${type.id}" data-width="${type.width}" data-height="${type.height}">${type.name}</option>`;
      }
    });
  }
}

function updateTemplatePreview() {
  const typeId = document.getElementById('templateAdType').value;
  const imageFile = document.getElementById('templateImageFile').files[0];
  const imageInput = document.getElementById('templateImageFile');
  const typeSelect = document.getElementById('templateAdType');

  if (typeId) {
    imageInput.disabled = false;
  } else {
    imageInput.disabled = true;
    imageInput.value = '';
  }

  const previewDiv = document.getElementById('templatePreview');

  if (!typeId) {
    previewDiv.innerHTML = '<div class="template-placeholder">Здесь будет предпросмотр вашей рекламы</div>';
    return;
  }

  const selectedOption = typeSelect.options[typeSelect.selectedIndex];
  const width = parseInt(selectedOption.dataset.width) || 100;
  const height = parseInt(selectedOption.dataset.height) || 50;
  const aspectRatio = width / height;

  const containerSize = 700;
  const maxSize = containerSize * (2/3);

  let displayWidth, displayHeight;

  if (width > height) {
    displayWidth = maxSize;
    displayHeight = maxSize / aspectRatio;
  } else {
    displayHeight = maxSize;
    displayWidth = maxSize * aspectRatio;
  }

  if (!imageFile) {
    const sizeText = width + '×' + height;
    previewDiv.innerHTML = `
      <svg width="${displayWidth}" height="${displayHeight}" viewBox="0 0 ${width} ${height}" style="background:#f5f5f5;border-radius:6px;">
        <rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="#fdecea" stroke="#c62828" stroke-width="2"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#c62828" font-family="Segoe UI, Arial" font-weight="bold">${sizeText}</text>
        <text x="80%" y="80%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#c62828" font-family="Segoe UI, Arial" font-weight="bold">мм</text>
      </svg>
    `;
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewDiv.innerHTML = `
        <div class="template-preview-image-container" style="width: ${displayWidth}px; height: ${displayHeight}px; margin: 0 auto;">
          <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `;
    };
    reader.readAsDataURL(imageFile);
  }
}

function createTemplate() {
  const name = document.getElementById('templateName').value.trim();
  const location = document.getElementById('templateLocation').value;
  const typeId = parseInt(document.getElementById('templateAdType').value);
  const imageFile = document.getElementById('templateImageFile').files[0];
  const errorEl = document.getElementById('templateError');
  errorEl.textContent = '';

  if (!name) {
    errorEl.textContent = 'Введите название шаблона';
    return;
  }

  if (!location) {
    errorEl.textContent = 'Выберите локацию';
    return;
  }

  if (!typeId) {
    errorEl.textContent = 'Выберите тип рекламы';
    return;
  }

  if (!imageFile) {
    errorEl.textContent = 'Выберите картинку';
    return;
  }

  const formData = new FormData();
  formData.append('ad_title', name);
  formData.append('type_id', typeId);
  formData.append('image', imageFile);

  fetch('/cabinet/create-template', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Шаблон успешно создан');
      document.getElementById('templateName').value = '';
      document.getElementById('templateLocation').value = '';
      document.getElementById('templateAdType').value = '';
      document.getElementById('templateImageFile').value = '';
      document.getElementById('templatePreview').innerHTML = '<div class="template-placeholder">Здесь будет предпросмотр вашей рекламы</div>';
      updateTemplateFormState();
      loadTemplates();
    } else {
      errorEl.textContent = data.message;
    }
  })
  .catch(err => {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера';
  });
}

function loadTemplates() {
  loadTemplatesByStatus('pending');
  loadTemplatesByStatus('approved');
  loadTemplatesByStatus('rejected');
}

function loadTemplatesByStatus(status) {
  fetch(`/cabinet/get-templates?status=${status}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const containerId = `template${status.charAt(0).toUpperCase() + status.slice(1)}List`;
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (data.templates.length === 0) {
          container.innerHTML = `<p style="color: #999;">Шаблонов со статусом "${getStatusText(status)}" не найдено</p>`;
          return;
        }

        data.templates.forEach(template => {
          renderTemplateCard(template, container, status, false);
        });
      }
    })
    .catch(err => console.error('Error loading templates:', err));
}

function loadCheckTemplates() {
  loadCheckTemplatesByStatus('pending');
  loadCheckTemplatesByStatus('approved');
  loadCheckTemplatesByStatus('rejected');
}

function loadCheckTemplatesByStatus(status) {
  fetch(`/cabinet/get-check-templates?status=${status}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        let containerId;
        if (status === 'pending') {
          containerId = 'checkPendingList';
        } else if (status === 'approved') {
          containerId = 'checkApprovedList';
        } else {
          containerId = 'checkRejectedList';
        }
        
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (data.templates.length === 0) {
          container.innerHTML = `<p style="color: #999;">Шаблонов со статусом "${getStatusText(status)}" не найдено</p>`;
          return;
        }

        data.templates.forEach(template => {
          renderTemplateCard(template, container, status, true);
        });
      }
    })
    .catch(err => console.error('Error loading check templates:', err));
}

function renderTemplateCard(template, container, status, isModeration) {
  const item = document.createElement('div');
  item.className = 'template-item';

  let displayWidth = 350;
  let displayHeight = 350;
  let adTypeName = 'Неизвестный тип';
  let adTypeLocation = 'Неизвестная локация';
  let adTypeSize = 'Неизвестный размер';

  if (window.allAdTypes) {
    const adType = window.allAdTypes.find(t => t.id === template.type_id);
    if (adType) {
      adTypeName = adType.name;
      adTypeLocation = adType.location ? 'Поезд' : 'Станция';
      adTypeSize = `${adType.width}x${adType.height} мм`;

      const width = parseInt(adType.width) || 100;
      const height = parseInt(adType.height) || 50;
      const aspectRatio = width / height;

      // Максимальный размер контейнера
      const maxContainerWidth = 400;
      const maxContainerHeight = 300;
      
      // Масштабируем с сохранением пропорций
      if (aspectRatio > maxContainerWidth / maxContainerHeight) {
        // Ширина больше
        displayWidth = maxContainerWidth;
        displayHeight = maxContainerWidth / aspectRatio;
      } else {
        // Высота больше
        displayHeight = maxContainerHeight;
        displayWidth = maxContainerHeight * aspectRatio;
      }
    }
  }

  let imageHtml = '';
  if (template.content_url) {
    imageHtml = `
      <div class="template-preview-image-container" style="width: ${displayWidth}px; height: ${displayHeight}px; margin: 0 auto;">
        <img src="${template.content_url}" alt="Template" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `;
  } else {
    imageHtml = '<p style="color: #999;">Изображение не загружено</p>';
  }

  let actionsHtml = '';
  if (isModeration) {
    let userInfo = template.User ? `${template.User.first_name} ${template.User.last_name} (@${template.User.username})` : 'Неизвестный пользователь';

    if (status === 'pending') {
      actionsHtml = `
        <div class="template-item-header">
          <div>
            <h4>${template.ad_title}</h4>
            <p style="font-size: 0.85rem; color: #666; margin: 5px 0 0 0;">Пользователь: ${userInfo}</p>
          </div>
          <span class="template-status ${status}">${getStatusText(status)}</span>
        </div>
        <div class="template-item-content">${imageHtml}</div>
        <div class="template-item-info">
          <p><strong>Тип рекламы:</strong> ${adTypeName}</p>
          <p><strong>Локация:</strong> ${adTypeLocation}</p>
          <p><strong>Размер:</strong> ${adTypeSize}</p>
          <p><strong>Дата загрузки:</strong> ${new Date(template.upload_date).toLocaleString('ru-RU')}</p>
        </div>
        <div class="template-item-actions">
          <button class="confirm-button" onclick="approveTemplate(${template.id})">Одобрить</button>
          <button class="delete-button" onclick="openRejectionModal(${template.id})">Отклонить</button>
        </div>
      `;
    } else if (status === 'approved') {
      actionsHtml = `
        <div class="template-item-header">
          <div>
            <h4>${template.ad_title}</h4>
            <p style="font-size: 0.85rem; color: #666; margin: 5px 0 0 0;">Пользователь: ${userInfo}</p>
          </div>
          <span class="template-status ${status}">${getStatusText(status)}</span>
        </div>
        <div class="template-item-content">${imageHtml}</div>
        <div class="template-item-info">
          <p><strong>Тип рекламы:</strong> ${adTypeName}</p>
          <p><strong>Локация:</strong> ${adTypeLocation}</p>
          <p><strong>Размер:</strong> ${adTypeSize}</p>
          <p><strong>Дата загрузки:</strong> ${new Date(template.upload_date).toLocaleString('ru-RU')}</p>
        </div>
        <div class="template-item-actions">
          <p style="color: #666; font-size: 0.9rem; margin: 0;">Одобрено вами</p>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="template-item-header">
          <div>
            <h4>${template.ad_title}</h4>
            <p style="font-size: 0.85rem; color: #666; margin: 5px 0 0 0;">Пользователь: ${userInfo}</p>
          </div>
          <span class="template-status ${status}">${getStatusText(status)}</span>
        </div>
        <div class="template-item-content">${imageHtml}</div>
        <div class="template-item-info">
          <p><strong>Тип рекламы:</strong> ${adTypeName}</p>
          <p><strong>Локация:</strong> ${adTypeLocation}</p>
          <p><strong>Размер:</strong> ${adTypeSize}</p>
          <p><strong>Дата загрузки:</strong> ${new Date(template.upload_date).toLocaleString('ru-RU')}</p>
        </div>
        <div class="template-item-actions">
          <p style="color: #999; font-size: 0.85rem; margin: 0;"><strong>Причина:</strong> ${template.rejection_reason || 'Не указана'}</p>
        </div>
      `;
    }
  } else {
    actionsHtml = `
      <div class="template-item-header">
        <h4>${template.ad_title}</h4>
        <span class="template-status ${status}">${getStatusText(status)}</span>
      </div>
      <div class="template-item-content">${imageHtml}</div>
      <div class="template-item-info">
        <p><strong>Тип рекламы:</strong> ${adTypeName}</p>
        <p><strong>Локация:</strong> ${adTypeLocation}</p>
        <p><strong>Размер:</strong> ${adTypeSize}</p>
        <p><strong>Дата загрузки:</strong> ${new Date(template.upload_date).toLocaleString('ru-RU')}</p>
        ${template.approval_date ? `<p><strong>Дата проверки:</strong> ${new Date(template.approval_date).toLocaleString('ru-RU')}</p>` : ''}
        ${template.rejection_reason ? `<p><strong>Причина отклонения:</strong> ${template.rejection_reason}</p>` : ''}
      </div>
      <div class="template-item-actions">
        <button class="delete-button" onclick="deleteTemplate(${template.id})">Удалить</button>
      </div>
    `;
  }
  
  item.innerHTML = actionsHtml;
  container.appendChild(item);
}

function deleteTemplate(templateId) {
  if (!confirm('Вы уверены, что хотите удалить этот шаблон?')) {
    return;
  }

  fetch('/cabinet/delete-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template_id: templateId })
  })
  .then(res => res.json())
  .then (data => {
    if (data.success) {
      alert('Шаблон успешно удален');
      loadTemplates();
    } else {
      alert('Ошибка: ' + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert('Ошибка при удалении шаблона');
  });
}

function openRejectionModal(templateId) {
  window.currentRejectTemplateId = templateId;
  document.getElementById('rejectionReason').value = '';
  document.getElementById('rejectionError').textContent = '';
  document.getElementById('rejectionModal').style.display = 'flex';
}

function closeRejectionModal() {
  document.getElementById('rejectionModal').style.display = 'none';
  window.currentRejectTemplateId = null;
}

function submitRejection() {
  const reason = document.getElementById('rejectionReason').value.trim();
  const errorEl = document.getElementById('rejectionError');
  errorEl.textContent = '';

  if (!reason) {
    errorEl.textContent = 'Введите причину отклонения';
    return;
  }

  fetch('/cabinet/reject-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      template_id: window.currentRejectTemplateId,
      rejection_reason: reason
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Шаблон отклонен');
      closeRejectionModal();
      loadCheckTemplates();
    } else {
      errorEl.textContent = data.message;
    }
  })
  .catch(err => {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера';
  });
}

function approveTemplate(templateId) {
  if (!confirm('Вы уверены, что хотите одобрить этот шаблон?')) {
    return;
  }

  fetch('/cabinet/approve-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template_id: templateId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Шаблон одобрен');
      loadCheckTemplates();
    } else {
      alert('Ошибка: ' + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert('Ошибка при одобрении шаблона');
  });
}

function getStatusText(status) {
  const statuses = {
    'pending': 'Ожидает проверки',
    'approved': 'Одобрено',
    'rejected': 'Отклонено'
  };
  return statuses[status] || status;
}

function updateNavLink(page) {
  // Убираем активный класс со всех ссылок в навигации
  const allLinks = document.querySelectorAll('.cabinet-nav .nav-link');
  allLinks.forEach(link => link.classList.remove('active'));
  
  // Активируем нужную ссылку в зависимости от страницы
  if (page === 'account') {
    // Первая ссылка - Аккаунт
    const links = document.querySelectorAll('.cabinet-nav .nav-menu .nav-item .nav-link');
    if (links[0]) links[0].classList.add('active');
  } else if (page === 'create-template') {
    // Вторая ссылка - Создать шаблон
    const links = document.querySelectorAll('.cabinet-nav .nav-menu .nav-item .nav-link');
    if (links[1]) links[1].classList.add('active');
  } else if (page === 'manage-users') {
    const manageUsersLink = Array.from(allLinks).find(link => 
      link.textContent.trim().includes('Управление пользователями')
    );
    if (manageUsersLink) manageUsersLink.classList.add('active');
  } else if (page === 'manage-ad-types') {
    const manageAdTypesLink = Array.from(allLinks).find(link => 
      link.textContent.trim().includes('Управление типами рекламы')
    );
    if (manageAdTypesLink) manageAdTypesLink.classList.add('active');
  } else if (page === 'manage-ad-spaces') {
    const manageAdSpacesLink = Array.from(allLinks).find(link => 
      link.textContent.trim().includes('Управление рекламными местами')
    );
    if (manageAdSpacesLink) manageAdSpacesLink.classList.add('active');
  } else if (page === 'check-templates') {
    const checkLink = Array.from(allLinks).find(link => 
      link.textContent.trim().includes('Проверка рекламы')
    );
    if (checkLink) checkLink.classList.add('active');
  } else if (page === 'audit-logs') {
    const auditLink = Array.from(allLinks).find(link => 
      link.textContent.trim().includes('История изменений')
    );
    if (auditLink) auditLink.classList.add('active');
  }
}

function renderTemplates(templates, status) {
  const listId = `template${status.charAt(0).toUpperCase() + status.slice(1)}List`;
  const listElement = document.getElementById(listId);
  
  if (!listElement) return;
  
  if (templates.length === 0) {
    listElement.innerHTML = `<p style="color: #999;">Шаблонов со статусом "${getStatusText(status)}" не найдено</p>`;
    return;
  }

  listElement.innerHTML = '';
  templates.forEach(template => {
    renderTemplateCard(template, listElement, status, false);
  });
}

// Обработчик изменения файла изображения
document.addEventListener('DOMContentLoaded', function() {
  const templateImageFile = document.getElementById('templateImageFile');
  
  if (templateImageFile) {
    templateImageFile.addEventListener('change', function() {
      const file = this.files[0];
      const errorEl = document.getElementById('templateError');
      errorEl.textContent = '';

      if (file) {
        const maxSizeInMB = 2;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
          errorEl.textContent = `Размер файла не должен превышать ${maxSizeInMB} МБ`;
          this.value = '';
          updateTemplatePreview();
          return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          errorEl.textContent = 'Допустимые форматы изображений: JPEG, PNG, GIF';
          this.value = '';
          updateTemplatePreview();
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            // Получаем размеры типа рекламы
            const typeSelect = document.getElementById('templateAdType');
            const selectedOption = typeSelect.options[typeSelect.selectedIndex];
            const adTypeWidth = parseInt(selectedOption.dataset.width) || 100;
            const adTypeHeight = parseInt(selectedOption.dataset.height) || 50;
            const adTypeAspectRatio = adTypeWidth / adTypeHeight;

            // Контейнер для предпросмотра
            const containerSize = 700;
            const maxSize = containerSize * (2/3);
            
            let displayWidth, displayHeight;

            // Масштабируем согласно пропорциям типа рекламы
            if (adTypeAspectRatio > 1) {
              // Ширина больше высоты
              displayWidth = maxSize;
              displayHeight = maxSize / adTypeAspectRatio;
            } else {
              // Высота больше ширины
              displayHeight = maxSize;
              displayWidth = maxSize * adTypeAspectRatio;
            }

            const previewDiv = document.getElementById('templatePreview');
            previewDiv.innerHTML = `
              <div class="template-preview-image-container" style="width: ${displayWidth}px; height: ${displayHeight}px; margin: 0 auto; overflow: hidden; border-radius: 8px; background: #f5f5f5;">
                <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; display: block;">
              </div>
            `;
          };
        };
        reader.readAsDataURL(file);
      } else {
        updateTemplatePreview();
      }
    });
  }
});
