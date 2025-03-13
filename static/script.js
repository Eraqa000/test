// Этот код нужно разместить в основном скрипте главной страницы или в отдельном скрипте, который выполняется на всех страницах.
document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');

    // Функция для обновления счетчика корзины
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems === 0 ? '0' : totalItems;

        // Если нужно добавить анимацию
        cartCountElement.classList.add('animate');
        setTimeout(() => cartCountElement.classList.remove('animate'), 500);
    };

    // Обновляем счетчик при загрузке страницы
    updateCartCount();

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
            updateCartCount();  // Обновляем счетчик после добавления товара
        }
    });

    // Функция для добавления товара в корзину
    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    };
});
