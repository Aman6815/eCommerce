/* ==================================================
   SEARCH.JS
   Used on products.html only. Filters product cards
   by search text and category.
================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const productCards = document.querySelectorAll('.product-card');
    const productsSection = document.getElementById('products');

    if (!searchForm || !searchInput || !categorySelect) return;

    function filterProducts() {
        const query = searchInput.value.trim().toLowerCase();
        const category = categorySelect.value;
        let visibleCount = 0;

        productCards.forEach(card => {
            const nameEl = card.querySelector('.product-info h3');
            const name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
            const cardCategory = card.dataset.category || 'All';

            const matchesQuery = query === '' || name.includes(query);
            const matchesCategory = category === 'All' || cardCategory === category;

            const isVisible = matchesQuery && matchesCategory;
            card.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount++;
        });

        return visibleCount;
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const visibleCount = filterProducts();

        if (visibleCount === 0) {
            showToast('No products found. Try a different search.');
        } else {
            showToast(`Found ${visibleCount} product(s).`);
        }
    });

    // Live filtering as the user types/selects
    searchInput.addEventListener('input', filterProducts);
    categorySelect.addEventListener('change', filterProducts);

    // Category cards on other pages can deep-link here, e.g.
    // products.html?category=Phones
    const params = new URLSearchParams(window.location.search);
    const presetCategory = params.get('category');

    if (presetCategory) {
        const options = Array.from(categorySelect.options);
        const match = options.find(
            opt => opt.value.toLowerCase() === presetCategory.toLowerCase()
        );
        if (match) {
            categorySelect.value = match.value;
            filterProducts();
        }
    }

});
