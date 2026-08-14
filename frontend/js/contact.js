/* ==================================================
   CONTACT.JS
   Used on contact.html only. Validates the contact form
   before "submitting" (simulated here — no backend yet).
================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name) {
            showToast('⚠️ Please enter your name.');
            nameInput.focus();
            return;
        }

        if (!email || !emailPattern.test(email)) {
            showToast('⚠️ Please enter a valid email.');
            emailInput.focus();
            return;
        }

        if (!message) {
            showToast('⚠️ Please write a message.');
            messageInput.focus();
            return;
        }

        // No backend yet — simulate success.
        // Later: replace this with a fetch() call to your server/API.
        showToast(`✅ Thanks, ${name}! Your message has been sent.`);
        contactForm.reset();
    });

});
