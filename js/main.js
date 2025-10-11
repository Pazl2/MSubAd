document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    let isAnimating = false;
    let startTime;
    const duration = 300; // Длительность анимации в миллисекундах

    function animateMenu(open) {
        if (isAnimating) return;
        isAnimating = true;

        const start = open ? -100 : 0;
        const end = open ? 0 : -100;
        navMenu.style.display = 'flex'; // Показываем меню перед анимацией

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = easeInOutQuad(progress); // Функция смягчения
            navMenu.style.transform = `translateX(${start + (end - start) * easedProgress}%)`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                isAnimating = false;
                startTime = null;
                if (!open) {
                    navMenu.style.display = 'none'; // Скрываем меню после анимации закрытия
                    navMenu.style.transform = 'translateX(-100%)'; // Сбрасываем позицию
                }
            }
        }

        // Функция смягчения для плавной анимации
        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        requestAnimationFrame(step);
    }

    // Обработка клика по кнопке меню
    menuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('active');
        if (!isOpen) {
            navMenu.classList.add('active');
            animateMenu(true);
        } else {
            navMenu.classList.remove('active');
            animateMenu(false);
        }
    });

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            navMenu.style.display = 'flex'; // Восстанавливаем кнопки в десктопной версии
            navMenu.style.transform = 'none'; // Сбрасываем трансформацию
            navMenu.classList.remove('active'); // Удаляем класс active
        } else if (!navMenu.classList.contains('active')) {
            navMenu.style.display = 'none'; // Скрываем меню в мобильной версии, если не активно
            navMenu.style.transform = 'translateX(-100%)'; // Сбрасываем позицию
        }
    });
});