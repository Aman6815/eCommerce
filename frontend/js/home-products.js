/* ==================================================
   HOME-PRODUCTS.JS
   Used on index.html only. Loads a small set of
   products as "Featured Products" from the API.
================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#products .products');
    if (!container) return;

    wireAddToCart(container);
    loadProducts(container, { limit: 4 });
});
