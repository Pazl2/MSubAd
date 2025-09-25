document.addEventListener('DOMContentLoaded', function() {
  const burger = document.getElementById('burger');
  const body = document.body;
  
  // Создаем элементы для мобильной навигации
  const mobileNav = document.createElement('div');
  mobileNav.classList.add('mobile-nav');
  
  const mobileNavLinks = document.createElement('nav');
  mobileNavLinks.classList.add('mobile-nav-links');
  
  // Добавляем ссылки в мобильное меню
  const links = [
    { href: '/account', text: 'Личный кабинет' },
    { href: '/about', text: 'Билеты' },
    { href: '/tickets', text: 'О нас' }
  ];
  
  links.forEach(link => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    mobileNavLinks.appendChild(a);
  });
  
  mobileNav.appendChild(mobileNavLinks);
  document.body.appendChild(mobileNav);
  
  // Создаем оверлей
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  document.body.appendChild(overlay);
  
  // Обработчик клика по бургеру
  burger.addEventListener('click', function() {
    this.classList.toggle('active');
    mobileNav.classList.toggle('open');
    overlay.classList.toggle('active');
    
    // Блокировка прокрутки тела страницы при открытом меню
    if (mobileNav.classList.contains('open')) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  });
  
  // Закрытие меню при клике на оверлей
  overlay.addEventListener('click', function() {
    burger.classList.remove('active');
    mobileNav.classList.remove('open');
    this.classList.remove('active');
    body.style.overflow = '';
  });
  
  // Закрытие меню при клике на ссылку
  const navLinks = document.querySelectorAll('.mobile-nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      burger.classList.remove('active');
      mobileNav.classList.remove('open');
      overlay.classList.remove('active');
      body.style.overflow = '';
    });
  });
  
  // Закрытие меню при изменении размера окна (на десктопе)
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      burger.classList.remove('active');
      mobileNav.classList.remove('open');
      overlay.classList.remove('active');
      body.style.overflow = '';
    }
  });
});