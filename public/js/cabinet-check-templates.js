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
  
  listElement.innerHTML = templates.map((template, index) => {
    const maxWidth = 700;
    const maxHeight = 700;
    let width = template.AdType ? template.AdType.width : maxWidth;
    let height = template.AdType ? template.AdType.height : maxHeight;
    
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    const displayWidth = Math.round(width * scale);
    const displayHeight = Math.round(height * scale);
    
    return `
    <div class="template-item">
      <div class="template-item-header">
        <h4>${escapeHtml(template.ad_title)}</h4>
        <span class="template-status ${template.approval_status}">${getStatusText(template.approval_status)}</span>
      </div>
      
      <div class="template-item-content">
        <div class="template-preview-image-container" style="width: ${displayWidth}px; height: ${displayHeight}px;">
          <img src="${escapeHtml(template.content_url)}" alt="Preview" onerror="this.src='/images/placeholder.png'">
        </div>
      </div>
      
      <div class="template-item-info">
        <p><strong>Автор:</strong> ${escapeHtml(template.User ? template.User.first_name + ' ' + template.User.last_name + ' (' + template.User.username + ')' : 'Неизвестно')}</p>
        <p><strong>Тип:</strong> ${escapeHtml(template.AdType ? template.AdType.name : 'Неизвестно')}</p>
        <p><strong>Размер:</strong> ${template.AdType ? template.AdType.width + 'x' + template.AdType.height + 'px' : 'Неизвестно'}</p>
        <p><strong>Локация:</strong> ${template.AdType ? (template.AdType.location ? 'Поезд' : 'Станция') : 'Неизвестно'}</p>
        <p><strong>Дата загрузки:</strong> ${new Date(template.upload_date).toLocaleString('ru-RU')}</p>
        ${template.approval_date ? `<p><strong>Дата проверки:</strong> ${new Date(template.approval_date).toLocaleString('ru-RU')}</p>` : ''}
        ${template.rejection_reason ? `<p><strong>Причина отклонения:</strong> ${escapeHtml(template.rejection_reason)}</p>` : ''}
      </div>
      
      <div class="template-item-actions">
        ${status === 'pending' ? `
          <button class="confirm-button" onclick="approveCheckTemplate(${template.id})">✓ Одобрить</button>
          <button class="confirm-button delete-button" onclick="openRejectionModalForCheck(${template.id})">✗ Отклонить</button>
        ` : ''}
      </div>
    </div>
  `).join('');
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
