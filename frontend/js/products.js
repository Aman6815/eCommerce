/* ==================================================
   PRODUCTS.JS
   Shared logic for fetching products from the API and
   rendering them as .product-card elements. Used on
   both index.html (featured) and products.html (full
   catalog + search).
================================================== */

const CATEGORY_ICONS = {
    Phones: '📱',
    Clothing: '👕',
    Shoes: '👟',
    Cosmetics: '🧴',
};

function formatPrice(price) {
    return `${Number(price).toLocaleString()} ETB`;
}

function renderProductCard(product) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.id = product.id;

    const icon = CATEGORY_ICONS[product.category] || '🛍️';
    const imageHtml = product.image_url
        ? `<img src="${product.image_url}" alt="${product.name}">`
        : `<div class="no-image" aria-hidden="true">${icon}</div>`;

    article.innerHTML = `
        <figure class="product-image">${imageHtml}</figure>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="price"><strong>${formatPrice(product.price)}</strong></p>
            <p class="seller">Seller: ${product.seller}</p>
        </div>
        <button type="button">Add to Cart</button>
    `;

    return article;
}

/**
 * Fetch products from the API and render them into `container`.
 * @param {HTMLElement} container
 * @param {{ q?: string, category?: string, limit?: number }} filters
 */
async function loadProducts(container, filters = {}) {
    container.innerHTML = '<p class="loading-text">Loading products...</p>';

    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters.limit) params.set('limit', filters.limit);

    try {
        const products = await apiRequest(`/products?${params.toString()}`);
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<p class="empty-text">No products found.</p>';
            return;
        }

        products.forEach((product) => container.appendChild(renderProductCard(product)));
    } catch (err) {
        container.innerHTML = `<p class="empty-text">Could not load products (${err.message}). Is the backend running?</p>`;
    }
}

/**
 * Wire "Add to Cart" clicks using event delegation, so it keeps
 * working as products.js re-renders cards dynamically.
 */
function wireAddToCart(container) {
    container.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const card = button.closest('.product-card');
        if (!card) return;

        const id = card.dataset.id;
        const name = card.querySelector('.product-info h3').textContent.trim();
        const priceText = card.querySelector('.price strong').textContent;
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

        addItemToCart(id, name, price);
        showToast(`✅ ${name} added to cart`);

        const originalText = button.textContent;
        button.textContent = 'Added ✓';
        button.disabled = true;

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1000);
    });
}
