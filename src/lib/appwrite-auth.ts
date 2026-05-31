import { Account, Client } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';

export function createAppwriteAuthClient() {
  const client = new Client();
  client.setEndpoint(endpoint);
  client.setProject(project);
  return client;
}

export function getAppwriteAccount() {
  return new Account(createAppwriteAuthClient());
}

export async function getCurrentSession() {
  try {
    const account = getAppwriteAccount();
    const session = await account.getSession('current');
    return session;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const account = getAppwriteAccount();
    const user = await account.get();
    return user;
  } catch (error) {
    return null;
  }
}

export async function loginWithGoogle(successUrl: string, failureUrl = successUrl) {
  const account = getAppwriteAccount();
  const response = await account.createOAuth2Session('google', successUrl, failureUrl);
  return response;
}

export async function logout() {
  try {
    const account = getAppwriteAccount();
    await account.deleteSession('current');
    return true;
  } catch (error) {
    return false;
  }
}

export function getAppwriteFallbackHeaders(): HeadersInit {
  if (typeof window === 'undefined') {
    return {};
  }

  const fallbackCookies = window.localStorage.getItem('cookieFallback');
  return fallbackCookies ? { 'X-Fallback-Cookies': fallbackCookies } : {};
}
