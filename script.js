/**
 * script.js - Interactive functions for Healthcare Connect NGO
 * This script handles theme switching, form validation, storage, and the chatbot.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. THEME TOGGLE LOGIC ---
    // Select the toggle button and check for saved theme in localStorage
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the current theme globally on load
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    // Click listener to switch between light and dark
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';
        
        // Update the HTML attribute which triggers CSS variable changes
        document.documentElement.setAttribute('data-theme', newTheme);
        // Save user preference
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Helper: changes the icon between a Sun and Moon
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun'); // Sun icon for dark mode
        } else {
            icon.classList.replace('fa-sun', 'fa-moon'); // Moon icon for light mode
        }
    }

    // --- 2. IMPACT DASHBOARD LOGIC ---
    // Updates the counter on the "Our Impact" section
    const requestCountEl = document.getElementById('request-count');

    function updateDashboard() {
        // Retrieve the array of requests from storage, or use empty array if none
        const requests = JSON.parse(localStorage.getItem('healthcare_requests')) || [];
        // Update the visual text to show how many items are in the array
        requestCountEl.innerText = requests.length;
    }
    // Run update right after the page loads
    updateDashboard();

    // --- 3. PATIENT SUPPORT FORM LOGIC ---
    const supportForm = document.getElementById('patient-support-form');
    const confirmationMsg = document.getElementById('confirmation-msg');

    // Handle form submission
    supportForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page from refreshing
        
        // Run our custom field verification
        if (validateForm()) {
            // Collect all inputs as a JavaScript Object
            const formData = new FormData(supportForm);
            const request = Object.fromEntries(formData.entries());
            
            // Add metadata for tracking
            request.id = Date.now();
            request.timestamp = new Date().toISOString();

            // Visual feedback: Show the spinner, disable the clicking
            const btn = document.getElementById('submitBtn');
            const btnText = btn.querySelector('.btn-text');
            const loader = btn.querySelector('.loader');

            btnText.style.display = 'none';
            loader.style.display = 'block';
            btn.disabled = true;

            // Artificial delay to simulate network communication
            setTimeout(() => {
                // Save the new request to the existing list in browser memory
                const requests = JSON.parse(localStorage.getItem('healthcare_requests')) || [];
                requests.push(request);
                localStorage.setItem('healthcare_requests', JSON.stringify(requests));

                // Switch visible UI components
                supportForm.style.display = 'none';
                confirmationMsg.style.display = 'block';
                updateDashboard(); // Refresh counter on dashboard
                
                // Restore button state
                btnText.style.display = 'block';
                loader.style.display = 'none';
                btn.disabled = false;
            }, 1000);
        }
    });

    // Validates inputs: Check length, phone format, and email format
    function validateForm() {
        let isValid = true;
        const name = document.getElementById('fullName');
        const mobile = document.getElementById('mobile');
        const email = document.getElementById('email');

        // Clear existing error messages first
        document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');

        // Name check: must be longer than 2 chars
        if (name.value.trim().length < 3) {
            document.getElementById('nameError').innerText = 'Name must be at least 3 characters.';
            isValid = false;
        }

        // Mobile check: exactly 10 digits
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(mobile.value)) {
            document.getElementById('mobileError').innerText = 'Please enter a valid 10-digit mobile number.';
            isValid = false;
        }

        // Email check: standard pattern verification
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            document.getElementById('emailError').innerText = 'Please enter a valid email address.';
            isValid = false;
        }

        return isValid;
    }

    // Resets the UI so a user can file another request
    window.resetForm = () => {
        supportForm.reset();
        supportForm.style.display = 'block';
        confirmationMsg.style.display = 'none';
    };

    // --- 4. HEALTH BOT (CHATBOT) LOGIC ---
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    const chatBody = document.getElementById('chat-body');

    // Pre-defined responses mapped to user keywords
    const faqResponses = {
        "volunteer": "To request a volunteer, please fill out the 'Patient Support Form' and select 'Volunteer Support'.",
        "hours": "Office hours: 9 AM - 6 PM Mon-Sat. Emergency support is 24/7 via the form.",
        "contact": "Email: contact@healthcareconnect.org | Helpline: +91 98765 43210.",
        "documents": "Required: ID proof and latest medical prescription.",
        "help": "I can assist with: volunteers, working hours, contact info, and documents.",
        "hi": "Hello! Looking for healthcare assistance? Feel free to ask me anything."
    };

    // Open/Close Chat events
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('active'); // CSS handles the 'display:flex'
    });

    document.getElementById('close-chat').addEventListener('click', () => {
        chatContainer.classList.remove('active');
    });

    // Send logic for button click and 'Enter' key
    sendChat.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    function handleChat() {
        const text = chatInput.value.trim();
        const query = text.toLowerCase();
        if (!query) return;

        // Show what user typed
        appendMessage('user', text);
        chatInput.value = '';

        // Bot thinking delay
        setTimeout(() => {
            let response = "I'm sorry, I didn't quite understand. Try asking about 'volunteers', 'hours', 'contact', or 'documents'.";
            
            // Loop through keyword map to find a match
            for (let key in faqResponses) {
                if (query.includes(key)) {
                    response = faqResponses[key];
                    break;
                }
            }

            // Show Bot's response
            appendMessage('bot', response);
        }, 500);
    }

    // Helper: Creates a message div and scrolls to bottom
    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        
        let content = `<p>${text}</p>`;
        // Always attach the medical disclaimer if the bot is talking
        if (sender === 'bot') {
            content += `<small>AI Assistant: I can help with general information only and do not provide medical diagnosis.</small>`;
        }
        
        msgDiv.innerHTML = content;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll
    }
});
