let currentPendingTemplateId = null;

function showCheckTemplates() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'none';
  document.getElementById('manageAdTypesMode').style.display = 'none';
  document.getElementById('manageAdSpacesMode').style.display = 'none';
  document.getElementById('manageTemplatesMode').style.display = 'none';
  document.getElementById('checkTemplatesMode').style.display = 'block';
  
  // Активируем кнопку в меню
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const checkButton = Array.from(document.querySelectorAll('.nav-link')).find(link => 
    link.textContent.includes('Проверка рекламы')
  );
  if (checkButton) {
    checkButton.classList.add('active');
  }
  
  document.getElementById('pageTitle').textContent = 'Проверка рекламы';
  
  // Загружаем шаблоны при первом открытии
  loadCheckTemplates('pending');
}

function switchCheckTab(status) {
  // Скрыть все вкладки
  document.getElementById('check-pending-tab').classList.remove('active');
  document.getElementById('check-approved-tab').classList.remove('active');
  document.getElementById('check-rejected-tab').classList.remove('active');
  
  // Убрать активный класс с кнопок
  document.querySelectorAll('#checkTemplatesMode .tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Активировать нужную вкладку и кнопку
  document.getElementById(`check-${status}-tab`).classList.add('active');
  event.target.classList.add('active');
  
  // Загрузить шаблоны
  loadCheckTemplates(status);
}

function loadCheckTemplates(status) {
  fetch(`/cabinet/get-check-templates?status=${status}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        renderCheckTemplates(data.templates, status);
      } else {
        console.error('Ошибка загрузки:', data.message);
      }
    })
    .catch(err => {
      console.error('Ошибка запроса:', err);
    });
}

function renderCheckTemplates(templates, status) {
  const listId = `check${status.charAt(0).toUpperCase() + status.slice(1)}List`;
  const listElement = document.getElementById(listId);

  if (!listElement) return;

  if (templates.length === 0) {
    listElement.innerHTML = '<p style="color: #999; text-align: center;">Нет шаблонов для отображения</p>';
    return;
  }

  listElement.innerHTML = templates.map(template => {
    let adTypeName = 'Неизвестный тип';
    let adTypeLocation = 'Неизвестная локация';
    let adTypeSize = 'Неизвестный размер';
    let displayWidth = 350;
    let displayHeight = 350;

    if (template.AdType) {
      adTypeName = template.AdType.name;
      adTypeLocation = template.AdType.location ? 'Поезд' : 'Станция';
      adTypeSize = `${template.AdType.width}x${template.AdType.height}px`;

      const width = parseInt(template.AdType.width) || 100;
      const height = parseInt(template.AdType.height) || 50;
      const aspectRatio = width / height;

      const maxSize = 550;
      if (width > height) {
        displayWidth = maxSize;
        displayHeight = maxSize / aspectRatio;
      } else {
        displayHeight = maxSize;
        displayWidth = maxSize * aspectRatio;
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

    return `
      <div class="template-item">
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
          ${template.rejection_reason ? `<p><strong>Причина отклонения:</strong> ${template.rejection_reason}</p>` : ''}
        </div>
        <div class="template-item-actions">
          ${status === 'pending' ? `
            <button class="confirm-button" onclick="approveCheckTemplate(${template.id})">✓ Одобрить</button>
            <button class="confirm-button delete-button" onclick="openRejectionModalForCheck(${template.id})">✗ Отклонить</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function approveCheckTemplate(templateId) {
  if (confirm('Вы уверены, что хотите одобрить этот шаблон?')) {
    fetch('/cabinet/approve-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          loadCheckTemplates('pending');
        } else {
          alert('Ошибка: ' + data.message);
        }
      })
      .catch(err => console.error('Ошибка:', err));
  }
}

function openRejectionModalForCheck(templateId) {
  currentPendingTemplateId = templateId;
  document.getElementById('rejectionReason').value = '';
  document.getElementById('rejectionError').textContent = '';
  document.getElementById('rejectionModal').style.display = 'flex';
}

function closeRejectionModal() {
  document.getElementById('rejectionModal').style.display = 'none';
  currentPendingTemplateId = null;
}

function submitRejection() {
  const reason = document.getElementById('rejectionReason').value.trim();
  
  if (!reason) {
    document.getElementById('rejectionError').textContent = 'Укажите причину отклонения';
    return;
  }
  
  fetch('/cabinet/reject-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      template_id: currentPendingTemplateId,
      rejection_reason: reason
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        closeRejectionModal();
        loadCheckTemplates('pending');
      } else {
        document.getElementById('rejectionError').textContent = data.message;
      }
    })
    .catch(err => {
      console.error('Ошибка:', err);
      document.getElementById('rejectionError').textContent = 'Ошибка сервера';
    });
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Ожидает',
    'approved': 'Одобрено',
    'rejected': 'Отклонено'
  };
  return statusMap[status] || status;
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
