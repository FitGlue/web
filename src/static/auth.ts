import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';

// --- Configuration ---
// We fetch the configuration from the Firebase Hosting reserved URL.
// This allows the same build artifact to be deployed to different Firebase projects (dev/test/prod)
// without rebuilding, as the hosting server provides the correct config for its environment.

async function getFirebaseConfig() {
  try {
    const response = await fetch('/__/firebase/init.json');
    if (!response.ok) throw new Error('Failed to fetch firebase config');
    return await response.json();
  } catch (e) {
    // Fallback for local development without 'firebase serve'
    console.error('Could not load Firebase config. Ensure you are running via "firebase serve" or "firebase emulators:start".');

    // Show a visible error to the user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff4444;color:white;padding:1rem;text-align:center;z-index:9999;';
    errorDiv.innerText = 'System Error: Could not load application configuration.';
    document.body.appendChild(errorDiv);

    return null;
  }
}

// --- Helper: Show error/success messages ---
function showMessage(elementId: string, message: string, isError = true) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
    el.className = `auth-message ${isError ? 'error' : 'success'}`;
  }
}

function hideMessage(elementId: string) {
  const el = document.getElementById(elementId);
  if (el) {
    el.style.display = 'none';
  }
}

// --- Helper: Check if email verification is required (30-day grace period) ---
async function shouldEnforceEmailVerification(user: User): Promise<boolean> {
  // Google OAuth users are automatically verified
  if (user.providerData.some(p => p.providerId === 'google.com')) {
    return false;
  }

  // If already verified, no enforcement needed
  if (user.emailVerified) {
    return false;
  }

  // Check account age from Firestore
  try {
    const response = await fetch(`/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${await user.getIdToken()}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const createdAt = data.createdAt ? new Date(data.createdAt) : null;

      if (createdAt) {
        const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreation > 30;
      }
    }
  } catch (e) {
    console.error('Failed to check account age:', e);
  }

  // Default to grace period if we can't determine age
  return false;
}

async function init() {
  const config = await getFirebaseConfig();
  if (!config) return;

  const app = initializeApp(config);
  const auth = getAuth(app);

  // --- State Observer & Protection ---
  onAuthStateChanged(auth, async (user: User | null) => {
    const path = window.location.pathname;
    const isAuthPage = path.includes('login') || path.includes('register');
    const isVerifyPage = path.includes('verify-email');
    const isLogoutPage = path.includes('logout');
    const isAppPage = path.includes('app') || path.includes('dashboard');

    // Define clean redirects
    const LOGIN_URL = '/login';
    const APP_URL = '/app';
    const VERIFY_EMAIL_URL = '/verify-email';

    if (user) {
      console.log('User is logged in:', user.uid);

      // Check email verification enforcement
      const mustVerify = await shouldEnforceEmailVerification(user);

      if (mustVerify && !isVerifyPage && !isLogoutPage) {
        // User must verify email before accessing app
        window.location.href = VERIFY_EMAIL_URL;
        return;
      }

      // Redirect authenticated users away from auth pages
      if (isAuthPage && !isVerifyPage) {
        window.location.href = APP_URL;
      }

      // Update Homepage Nav
      const landingNav = document.getElementById('landing-nav');
      if (landingNav) {
        landingNav.innerHTML = `<a href="${APP_URL}" class="btn primary small">Dashboard</a>`;
      }

      // Handle verify-email page state
      if (isVerifyPage) {
        const userEmailEl = document.getElementById('user-email');
        if (userEmailEl) {
          userEmailEl.textContent = user.email || '';
        }

        // Show appropriate verification state
        if (mustVerify) {
          document.getElementById('verification-pending')!.style.display = 'none';
          document.getElementById('verification-required')!.style.display = 'block';
        } else {
          document.getElementById('verification-pending')!.style.display = 'block';
          document.getElementById('verification-required')!.style.display = 'none';
        }
      }
    } else {
      console.log('User is logged out');

      // Redirect unauthenticated users from app pages
      if (isAppPage) {
        window.location.href = LOGIN_URL;
      }

      // Handle logout page
      if (isLogoutPage) {
        setTimeout(() => {
          window.location.href = LOGIN_URL;
        }, 2000);
      }

      // Update Homepage Nav (Restore)
      const landingNav = document.getElementById('landing-nav');
      if (landingNav) {
        landingNav.innerHTML = `
            <a href="/login" class="nav-link">Login</a>
            <a href="/register" class="btn primary small">Sign Up</a>
        `;
      }
    }
  });

  // --- UI bindings ---
  const bindClick = (id: string, handler: () => void) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', handler);
  };

  // Google Login
  bindClick('btn-login-google', async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirect happens in onAuthStateChanged
    } catch (error) {
      console.error('Google Sign-in Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Google sign-in failed');
    }
  });

  // Google Register (same as login for OAuth)
  bindClick('btn-register-google', async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirect happens in onAuthStateChanged
    } catch (error) {
      console.error('Google Sign-up Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Google sign-up failed');
    }
  });

  // Apple Login
  bindClick('btn-login-apple', async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Apple Sign-in Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Apple sign-in failed');
    }
  });

  // Apple Register
  bindClick('btn-register-apple', async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Apple Sign-up Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Apple sign-up failed');
    }
  });

  // Facebook Login
  bindClick('btn-login-facebook', async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Facebook Sign-in Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Facebook sign-in failed');
    }
  });

  // Facebook Register
  bindClick('btn-register-facebook', async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Facebook Sign-up Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Facebook sign-up failed');
    }
  });

  // Email/Pass Login
  bindClick('btn-login-email', async () => {
    hideMessage('auth-error');
    const emailEl = document.getElementById('email') as HTMLInputElement;
    const passEl = document.getElementById('password') as HTMLInputElement;
    if (!emailEl?.value || !passEl?.value) {
      showMessage('auth-error', 'Please fill in all fields');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, emailEl.value, passEl.value);
    } catch (error: unknown) {
      console.error('Login Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Login failed');
    }
  });

  // Register
  bindClick('btn-register', async () => {
    hideMessage('auth-error');
    const emailEl = document.getElementById('reg-email') as HTMLInputElement;
    const passEl = document.getElementById('reg-password') as HTMLInputElement;
    if (!emailEl?.value || !passEl?.value) {
      showMessage('auth-error', 'Please fill in all fields');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailEl.value, passEl.value);

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Redirect to verification page
      window.location.href = '/verify-email';
    } catch (error: unknown) {
      console.error('Registration Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Registration failed');
    }
  });

  // Forgot Password
  bindClick('btn-forgot-password', async () => {
    hideMessage('auth-error');
    hideMessage('auth-success');
    const emailEl = document.getElementById('forgot-email') as HTMLInputElement;
    if (!emailEl?.value) {
      showMessage('auth-error', 'Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailEl.value);
      showMessage('auth-success', 'Password reset email sent! Check your inbox.', false);
      emailEl.value = '';
    } catch (error: unknown) {
      console.error('Password Reset Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Failed to send reset email');
    }
  });

  // Resend Verification Email
  const handleResendVerification = async () => {
    hideMessage('auth-error');
    hideMessage('auth-success');
    const user = auth.currentUser;
    if (!user) return;

    try {
      await sendEmailVerification(user);
      showMessage('auth-success', 'Verification email sent! Check your inbox.', false);
    } catch (error: unknown) {
      console.error('Resend Verification Error', error);
      showMessage('auth-error', error instanceof Error ? error.message : 'Failed to send verification email');
    }
  };

  bindClick('btn-resend-verification', handleResendVerification);
  bindClick('btn-resend-verification-required', handleResendVerification);

  // Continue to App (from verify-email page)
  bindClick('btn-continue-app', () => {
    window.location.href = '/app';
  });

  // Logout from verify-email page
  bindClick('btn-logout-verify', async () => {
    try {
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout Error', error);
    }
  });

  // Logout (general)
  bindClick('btn-logout', async () => {
    try {
      await signOut(auth);
      window.location.href = '/logout';
    } catch (error) {
      console.error('Logout Error', error);
    }
  });

  // Handle logout page - sign out immediately
  if (window.location.pathname.includes('logout')) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error', error);
    }
  }
}

// Start
init();
