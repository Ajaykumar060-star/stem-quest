/*
 * STEM Quest - Front-end auth & utility helpers
 *
 * These helpers are thin wrappers around the central data store and provide
 * the small, page-level conveniences (login state checks, redirects, formatters)
 * used by every page. The real logic lives in public/data-store.js.
 */
(function (global) {
  'use strict';

  function getLoggedInUser() {
    return global.STEMQUEST_STORE ? global.STEMQUEST_STORE.currentUser() : null;
  }

  function isLoggedIn() {
    return global.STEMQUEST_STORE ? global.STEMQUEST_STORE.isLoggedIn() : false;
  }

  function requireAuth(redirectTarget) {
    if (!isLoggedIn()) {
      var current = (window.location.pathname.split('/').pop() || '');
      if (current !== 'student_login.html') {
        window.location.href = redirectTarget || 'student_login.html';
      }
      return false;
    }
    return true;
  }

  // Sign the current user out and return to the login page.
  function signOut() {
    if (global.STEMQUEST_STORE) global.STEMQUEST_STORE.signOut();
    window.location.href = 'student_login.html';
  }

  global.STEMQUEST_AUTH = {
    requireAuth: requireAuth,
    signOut: signOut,
    isLoggedIn: isLoggedIn,
    getLoggedInUser: getLoggedInUser
  };

})(window);
