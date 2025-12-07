function toggleEditMode() {
  const viewMode = document.getElementById('viewMode');
  const editMode = document.getElementById('editMode');
  
  if (viewMode.style.display === 'none') {
    viewMode.style.display = 'block';
    editMode.style.display = 'none';
  } else {
    viewMode.style.display = 'none';
    editMode.style.display = 'block';
  }
}

function saveChanges(event) {
  event.preventDefault();
  const emailInput = document.querySelector('input[name="email"]');
  const emailError = document.getElementById('email-error');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value)) {
    emailError.textContent = 'Некорректный формат email';
    return;
  }
  emailError.textContent = '';

  const formData = {
    first_name: document.querySelector('input[name="first_name"]').value,
    last_name: document.querySelector('input[name="last_name"]').value,
    father_name: document.querySelector('input[name="father_name"]').value,
    email: emailInput.value,
    phone: document.querySelector('input[name="phone"]').value
  };

  fetch('/cabinet/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById('view-first_name').textContent = formData.first_name;
      document.getElementById('view-last_name').textContent = formData.last_name;
      document.getElementById('view-father_name').textContent = formData.father_name;
      document.getElementById('view-email').textContent = formData.email;
      document.getElementById('view-phone').textContent = formData.phone;
      toggleEditMode();
      alert('Данные успешно обновлены');
    } else {
      alert('Ошибка: ' + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert('Ошибка при сохранении');
  });
}

function showAccount() {
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('manageUsersMode').style.display = 'none';
  document.getElementById('manageAdTypesMode').style.display = 'none';
  document.getElementById('manageAdSpacesMode').style.display = 'none';
  document.getElementById('manageTemplatesMode').style.display = 'none';
  document.getElementById('checkTemplatesMode').style.display = 'none';
  document.getElementById('manageAuditLogsMode').style.display = 'none';
  document.getElementById('manageOrderAdMode').style.display = 'none';
  
  document.getElementById('pageTitle').textContent = 'Личный кабинет';
  updateNavLink('account');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  initializeAdTypes();
  
  // Проверяем, пришли ли мы из каталога
  const selectedAdType = sessionStorage.getItem('selectedAdType');
  
  if (selectedAdType) {
    // Если из каталога - показываем создание шаблона
    sessionStorage.removeItem('selectedAdType');
    showCreateTemplate();
  } else {
    // Если просто открыли кабинет - показываем аккаунт
    showAccount();
  }
});

function fillTemplateForm(adType) {
  if (!window.allAdTypes || window.allAdTypes.length === 0) {
    console.error('Ad types not loaded yet');
    return;
  }
  
  const selectedType = window.allAdTypes.find(t => t.id === adType.id);
  if (selectedType) {
    document.getElementById('templateName').value = adType.name || '';
    document.getElementById('templateLocation').value = selectedType.location ? '1' : '0';
    document.getElementById('templateLocation').disabled = false;
    
    updateTemplateLocationAndTypes();
    
    setTimeout(() => {
      document.getElementById('templateAdType').value = adType.id;
      updateTemplatePreview();
    }, 100);
  }
}
