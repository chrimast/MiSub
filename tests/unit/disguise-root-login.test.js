import { describe, expect, it, vi } from 'vitest';
import { handleDisguiseRequest } from '../../functions/modules/handlers/disguise-handler.js';

vi.mock('../../functions/modules/auth-middleware.js', () => ({
    authMiddleware: vi.fn(async () => false),
}));

function context(pathname) {
    return {
        request: new Request(`https://sub.example.com${pathname}`),
        env: {},
    };
}

const disguisedSettings = {
    disguise: { enabled: true, pageType: 'default' },
    enablePublicPage: false,
};

describe('homepage is login, not disguise 404', () => {
    it('does not disguise / when the login path is still /login', async () => {
        const response = await handleDisguiseRequest(context('/'), disguisedSettings);
        expect(response).toBeNull();
    });

    it('does not disguise /login when it is the real login path', async () => {
        const response = await handleDisguiseRequest(context('/login'), disguisedSettings);
        expect(response).toBeNull();
    });

    it('still disguises protected SPA routes for anonymous browsers', async () => {
        const response = await handleDisguiseRequest(context('/dashboard'), disguisedSettings);
        expect(response).not.toBeNull();
        expect(response.status).toBe(404);
        expect(await response.text()).toContain('404 Not Found');
    });

    it('still disguises / when a custom login path is configured', async () => {
        const response = await handleDisguiseRequest(context('/'), {
            ...disguisedSettings,
            customLoginPath: 'hidden-admin',
        });
        expect(response).not.toBeNull();
        expect(response.status).toBe(404);
    });

    it('allows the custom login path through', async () => {
        const response = await handleDisguiseRequest(context('/hidden-admin'), {
            ...disguisedSettings,
            customLoginPath: 'hidden-admin',
        });
        expect(response).toBeNull();
    });
});
