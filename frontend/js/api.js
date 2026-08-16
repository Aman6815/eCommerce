/* ==================================================
   API.JS
   Shared on every page. Thin wrapper around fetch()
   that points at the backend and attaches the JWT
   automatically when needed.
================================================== */

const API_BASE = 'http://localhost:5000/api';

/**
 * @param {string} path - e.g. '/products'
 * @param {object} options
 * @param {'GET'|'POST'|'PUT'|'DELETE'} [options.method]
 * @param {object} [options.body]
 * @param {boolean} [options.auth] - attach Authorization header if logged in
 */
async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    if (auth) {
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    return data;
}
