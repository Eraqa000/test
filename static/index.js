document.addEventListener('DOMContentLoaded', () => {
    // Карусель изображений
    document.querySelectorAll('.card-image').forEach((cardImage) => {
        const containers = cardImage.querySelectorAll('.image-container');
        const leftArrow = cardImage.querySelector('.arrow.left');
        const rightArrow = cardImage.querySelector('.arrow.right');
        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('dots');
        cardImage.appendChild(dotsContainer);

        let currentIndex = 0;

        const updateCartCount = () => {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;

            // Если корзина пустая, сбросить значение
            if (totalItems === 0) {
                cartCountElement.textContent = '0';
            }

            // Добавляем анимацию при изменении
            cartCountElement.classList.add('animate');
            setTimeout(() => cartCountElement.classList.remove('animate'), 500);
        };


        // Создание точек
        containers.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === currentIndex) dot.classList.add('active');
            dotsContainer.appendChild(dot);

            dot.addEventListener('click', () => {
                currentIndex = index;
                updateImagesAndDots();
            });
        });

        const dots = dotsContainer.querySelectorAll('.dot');

        // Обновление изображений и точек
        const updateImagesAndDots = () => {
            containers.forEach((container, index) => {
                container.classList.remove('center', 'left', 'right');
                if (index === currentIndex) {
                    container.classList.add('center');
                } else if (index === (currentIndex - 1 + containers.length) % containers.length) {
                    container.classList.add('left');
                } else {
                    container.classList.add('right');
                }
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        };

        // Логика переключения изображений
        const rotateImages = (direction) => {
            if (direction === 'right') {
                currentIndex = (currentIndex + 1) % containers.length;
            } else if (direction === 'left') {
                currentIndex = (currentIndex - 1 + containers.length) % containers.length;
            }
            updateImagesAndDots();
        };

        if (leftArrow && rightArrow) {
            leftArrow.addEventListener('click', () => rotateImages('left'));
            rightArrow.addEventListener('click', () => rotateImages('right'));
        }

        // Автопрокрутка
        let autoRotateInterval;

        const startAutoRotate = () => {
            autoRotateInterval = setInterval(() => rotateImages('right'), 5000);
        };

        const stopAutoRotate = () => {
            clearInterval(autoRotateInterval);
        };

        leftArrow.addEventListener('click', () => {
            rotateImages('left');
            stopAutoRotate();
            startAutoRotate();
        });

        rightArrow.addEventListener('click', () => {
            rotateImages('right');
            stopAutoRotate();
            startAutoRotate();
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                stopAutoRotate();
                startAutoRotate();
            });
        });

        // Инициализация автопрокрутки
        startAutoRotate();
        updateImagesAndDots();
    });

    // Мобильное меню
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (menuToggle && navbarMenu) {
        menuToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
        });
    }

    updateCartCount();
});
