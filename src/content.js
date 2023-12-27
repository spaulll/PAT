document.addEventListener("submit", checkPassword);

function checkPassword(event) {
    const passwordInput = event.target.querySelector('input[type="password"]');
    
    if (passwordInput) {
        const password = passwordInput.value;
        chrome.runtime.sendMessage({ action: "checkPassword", password: password });
    }
}
