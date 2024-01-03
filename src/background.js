import sha1 from '/node_modules/js-sha1';

// Listen for the extension to be installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Extension has been installed for the first time
        sendInstallNotification();
    }
});

const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "checkPassword") {
            checkPassword(request.password);
        }
    }
);

async function checkPassword(password) {
    const str = isStrong(password);
    const isLeak = await isBreach(password);
    if (isLeak.isTrue) {
        const msg = str + " your entered password has been leaked " + isLeak.leakNo + "times. Please consider changing it ASAP!!"
        showNotification(msg);
    }
}

//checks password strength
function isStrong(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);
    
    const score = [password.length >= minLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    return score === 5 ? 'Password seems to be strong. \nBut' : 'Password is weak. \nAnd';
}

//checks for breaches
async function isBreach(password) {
    const passwordHash = await sha1(password).toString().toUpperCase();
    try {
        const response = await fetch(`https://api.pwnedpasswords.com/range/${passwordHash.slice(0,5)}`);
        if (!response.ok) {
            throw new Error('Could not check password.');
        }

        const data = await response.text();
        const hashes = data.split('\n').map(line => line.split(':'));
        const found = hashes.find(([h, count]) => passwordHash.slice(5) === h);

        if (found) {
            console.log(`Password has been leaked ${found[1]} times.`);
            return {
                isTrue: true,
                leakNo: found[1]
            };
        }

        console.log('Password is secure.');
        return {
            isTrue: false,
            leakNo: null
        };
    } catch (error) {
        console.error(error.message);
        return {
            isTrue: false,
            leakNo: null
        };
    }
}

//send notification on install
function sendInstallNotification() {
    const msg = `Thank you for installing me. I am PAT! Your passwords are not being stored or logged by me. It is safely handled with encryption. I'll let you know it your passwords are compromised.\nHappy browsing! Thank You 😃`;
    showNotification(msg);
}

//for sending notification.
function showNotification(msg) {
    const iconUrl = chrome.runtime.getURL('assets/icon128.png');
    chrome.notifications.create('', {
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Alert',
        message: msg,
        priority: 2,
        requireInteraction: true
    });
}

