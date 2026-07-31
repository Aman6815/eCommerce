/* ==================================================
   CART.JS
   Shared on every page. Persists cart using localStorage
   so it survives navigation between pages.
================================================== */

const CART_KEY = 'haroniCart';

/* ---------- Storage helpers ---------- */

function getCart() {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addItemToCart(name, price) {
    const cart = getCart();
    cart.push({ name, price });
    saveCart(cart);
    updateCartBadge();
}

function getCartTotals() {
    const cart = getCart();
    const count = cart.length;
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    return { count, total };
}

/* ---------- Cart badge (top-right, on every page) ---------- */

function updateCartBadge() {
    let badge = document.getElementById('cart-badge');

    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'cart-badge';
        document.body.appendChild(badge);
    }

    const { count, total } = getCartTotals();
    badge.textContent = `Cart: ${count} (${total.toLocaleString()} ETB)`;
}

/* ---------- Toast notifications (shared helper) ---------- */

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

/* ---------- Wire up all "Add to Cart" buttons on this page ---------- */

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const button = card.querySelector('button');
        const nameEl = card.querySelector('.product-info h3');
        const priceEl = card.querySelector('.price strong');

        if (!button || !priceEl) return;

        button.addEventListener('click', () => {
            const name = nameEl ? nameEl.textContent.trim() : 'Product';
            const priceNumber = parseFloat(
                priceEl.textContent.replace(/[^\d.]/g, '')
            ) || 0;

            addItemToCart(name, priceNumber);
            showToast(`✅ ${name} added to cart`);

            const originalText = button.textContent;
            button.textContent = 'Added ✓';
            button.disabled = true;

            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 1000);
        });
    });
});
