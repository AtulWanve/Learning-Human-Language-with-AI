document.addEventListener("DOMContentLoaded", function () {
    const loginCard = document.getElementById("login-card");
    const signupCard = document.getElementById("signup-card");
    const showSignupBtn = document.getElementById("show-signup");
    const showLoginBtn = document.getElementById("show-login");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const togglePasswordBtns = document.querySelectorAll(".toggle-password");
    const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");

    // Apply saved theme
    function applyTheme() {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const savedTheme = localStorage.getItem("theme");
        const isDarkMode = savedTheme ? savedTheme === "dark" : systemPrefersDark;
        document.body.classList.toggle("dark-mode", isDarkMode);
    }

    // Toggle dark mode
    toggleDarkModeBtn.addEventListener("click", function () {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });

    applyTheme();

    // Show/hide password (Correctly placed inside input field)
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const input = this.parentElement.querySelector("input");
            input.type = input.type === "password" ? "text" : "password";
            this.textContent = input.type === "password" ? "👁" : "🙈";
        });
    });

    // Switch between login and signup
    function switchCard(hide, show) {
        hide.classList.remove("active");
        show.classList.add("active");
    }

    showSignupBtn.addEventListener("click", function () {
        switchCard(loginCard, signupCard);
    });

    showLoginBtn.addEventListener("click", function () {
        switchCard(signupCard, loginCard);
    });

    // Handle form submission (Replace with backend API later)
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Login Successful!"); // Replace with backend API call
    });

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Signup Successful!"); // Replace with backend API call
    });
});
