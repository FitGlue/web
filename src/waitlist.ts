const API_ENDPOINT = '/api/waitlist';

async function submitWaitlist() {
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const honeypotInput = document.getElementById('website_url') as HTMLInputElement;
  const btn = document.getElementById('btn-join') as HTMLButtonElement;
  const errorDiv = document.getElementById('error-message')!;
  const formDiv = document.getElementById('waitlist-form')!;
  const successDiv = document.getElementById('success-message')!;

  // Basic Client-side validation
  if (!emailInput.value) {
    showError('Please enter your email.');
    return;
  }

  // Prepare payload
  const payload = {
    email: emailInput.value,
    website_url: honeypotInput.value // Honeypot
  };

  try {
    setLoading(true);
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // 200 OK - default success message
      showSuccess("You're on the list!");
    } else if (response.status === 409) {
      // 409 Conflict - user already exists, treat as success but change text
      showSuccess("You're already on the list!");
    } else {
      const data = await response.json().catch(() => ({}));
      showError(data.error || 'Something went wrong. Please try again.');
    }

  } catch (e) {
    console.error(e);
    showError('Network error. Please try again later.');
  } finally {
    setLoading(false);
  }

  function setLoading(isLoading: boolean) {
    btn.disabled = isLoading;
    btn.innerText = isLoading ? 'Joining...' : 'Join Waitlist';
    errorDiv.style.display = 'none';
  }

  function showError(msg: string) {
    errorDiv.innerText = msg;
    errorDiv.style.display = 'block';
  }

  function showSuccess(title: string) {
    const titleEl = document.getElementById('success-title');
    if (titleEl) titleEl.innerText = title;
    formDiv.style.display = 'none';
    successDiv.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-join');
  if (btn) {
    btn.addEventListener('click', submitWaitlist);
  }
});
