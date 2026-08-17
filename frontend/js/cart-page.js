/* ==================================================
   CART-PAGE.JS
   Used on cart.html only. Renders the cart, handles
   quantity/remove controls, and calls the real
   checkout API.
================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const itemsContainer = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!itemsContainer || !summary || !checkoutBtn) return;

    function renderCartPage() {
        const cart = getCart();

        if (cart.length === 0) {
            itemsContainer.innerHTML = '<p class="empty-text">Your cart is empty. <a href="products.html">Browse products →</a></p>';
            summary.style.display = 'none';
            return;
        }

        itemsContainer.innerHTML = '';

        cart.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'cart-row';
            row.innerHTML = `
                <div class="cart-row-info">
                    <h3>${item.name}</h3>
                    <p class="price"><strong>${Number(item.price).toLocaleString()} ETB</strong></p>
                </div>
                <div class="cart-row-qty">
                    <button type="button" class="qty-btn" data-action="decrease" data-id="${item.productId}" aria-label="Decrease quantity">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="qty-btn" data-action="increase" data-id="${item.productId}" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="remove-btn" data-action="remove" data-id="${item.productId}">Remove</button>
            `;
            itemsContainer.appendChild(row);
        });

        const { count, total } = getCartTotals();
        summary.style.display = 'flex';
        summary.querySelector('.cart-count').textContent = count;
        summary.querySelector('.cart-total').textContent = `${total.toLocaleString()} ETB`;
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout';
    }

    itemsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const { action, id } = button.dataset;
        if (action === 'increase') updateItemQuantity(id, 1);
        if (action === 'decrease') updateItemQuantity(id, -1);
        if (action === 'remove') removeItem(id);

        renderCartPage();
    });

    async function handleCheckout() {
        const user = getUser();

        if (!user) {
            showToast('⚠️ Please log in to checkout.');
            setTimeout(() => { window.location.href = 'login.html'; }, 900);
            return;
        }

        if (user.role !== 'buyer') {
            showToast('⚠️ Only buyer accounts can place orders.');
            return;
        }

        const cart = getCart();
        if (cart.length === 0) return;

        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Placing order...';

        try {
            const items = cart.map((item) => ({
                product_id: Number(item.productId),
                quantity: item.quantity,
            }));

            const data = await apiRequest('/orders/checkout', {
                method: 'POST',
                auth: true,
                body: { items },
            });

            clearCart();

            itemsContainer.innerHTML = `
                <div class="order-confirmation">
                    <h3>✅ Order placed!</h3>
                    <p>Order #${data.order.id} — Total: ${Number(data.order.total).toLocaleString()} ETB</p>
                    <p>Status: ${data.order.status}</p>
                    <a class="btn" href="products.html">Continue Shopping</a>
                </div>
            `;
            summary.style.display = 'none';
        } catch (err) {
            showToast(`⚠️ ${err.message}`);
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Checkout';
        }
    }

    checkoutBtn.addEventListener('click', handleCheckout);

    renderCartPage();
});
