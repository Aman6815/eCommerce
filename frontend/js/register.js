/* ==================================================
   REGISTER.JS
   Used on register.html only.
================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('.auth-form');
    if (!form) return;

    const roleRadios = document.querySelectorAll('input[name="role"]');
    const sellerFields = document.getElementById('seller-fields');

    roleRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
            const isSeller = document.querySelector('input[name="role"]:checked').value === 'seller';
            sellerFields.style.display = isSeller ? 'block' : 'none';
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const shopName = document.getElementById('shop_name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const location = document.getElementById('location').value.trim();

        if (!name || !email || !password) {
            showToast('⚠️ Please fill in your name, email, and password.');
            return;
        }

        if (password.length < 6) {
            showToast('⚠️ Password must be at least 6 characters.');
            return;
        }

        if (role === 'seller' && !shopName) {
            showToast('⚠️ Shop name is required to register as a seller.');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating account...';

        const body = { name, email, password, role };
        if (role === 'seller') {
            body.shop_name = shopName;
            if (phone) body.phone = phone;
            if (location) body.location = location;
        }

        try {
            const data = await apiRequest('/auth/register', { method: 'POST', body });
            setSession(data.token, data.user);
            showToast(data.message || '✅ Account created.');
            setTimeout(() => { window.location.href = 'index.html'; }, 900);
        } catch (err) {
            showToast(`⚠️ ${err.message}`);
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        }
    });

});
