document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.getElementById('signinForm');
    const signUpForm = document.getElementById('signupForm');
    const resultBox = document.getElementById('result');

    function goToTodos() {
        window.location.href = "../todo_page/index.html"; // relative navigation
    }

    if (signUpForm) {
        signUpForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(signUpForm);
            const username = formData.get("username").trim();
            const password = formData.get("password").trim();
            try {
                const response = await axios.post("http://localhost:3004/signup", { username, password });
                const { token } = response.data;
                if (token) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("username", username);
                    alert("You are signed up");
                    goToTodos();
                } else {
                    alert("Signup failed");
                }
            } catch (error) {
                alert("Error signing up");
                if (resultBox) resultBox.textContent = error.response?.data?.message || 'Signup error';
            }
        });
    }

    if (signInForm) {
        signInForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(signInForm);
            const username = formData.get("username").trim();
            const password = formData.get("password").trim();
            try {
                const response = await axios.post("http://localhost:3004/signin", { username, password });
                const { token } = response.data;
                if (token) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("username", username);
                    alert("You are signed in");
                    goToTodos();
                } else {
                    alert("Signin failed");
                }
            } catch (error) {
                alert("Error signing in");
                if (resultBox) resultBox.textContent = error.response?.data?.message || 'Signin error';
            }
        });
    }

    // Swap panels
    document.querySelectorAll('[data-swap]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = a.getAttribute('data-swap');
            document.getElementById('signupPanel').classList.toggle('hidden', target !== 'signup');
            document.getElementById('signinPanel').classList.toggle('hidden', target !== 'signin');
        });
    });
});