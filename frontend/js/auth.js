/* ==================================================
   AUTH.JS
   Shared on every page. Stores the logged-in session
   (token + user) in localStorage and fills in the
   login/register/logout links in the nav.
================================================== */

const SESSION_KEY = 'haroniSession';

function getSession() {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

function getToken() {
    const session = getSession();
    return session ? session.token : null;
}

function getUser() {
    const session = getSession();
    return session ? session.user : null;
}

function setSession(token, user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

/* ---------- Fill in the nav auth slot ---------- */

function renderAuthNav() {
    const slot = document.getElementById('auth-slot');
    if (!slot) return;

    const user = getUser();
    slot.innerHTML = '';

    if (user) {
        const greeting = document.createElement('span');
        greeting.className = 'nav-user';
        greeting.textContent = `Hi, ${user.name.split(' ')[0]} (${user.role})`;

        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            clearSession();
            window.location.href = 'index.html';
        });

        slot.appendChild(greeting);
        slot.appendChild(logoutLink);
    } else {
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.textContent = 'Login';

        const registerLink = document.createElement('a');
        registerLink.href = 'register.html';
        registerLink.textContent = 'Register';

        slot.appendChild(loginLink);
        slot.appendChild(registerLink);
    }
}

document.addEventListener('DOMContentLoaded', renderAuthNav);
