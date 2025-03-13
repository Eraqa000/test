document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-container');
    const clearCartButton = document.getElementById('clear-cart');

    const updateCartCount = () => {
        fetch('/cart_count')
            .then(response => response.json())
            .then(data => {
                cartCountElement.textContent = data.count || '0';
            })
            .catch(error => console.error('Error fetching cart count:', error));
    };

    const renderCart = () => {
        cartContainer.innerHTML = cart.length
            ? cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-price">${item.price} ₽</p>
                        <p class="cart-item-quantity">Количество: ${item.quantity}</p>
                    </div>
                </div>
            `).join('')
            : '<p>Корзина пуста</p>';
    };

    const addToCart = (product) => {
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    };

    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-button')) {
            const productId = event.target.dataset.id;
            removeFromCart(productId);
        }
    });

    const removeFromCart = (productId) => {
        fetch('/remove_from_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: productId })
        }).then(response => {
            if (response.ok) {
                document.querySelector(`.card[data-id="${productId}"]`).remove();
                updateCartCount();
            } else {
                console.error('Failed to remove product from cart');
            }
        });
    };

    clearCartButton?.addEventListener('click', () => {
        fetch('/clear_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrf_token') // Если используете CSRF защиту
            }
        }).then(response => {
            if (response.ok) {
                cart.length = 0;
                localStorage.removeItem('cart');
                updateCartCount();
                renderCart();
            } else {
                console.error('Failed to clear cart');
            }
        });
    });

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    updateCartCount();
    renderCart();
});