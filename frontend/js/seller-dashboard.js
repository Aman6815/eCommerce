/* ==================================================
   SELLER-DASHBOARD.JS
   Used on seller-dashboard.html only.
   Lets a logged-in seller list, add, edit, and delete
   their own products.
================================================== */

document.addEventListener('DOMContentLoaded', async () => {

    const guardMessage = document.getElementById('guard-message');
    const dashboardContent = document.getElementById('dashboard-content');
    const form = document.getElementById('product-form');
    const categorySelect = document.getElementById('category_id');
    const productList = document.getElementById('my-products');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('form-submit');
    const cancelEditButton = document.getElementById('cancel-edit');
    const editingIdField = document.getElementById('editing-id');

    /* ---------- Step 1: only sellers get past this point ---------- */
    const user = getUser();

    if (!user) {
        guardMessage.textContent = 'Please log in as a seller to view this page.';
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        return;
    }

    if (user.role !== 'seller') {
        guardMessage.textContent = 'This page is only available to seller accounts.';
        return;
    }

    guardMessage.style.display = 'none';
    dashboardContent.style.display = 'block';

    /* ---------- Step 2: load categories into the dropdown ---------- */
    try {
        const categories = await apiRequest('/categories');
        categorySelect.innerHTML = categories
            .map((c) => `<option value="${c.id}">${c.name}</option>`)
            .join('');
    } catch (err) {
        categorySelect.innerHTML = '<option value="">Could not load categories</option>';
    }

    /* ---------- Step 3: load and render "my products" ---------- */
    async function loadMyProducts() {
        productList.innerHTML = '<p class="loading-text">Loading your products...</p>';

        try {
            const products = await apiRequest('/products/mine', { auth: true });

            if (products.length === 0) {
                productList.innerHTML = '<p class="empty-text">You haven\'t added any products yet.</p>';
                return;
            }

            productList.innerHTML = '';
            products.forEach((product) => {
                const row = document.createElement('div');
                row.className = 'cart-row';
                row.innerHTML = `
                    <div class="cart-row-info">
                        <h3>${product.name} ${product.is_active ? '' : '<span class="status-inactive">(inactive)</span>'}</h3>
                        <p class="price"><strong>${Number(product.price).toLocaleString()} ETB</strong></p>
                        <p class="seller">Stock: ${product.stock} · Category: ${product.category || 'None'}</p>
                    </div>
                    <div class="cart-row-qty">
                        <button type="button" class="btn-edit" data-id="${product.id}">Edit</button>
                        <button type="button" class="remove-btn" data-id="${product.id}">Delete</button>
                    </div>
                `;

                row.querySelector('.btn-edit').addEventListener('click', () => startEdit(product));
                row.querySelector('.remove-btn').addEventListener('click', () => deleteProduct(product.id));

                productList.appendChild(row);
            });
        } catch (err) {
            productList.innerHTML = `<p class="empty-text">Could not load your products (${err.message}).</p>`;
        }
    }

    /* ---------- Step 4: fill the form to edit an existing product ---------- */
    function startEdit(product) {
        editingIdField.value = product.id;
        form.name.value = product.name;
        form.description.value = product.description || '';
        form.price.value = product.price;
        form.stock.value = product.stock;
        form.category_id.value = product.category_id || '';
        form.is_active.checked = product.is_active;

        formTitle.textContent = `Editing: ${product.name}`;
        submitButton.textContent = 'Update Product';
        cancelEditButton.style.display = 'inline-flex';
        form.scrollIntoView({ behavior: 'smooth' });
    }

    function resetForm() {
        form.reset();
        editingIdField.value = '';
        formTitle.textContent = 'Add a New Product';
        submitButton.textContent = 'Add Product';
        cancelEditButton.style.display = 'none';
    }

    cancelEditButton.addEventListener('click', resetForm);

    /* ---------- Step 5: delete a product ---------- */
    async function deleteProduct(id) {
        if (!confirm('Delete this product? This cannot be undone.')) return;

        try {
            await apiRequest(`/products/${id}`, { method: 'DELETE', auth: true });
            showToast('✅ Product deleted.');
            loadMyProducts();
        } catch (err) {
            showToast(`⚠️ ${err.message}`);
        }
    }

    /* ---------- Step 6: submit the form (add or update) ---------- */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const body = {
            name: form.name.value.trim(),
            description: form.description.value.trim() || null,
            price: parseFloat(form.price.value),
            stock: parseInt(form.stock.value, 10),
            category_id: form.category_id.value || null,
            is_active: form.is_active.checked,
        };

        if (!body.name || Number.isNaN(body.price)) {
            showToast('⚠️ Product name and a valid price are required.');
            return;
        }

        const editingId = editingIdField.value;
        submitButton.disabled = true;

        try {
            if (editingId) {
                await apiRequest(`/products/${editingId}`, { method: 'PUT', auth: true, body });
                showToast('✅ Product updated.');
            } else {
                await apiRequest('/products', { method: 'POST', auth: true, body });
                showToast('✅ Product added.');
            }

            resetForm();
            loadMyProducts();
        } catch (err) {
            showToast(`⚠️ ${err.message}`);
        } finally {
            submitButton.disabled = false;
        }
    });

    loadMyProducts();
});
