const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:42069';

export type ServerSession = {
  auth: boolean;
  token: string;
  id: string;
  provider?: string;
};

export async function detectServer(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 800);

  try {
    const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function devOAuthLogin(): Promise<ServerSession> {
  const response = await fetch(`${API_URL}/account/oauth/dev`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'mixtape-dev',
      providerUserId: 'local-ui-user',
      displayName: 'Mixtape Listener',
      username: 'mixtape-listener',
    }),
  });

  if (!response.ok) {
    throw new Error('OAuth login failed');
  }

  return response.json();
}

export async function fetchServerAccount(token: string) {
  const response = await fetch(`${API_URL}/account/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Session expired');
  }

  return response.json();
}

export { API_URL };
