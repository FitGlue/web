import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import createClient from 'openapi-fetch';
import type { paths, components } from './shared/api/schema';

// --- Client Setup ---
const client = createClient<paths>({ baseUrl: '/api' });

// --- Config ---
async function getFirebaseConfig() {
  try {
    const response = await fetch('/__/firebase/init.json');
    if (!response.ok) throw new Error('Failed to fetch firebase config');
    return await response.json();
  } catch (e) {
    console.error('Config fetch failed', e);
    return null;
  }
}

async function init() {
  const config = await getFirebaseConfig();
  if (!config) return;

  const app = initializeApp(config);
  const auth = getAuth(app);

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/login.html';
    } else {
      loadInputs(user);
    }
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => window.location.href = '/login.html');
    });
  }
}

type PendingInput = components['schemas']['PendingInput'];

async function loadInputs(user: User) {
  const listEl = document.getElementById('inputs-list');
  const loadingEl = document.getElementById('loading');
  if (!listEl || !loadingEl) return;

  loadingEl.style.display = 'block';
  listEl.innerHTML = '';

  try {
    const token = await user.getIdToken();

    // Use generated client
    const { data, error } = await client.GET('/inputs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (error) {
      throw new Error(`API Error: ${error}`);
    }

    const inputs: PendingInput[] = data?.inputs || [];

    loadingEl.style.display = 'none';

    if (inputs.length === 0) {
      listEl.innerHTML = '<p>No pending inputs.</p>';
      return;
    }

    inputs.forEach(input => {
      const card = document.createElement('div');
      card.className = 'input-card';

      const title = document.createElement('h3');
      title.innerText = `Activity: ${input.activityId}`; // Note: schema says activity_id, verify logic maps id->activity_id
      card.appendChild(title);

      const meta = document.createElement('p');
      meta.style.fontSize = '0.8rem';
      meta.style.color = '#666';

      const createdAt = input.createdAt ? new Date(input.createdAt) : new Date();
      meta.innerText = `Created: ${createdAt.toLocaleString()}`;
      card.appendChild(meta);

      // Form
      const form = document.createElement('div');
      form.className = 'input-form';

      const fieldInputs: Record<string, HTMLInputElement | HTMLTextAreaElement> = {};

      if (!input.requiredFields) {
        // If there's no required fields, then this is a dodgy pending_inputs request and we should ignore it
        return;
      }

      input.requiredFields.forEach(field => {
        const label = document.createElement('label');
        label.innerText = field.charAt(0).toUpperCase() + field.slice(1);
        form.appendChild(label);

        const inp = document.createElement(field === 'description' ? 'textarea' : 'input');
        inp.name = field;
        inp.placeholder = `Enter ${field}...`;
        form.appendChild(inp);
        fieldInputs[field] = inp as HTMLInputElement | HTMLTextAreaElement;
      });

      const btn = document.createElement('button');
      btn.className = 'btn-resolve';
      btn.innerText = 'Resolve & Process';
      btn.onclick = async () => {
        btn.disabled = true;
        btn.innerText = 'Processing...';

        const inputData: Record<string, string> = {};
        for (const [key, el] of Object.entries(fieldInputs)) {
          inputData[key] = el.value;
        }

        try {
          await resolveInput(user, input.activityId, inputData); // Use activity_id from schema
          card.remove();
          if (listEl.children.length === 0) {
            listEl.innerHTML = '<p>No pending inputs.</p>';
          }
        } catch (err: unknown) {
          alert('Failed to resolve: ' + (err instanceof Error ? err.message : err));
          btn.disabled = false;
          btn.innerText = 'Resolve & Process';
        }
      };

      form.appendChild(btn);
      card.appendChild(form);
      listEl.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    loadingEl.style.display = 'none';
    listEl.innerHTML = `<p style="color:red">Error loading inputs.</p>`;
  }
}

async function resolveInput(user: User, activityId: string, inputData: Record<string, string>) {
  const token = await user.getIdToken();

  const { error } = await client.POST('/inputs', {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: {
      activityId: activityId,
      inputData: inputData
    }
  });

  if (error) {
    // openapi-fetch errors are typed.
    throw new Error('Failed to resolve input');
  }
}

init();
