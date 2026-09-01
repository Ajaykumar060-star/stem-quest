/*
 * STEM Quest - Central Data Store
 *
 * This module is the single source of truth for all application state:
 *   - User accounts (registration, login, password management)
 *   - Student profiles (name, grade, school, avatar, preferences)
 *   - Progress & game history (scores, games played, time spent)
 *   - Achievements and badges
 *
 * Everything is persisted to localStorage so the app works fully offline
 * across page navigations. The API is intentionally simple and dependency-free.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'stemquest_store_v1';

  // ---------------------------------------------------------------------------
  // Seed data - a default account is created on first run so new visitors can
  // explore the app immediately.
  // ---------------------------------------------------------------------------
  function seedData() {
    var now = Date.now();
    var today = new Date(now).toISOString();

    return {
      version: 1,
      users: {
        'student': {
          id: 'student',
          username: 'student',
          password: 'password123',
          displayName: 'Arjun Mehta',
          grade: 8,
          school: 'Riverside High School',
          studentId: 'STU1001',
          avatar: null,
          language: 'en',
          createdAt: today,
          preferences: {
            difficulty: 'gradual',
            subjects: { mathematics: true, science: true, technology: false, engineering: true },
            reminders: true,
            achievementsNotify: true,
            weeklyReports: false
          },
          stats: {
            points: 2450,
            gamesCompleted: 3,
            badgesEarned: 3,
            daysActive: 12,
            streak: 3,
            timeSpentSeconds: 1800,
            lastSession: today
          },
          gameHistory: [
            { game: 'Fraction Adventure', subject: 'Mathematics', score: 80, accuracy: 90, durationSec: 420, completed: true, date: shiftDays(-6) },
            { game: 'Math Puzzle Box', subject: 'Mathematics', score: 100, accuracy: 100, durationSec: 300, completed: true, date: shiftDays(-4) },
            { game: 'Algebra Quest', subject: 'Mathematics', score: 65, accuracy: 70, durationSec: 540, completed: false, date: shiftDays(-1) }
          ],
          badges: [
            { id: 'math-master', name: 'Math Master', blurb: 'Completed 10 algebra problems', date: shiftDays(-6) },
            { id: 'speed-learner', name: 'Speed Learner', blurb: 'Finished a game in record time', date: shiftDays(-4) },
            { id: 'perfect-score', name: 'Perfect Score', blurb: 'Got 100% on a math quiz', date: shiftDays(-4) }
          ]
        }
      },
      sessions: [],
      goals: null
    };
  }

  function shiftDays(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString();
  }

  // ---------------------------------------------------------------------------
  // Storage helpers
  // ---------------------------------------------------------------------------
  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.users) return parsed;
      }
    } catch (e) { /* corrupted store - reseed below */ }
    var fresh = seedData();
    saveStore(fresh);
    return fresh;
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      // Storage full or unavailable
      console.error('STEM Quest: could not save data', e);
    }
  }

  var store = loadStore();

  function persist() {
    saveStore(store);
  }

  // ---------------------------------------------------------------------------
  // Current user session management (sessionStorage survives per-tab)
  // ---------------------------------------------------------------------------
  function getCurrentUserId() {
    try {
      return sessionStorage.getItem('stemquest_current_user');
    } catch (e) {
      return null;
    }
  }

  function setCurrentUserId(id, remember) {
    try {
      sessionStorage.setItem('stemquest_current_user', id);
      if (remember) {
        localStorage.setItem('stemquest_remember_user', id);
      }
    } catch (e) { /* ignore */ }
  }

  function getRememberedUser() {
    try {
      return localStorage.getItem('stemquest_remember_user');
    } catch (e) {
      return null;
    }
  }

  function currentUser() {
    var id = getCurrentUserId();
    if (!id) return null;
    return store.users[id] || null;
  }

  function isLoggedIn() {
    return !!getCurrentUserId() && !!store.users[getCurrentUserId()];
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  var AppStore = {
    // --- account management -------------------------------------------------
    isLoggedIn: isLoggedIn,
    currentUser: currentUser,

    login: function (username, password) {
      var key = username.trim().toLowerCase();
      var user = store.users[key];
      if (!user) return { ok: false, error: 'No account found with that username.' };
      if (user.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' };
      setCurrentUserId(user.id, false);
      user.stats.lastSession = new Date().toISOString();
      persist();
      return { ok: true, user: user };
    },

    register: function (username, displayName, password) {
      var key = username.trim().toLowerCase();
      if (!key) return { ok: false, error: 'Username is required.' };
      if (store.users[key]) return { ok: false, error: 'That username is already taken.' };
      if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

      var user = {
        id: key,
        username: key,
        password: password,
        displayName: displayName || key,
        grade: 6,
        school: '',
        studentId: 'STU' + Math.floor(1000 + Math.random() * 9000),
        avatar: null,
        language: 'en',
        createdAt: new Date().toISOString(),
        preferences: {
          difficulty: 'gradual',
          subjects: { mathematics: true, science: true, technology: false, engineering: false },
          reminders: true,
          achievementsNotify: true,
          weeklyReports: false
        },
        stats: {
          points: 0,
          gamesCompleted: 0,
          badgesEarned: 0,
          daysActive: 1,
          streak: 1,
          timeSpentSeconds: 0,
          lastSession: new Date().toISOString()
        },
        gameHistory: [],
        badges: []
      };
      store.users[key] = user;
      setCurrentUserId(key, false);
      persist();
      return { ok: true, user: user };
    },

    signOut: function () {
      try {
        sessionStorage.removeItem('stemquest_current_user');
      } catch (e) { /* ignore */ }
    },

    rememberCurrentUser: function (value) {
      try {
        if (value) localStorage.setItem('stemquest_remember_user', value);
        else localStorage.removeItem('stemquest_remember_user');
      } catch (e) { /* ignore */ }
    },

    getRememberedUser: getRememberedUser,

    changePassword: function (current, next) {
      var user = currentUser();
      if (!user) return { ok: false, error: 'Not signed in.' };
      if (user.password !== current) return { ok: false, error: 'Current password is incorrect.' };
      if (next.length < 6) return { ok: false, error: 'New password must be at least 6 characters.' };
      user.password = next;
      persist();
      return { ok: true };
    },

    // --- profile -------------------------------------------------------------
    updateProfile: function (fields) {
      var user = currentUser();
      if (!user) return false;
      if (fields.displayName) user.displayName = fields.displayName;
      if (fields.grade) user.grade = parseInt(fields.grade, 10) || user.grade;
      if (typeof fields.school === 'string') user.school = fields.school;
      if (fields.language) {
        user.language = fields.language;
        user.preferences.language = fields.language;
        try { localStorage.setItem('stemquest_language', fields.language); } catch (e) {}
      }
      persist();
      return true;
    },

    setAvatar: function (avatar) {
      var user = currentUser();
      if (!user) return;
      user.avatar = avatar;
      persist();
    },

    updatePreferences: function (prefs) {
      var user = currentUser();
      if (!user) return;
      Object.keys(prefs).forEach(function (k) {
        user.preferences[k] = prefs[k];
      });
      persist();
    },

    // --- game & progress -----------------------------------------------------
    recordGameResult: function (gameResult) {
      var user = currentUser();
      if (!user) return;
      if (!user.gameHistory) user.gameHistory = [];
      if (!user.stats) user.stats = { points: 0, gamesCompleted: 0, badgesEarned: 0, daysActive: 1, streak: 1, timeSpentSeconds: 0 };

      user.gameHistory.push({
        game: gameResult.game || 'Math Challenge',
        subject: gameResult.subject || 'Mathematics',
        score: gameResult.score || 0,
        accuracy: gameResult.accuracy || 0,
        durationSec: gameResult.durationSec || 0,
        completed: !!gameResult.completed,
        date: new Date().toISOString()
      });

      user.stats.points += gameResult.score || 0;
      user.stats.timeSpentSeconds += gameResult.durationSec || 0;
      if (gameResult.completed) user.stats.gamesCompleted = (user.stats.gamesCompleted || 0) + 1;
      user.stats.lastSession = new Date().toISOString();
      user.badges = user.badges || [];

      // Award milestone badges automatically
      var totalGames = user.gameHistory.length;
      if (totalGames === 1 && !hasBadge(user, 'first-steps')) {
        user.badges.push({ id: 'first-steps', name: 'First Steps', blurb: 'Played your very first game', date: new Date().toISOString() });
      }
      if (totalGames === 5 && !hasBadge(user, 'math-explorer')) {
        user.badges.push({ id: 'math-explorer', name: 'Math Explorer', blurb: 'Completed 5 math games', date: new Date().toISOString() });
      }
      if ((user.stats.gamesCompleted || 0) >= 10 && !hasBadge(user, 'math-master')) {
        user.badges.push({ id: 'math-master', name: 'Math Master', blurb: 'Completed 10 math games', date: new Date().toISOString() });
      }
      user.stats.badgesEarned = user.badges.length;

      persist();
      return user.badges[user.badges.length - 1] || null;
    },

    setGoal: function (goal) {
      store.goals = goal;
      persist();
    },

    getGoal: function () {
      return store.goals;
    },

    // --- computed stats ------------------------------------------------------
    totalPoints: function () {
      var u = currentUser();
      return u ? (u.stats ? u.stats.points : 0) : 0;
    },

    gamesCompletedCount: function () {
      var u = currentUser();
      return u ? (u.stats ? u.stats.gamesCompleted : 0) : 0;
    },

    badgesEarnedCount: function () {
      var u = currentUser();
      return u ? (u.stats ? u.stats.badgesEarned : 0) : 0;
    },

    timeSpentFormatted: function () {
      var u = currentUser();
      var secs = u ? (u.stats ? u.stats.timeSpentSeconds : 0) : 0;
      var h = Math.floor(secs / 3600);
      var m = Math.floor((secs % 3600) / 60);
      if (h > 0) return h + 'h ' + m + 'm';
      return m + 'm';
    },

    recentAchievements: function () {
      var u = currentUser();
      return u && u.badges ? u.badges.slice(-3).reverse() : [];
    },

    subjectProgress: function () {
      // Simple heuristic based on game history by subject
      var u = currentUser();
      var result = { Mathematics: 0, Science: 0, Technology: 0, Engineering: 0 };
      if (!u || !u.gameHistory || u.gameHistory.length === 0) return result;
      var bySubject = {};
      u.gameHistory.forEach(function (g) {
        bySubject[g.subject] = bySubject[g.subject] || [];
        bySubject[g.subject].push(g.accuracy || 0);
      });
      Object.keys(bySubject).forEach(function (s) {
        var arr = bySubject[s];
        var avg = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
        result[s] = Math.round(avg);
      });
      return result;
    }
  };

  function hasBadge(user, id) {
    return (user.badges || []).some(function (b) { return b.id === id; });
  }

  global.STEMQUEST_STORE = AppStore;

})(window);
