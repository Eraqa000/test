document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-container');
    const clearCartButton = document.getElementById('clear-cart');
    const otherProductsContainer = document.getElementById('other-products-container');
    const toggleProductsButton = document.getElementById('other-products-button');

    // Обновление счетчика корзины
    const updateCartCount = () => {
        fetch('/cart_count')
            .then(response => response.json())
            .then(data => {
                cartCountElement.textContent = data.count || '0';

                // Добавляем анимацию при изменении
                cartCountElement.classList.add('animate');
                setTimeout(() => cartCountElement.classList.remove('animate'), 500);
            })
            .catch(error => console.error('Error fetching cart count:', error));
    };

    // Отображение товаров в корзине
    const renderCart = () => {
        cartContainer.innerHTML = cart.length
            ? cart.map(item => `
                <p>${item.name} x${item.quantity} - ${item.price} ₽</p>
            `).join('')
            : '<p>Корзина пуста</p>';
    };

    // Обработчик для добавления товара в корзину
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('cart-button')) {
            const card = event.target.closest('.card');
            const product = {
                id: parseInt(card.dataset.id, 10),
                name: card.dataset.name,
                price: parseInt(card.dataset.price, 10),
            };
            addToCart(product);
            alert(`${product.name} добавлен в корзину!`);
            updateCartCount();  // Обновляем счетчик сразу после добавления товара
            renderCart();  // Перерисовываем корзину
        }
    });

    // Функция для добавления товара в корзину
    const addToCart = (product) => {
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Переключение отображения дополнительных товаров
    toggleProductsButton?.addEventListener('click', () => {
        const isHidden = otherProductsContainer.classList.contains('hidden');
        if (isHidden) {
            fetch('/get_all_products')
                .then(response => response.json())
                .then(data => {
                    const additionalProducts = data.products.filter(product => product.id >= 17 && product.id <= 25); // Получаем товары с ID, кроме 13-16
                    additionalProducts.forEach(product => {
                        const productElement = document.createElement('div');
                        productElement.classList.add('card');
                        productElement.dataset.id = product.id;
                        productElement.dataset.name = product.name;
                        productElement.dataset.price = product.price;
                        productElement.innerHTML = `
                            <h4 align="center">${product.name}</h4>
                            <img src="${product.image}" alt="${product.name}" class="card-image">
                            <p><h4>${product.price} $</h4></p>
                            <div class="card-buttons">
                                <form action="/add_to_cart" method="POST">
                                    <input type="hidden" name="product_id" value="${product.id}">
                                    <input type="hidden" name="product_name" value="${product.name}">
                                    <input type="hidden" name="product_price" value="${product.price}">
                                    <input type="hidden" name="product_image" value="${product.image}">
                                    <button type="submit" class="cart-button">Положить в корзину</button>
                                </form>
                            </div>
                        `;
                        otherProductsContainer.appendChild(productElement);
                    });
                    otherProductsContainer.classList.remove('hidden');
                    toggleProductsButton.textContent = 'Скрыть продукты';
                })
                .catch(error => console.error('Error fetching products:', error));
        } else {
            otherProductsContainer.innerHTML = '';
            otherProductsContainer.classList.add('hidden');
            toggleProductsButton.textContent = 'Показать другие продукты';
        }
    });

    // Очистка корзины
    clearCartButton?.addEventListener('click', () => {
        cart.length = 0;
        localStorage.removeItem('cart');
        updateCartCount();  // Обновляем счетчик
        renderCart();  // Перерисовываем корзину
    });

    // Инициализация состояния при загрузке страницы
    updateCartCount();
    renderCart();
});
