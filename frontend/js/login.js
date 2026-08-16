/* ==================================================
   LOGIN.JS
   Used on login.html only.
================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('.auth-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showToast('⚠️ Please enter your email and password.');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        try {
            const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
            setSession(data.token, data.user);
            showToast(`✅ Welcome back, ${data.user.name.split(' ')[0]}!`);
            setTimeout(() => { window.location.href = 'index.html'; }, 700);
        } catch (err) {
            showToast(`⚠️ ${err.message}`);
            submitButton.disabled = false;
            submitButton.textContent = 'Log In';
        }
    });

});
