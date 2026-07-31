/* ==================================================
   NAV.JS
   Shared on every page: smooth scroll for in-page
   anchor links, and highlights the active nav item.
================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Smooth scroll for links that point to an in-page section (e.g. #categories)
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);

            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Highlight the nav link matching the current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const allNavLinks = document.querySelectorAll('nav a');

    allNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('#')[0];
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });

});
