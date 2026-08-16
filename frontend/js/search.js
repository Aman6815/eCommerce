/* ==================================================
   SEARCH.JS
   Used on products.html only. Loads products from the
   API and re-queries it as the user searches/filters,
   instead of filtering already-rendered DOM elements.
================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const productsContainer = document.querySelector('#products .products');

    if (!searchForm || !searchInput || !categorySelect || !productsContainer) return;

    wireAddToCart(productsContainer);

    function currentFilters() {
        return {
            q: searchInput.value.trim(),
            category: categorySelect.value,
        };
    }

    let debounceTimer = null;
    function runSearch() {
        loadProducts(productsContainer, currentFilters());
    }

    function debouncedSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runSearch, 300);
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        runSearch();
    });

    searchInput.addEventListener('input', debouncedSearch);
    categorySelect.addEventListener('change', runSearch);

    // Category cards on other pages deep-link here, e.g.
    // products.html?category=Phones
    const params = new URLSearchParams(window.location.search);
    const presetCategory = params.get('category');

    if (presetCategory) {
        const options = Array.from(categorySelect.options);
        const match = options.find(
            (opt) => opt.value.toLowerCase() === presetCategory.toLowerCase()
        );
        if (match) categorySelect.value = match.value;
    }

    runSearch();
});
