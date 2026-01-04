import { client } from '../shared/api/client';

async function submitWaitlist() {
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const honeypotInput = document.getElementById('website_url') as HTMLInputElement;
  const btn = document.getElementById('btn-join') as HTMLButtonElement;
  const errorDiv = document.getElementById('error-message')!;
  const formDiv = document.getElementById('waitlist-form')!;
  const successDiv = document.getElementById('success-message')!;

  if (!emailInput?.value) {
    showError('Please enter your email.');
    return;
  }

  const payload = {
    email: emailInput.value,
    website_url: honeypotInput?.value
  };

  try {
    setLoading(true);
    const { response, error } = await client.POST('/waitlist', {
      body: payload
    });

    if (error) {
      if (response.status === 409) {
        showSuccess("You're already on the list!");
      } else {
        showError('Something went wrong. Please try again.');
      }
    } else {
      showSuccess("You're on the list!");
    }

  } catch (e) {
    console.error(e);
    showError('Network error. Please try again later.');
  } finally {
    setLoading(false);
  }

  function setLoading(isLoading: boolean) {
    if (btn) {
      btn.disabled = isLoading;
      btn.innerText = isLoading ? 'Joining...' : 'Join Waitlist';
    }
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
