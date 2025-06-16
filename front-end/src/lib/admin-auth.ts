// Admin authentication utilities

export const isAdminAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('admin_token');
    return !!token;
};

export const getAdminToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
};

export const clearAdminAuth = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_token');
};

export const setAdminToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_token', token);
};
