import Cookies from 'js-cookie';

/**
 * Universal fetch wrapper that automatically injects the Bearer auth token.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = Cookies.get('token');

    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
        ...options,
        headers,
    });

    return response;
}
