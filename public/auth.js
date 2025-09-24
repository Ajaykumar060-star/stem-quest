// Simple front-end auth utilities for STEM Quest
// Uses sessionStorage/localStorage to track login state

function getLoggedInUser() {
    try {
        const raw = sessionStorage.getItem('stemquest_user');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return sessionStorage.getItem('stemquest_logged_in') === 'true';
}

function requireAuth() {
    if (!isLoggedIn()) {
        // Redirect to login if not authenticated
        const current = window.location.pathname.split('/').pop() || '';
        if (current !== 'student_login.html') {
            window.location.href = 'student_login.html';
        }
        return false;
    }
    return true;
}

function signOut() {
    try {
        sessionStorage.removeItem('stemquest_logged_in');
        sessionStorage.removeItem('stemquest_user');
    } finally {
        window.location.href = 'student_login.html';
    }
}

window.STEMQUEST_AUTH = {
    requireAuth: requireAuth,
    signOut: signOut,
    isLoggedIn: isLoggedIn,
    getLoggedInUser: getLoggedInUser,
    PASSWORD: 'password123'
};


