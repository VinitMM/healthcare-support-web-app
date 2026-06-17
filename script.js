/**
 * script.js - Enhanced Logic for Healthcare Connect
 * Handles Premium UI interactions, Bot logic, and Form robust processing.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PREMIUM UI HOOKS ---
    const nav = document.getElementById('main-nav');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const themeToggle = document.getElementById('theme-toggle');

    // Scroll Effect for Navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle logic
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Close menu when clicking items (Mobile UX)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });

    // --- 2. THEME PERSISTENCE ---
    const savedTheme = localStorage.getItem('hc_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.body.getAttribute('data-theme');
            const target = current === 'light' ? 'dark' : 'light';
            
            document.body.setAttribute('data-theme', target);
            localStorage.setItem('hc_theme', target);
            updateThemeUI(target);
        });
    }

    function updateThemeUI(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // --- 3. FORM PROCESSING & PERSISTENCE ---
    const supportForm = document.getElementById('patient-support-form');
    const successScreen = document.getElementById('success-message');
    const requestCountEl = document.getElementById('request-count');

    // Initialize/Refresh Dashboard
    function syncDashboard() {
        try {
            const data = JSON.parse(localStorage.getItem('hc_requests')) || [];
            if (requestCountEl) requestCountEl.innerText = data.length + 245; // Base offset + user entries
        } catch (e) {
            console.error("Storage Error", e);
        }
    }
    syncDashboard();

    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateForm()) {
                const submitBtn = document.getElementById('submitBtn');
                const loader = document.getElementById('loader');
                const btnContent = submitBtn.querySelector('.btn-content');

                // Visual Loading State
                btnContent.style.opacity = '0';
                loader.style.display = 'block';
                submitBtn.disabled = true;

                // Collect Data
                const formData = new FormData(supportForm);
                const payload = Object.fromEntries(formData.entries());
                payload.date = new Date().toLocaleString();

                // Simulated API Delay
                setTimeout(() => {
                    const existing = JSON.parse(localStorage.getItem('hc_requests')) || [];
                    existing.push(payload);
                    localStorage.setItem('hc_requests', JSON.stringify(existing));

                    supportForm.style.display = 'none';
                    successScreen.style.display = 'block';
                    syncDashboard();

                    // Cleanup button
                    btnContent.style.opacity = '1';
                    loader.style.display = 'none';
                    submitBtn.disabled = false;
                }, 1500);
            }
        });
    }

    function validateForm() {
        let valid = true;
        const name = document.getElementById('fullName');
        const mobile = document.getElementById('mobile');
        const email = document.getElementById('email');

        // Reset
        document.querySelectorAll('.error-text').forEach(tx => tx.innerText = '');

        if (name.value.length < 3) {
            document.getElementById('nameError').innerText = "Please enter your full name.";
            valid = false;
        }

        if (!/^\d{10}$/.test(mobile.value)) {
            document.getElementById('mobileError').innerText = "Enter a valid 10-digit number.";
            valid = false;
        }

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            document.getElementById('emailError').innerText = "Invalid email format.";
            valid = false;
        }

        return valid;
    }

    // Global reset exposed to window
    window.resetForm = () => {
        supportForm.reset();
        supportForm.style.display = 'block';
        successScreen.style.display = 'none';
    };

    // --- 4. IMPROVED AI CHATBOT LOGIC ---
    const chatToggle = document.getElementById('chat-toggle');
    const chatPanel = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chat-body');

    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            chatPanel.classList.toggle('active');
        });
    }

    if (closeChat) {
        closeChat.addEventListener('click', () => {
            chatPanel.classList.remove('active');
        });
    }

    const responses = {
        "volunteer": "Our volunteers are the heart of NGO. You can apply to be one by clicking the 'Volunteer Home Support' option in the form above!",
        "hours": "We operate 24/7 for emergency guidance. Our physical offices are open Mon-Sat, 9 AM to 6 PM.",
        "documents": "For medical funding, please keep your ID proof and latest doctor prescription handy.",
        "help": "I can help you with Information, Form Guidance, and NGO mission details. Type 'hours' or 'volunteer'!",
        "contact": "Email us at support@healthcareconnect.org or use the emergency guidance option in the form."
    };

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMsg('user', text);
        chatInput.value = '';
        chatPanel.classList.add('searching'); // Start pulsate animation

        // Show "typing..." indicator
        const typingId = 'typing-' + Date.now();
        const typingMsg = document.createElement('div');
        typingMsg.className = 'msg bot typing';
        typingMsg.id = typingId;
        typingMsg.innerHTML = '<p><span>.</span><span>.</span><span>.</span></p>';
        chatMessages.appendChild(typingMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            // Remove typing indicator
            const el = document.getElementById(typingId);
            if (el) el.remove();

            const lowText = text.toLowerCase();
            let matched = "I'm here to browse our FAQs. Could you ask about 'volunteers', 'hours', 'contact', or 'medical help'?";
            
            // Expanded logic
            if (lowText.includes('hello') || lowText.includes('hi')) {
                matched = "Hello! I'm your Healthcare Assistant. How can I support you today?";
            } else if (lowText.includes('thank')) {
                matched = "You're very welcome! We're here to help. Is there anything else?";
            } else {
                for (let key in responses) {
                    if (lowText.includes(key)) {
                        matched = responses[key];
                        break;
                    }
                }
            }
            chatPanel.classList.remove('searching'); // Remove searching state
            addMsg('bot', matched);
        }, 1200);
    }

    function addMsg(type, text) {
        const msg = document.createElement('div');
        msg.className = `msg ${type}`;
        msg.innerHTML = `<p>${text}</p>${type === 'bot' ? '<small>Health AI Assistant</small>' : ''}`;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendChat.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
