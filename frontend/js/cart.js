/* ==================================================
   CART.JS
   Shared on every page. Persists cart using localStorage
   so it survives navigation between pages.

   Note: "Add to Cart" click handling now lives in
   products.js (wireAddToCart), since product cards are
   rendered dynamically from the API. This file just owns
   the cart data itself and the badge/toast UI.
================================================== */

const CART_KEY = 'haroniCart';

/* ---------- Storage helpers ---------- */

function getCart() {
    const data = localStorage.getItem(CART_KEY);
    if (!data) return [];

    try {
        const cart = JSON.parse(data);
        if (!Array.isArray(cart)) return [];

        // Normalize older cart entries that predate quantity/productId
        // fields, so a stale localStorage cart can't produce NaN totals.
        return cart
            .filter((item) => item && typeof item.price === 'number')
            .map((item) => ({
                productId: item.productId ?? null,
                name: item.name ?? 'Product',
                price: item.price,
                quantity: Number.isFinite(item.quantity) ? item.quantity : 1,
            }));
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addItemToCart(productId, name, price) {
    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId, name, price, quantity: 1 });
    }

    saveCart(cart);
    updateCartBadge();
}

function getCartTotals() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

document.addEventListener('DOMContentLoaded', updateCartBadge);
