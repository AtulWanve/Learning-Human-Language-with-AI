// login.js
// Function to get CSRF token from cookies
function getCSRFToken() {
    const csrfCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
}

document.addEventListener("DOMContentLoaded", function () {
    const loginCard = document.getElementById("login-card");
    const signupCard = document.getElementById("signup-card");
    const showSignupBtn = document.getElementById("show-signup");
    const showLoginBtn = document.getElementById("show-login");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const togglePasswordBtns = document.querySelectorAll(".toggle-password");
    const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
    const errorMessage = document.getElementById("login-error-message");

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
            const eyeShow = this.querySelector(".eye-show");
            const eyeHide = this.querySelector(".eye-hide");
    
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
    
            eyeShow.style.display = isHidden ? "none" : "inline";
            eyeHide.style.display = isHidden ? "inline" : "none";
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

   // Handle login form submission
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const identifier = document.getElementById("login-identifier").value;
        const password = document.getElementById("login-password").value;

const loginData = {
    identifier: identifier,  // send either username or email
    password: password
};

        // Send POST request to the backend login API
        fetch("http://127.0.0.1:8000/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        })
        
        .then(response => response.json())
.then(data => {
    console.log("Backend response:", data);  // Log the entire response for debugging
    
    if (data.token) {
        // Successful login, store the token
        localStorage.setItem("auth_token", data.token);
        // Redirects to your main flashcard page
        window.location.href = "index.html"; 

    } else {
        // Show error message
        document.getElementById("login-error-message").textContent = data.error || "Login failed!";
        document.getElementById("login-error-message").classList.remove("hidden");        
    }
})

    .catch(error => {
        console.error("Error during login:", error);
        document.getElementById("login-error-message").textContent = "An unexpected error occurred.";
        document.getElementById("login-error-message").classList.remove("hidden"); // Show the error message
    });
});
   // Handle signup form submission
signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const signupData = {
        username: username,
        email: email,
        password: password
    };

    // CSRF not needed since @csrf_exempt is used
    fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(signupData),
    })
    .then(response => {
        console.log("Response Status:", response.status);  // Log status code
        return response.json();
    })
    .then(data => {
        console.log("Signup response:", data);  // Log the full response data
        if (data.message === "User created successfully!") {
            alert("Signup successful! You can now log in.");
            switchCard(signupCard, loginCard); // Show login card
            signupForm.reset(); // Clear form
        } else {
            alert(data.error || "Signup failed!");
        }
    })
    .catch(error => {
        console.error("Error during signup:", error);
        alert("An unexpected error occurred during signup.");
    });
});
});