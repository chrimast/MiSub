import { describe, expect, it } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';

async function mountHome({ sessionState, enablePublicPage, path = '/' }) {
    const pinia = createPinia();
    setActivePinia(pinia);
    const { useSessionStore } = await import('../../src/stores/session.js');
    const session = useSessionStore();
    session.sessionState = sessionState;
    session.publicConfig = {
        ...session.publicConfig,
        enablePublicPage,
    };

    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: { template: '<div />' } },
            { path: '/login', component: { template: '<div>login</div>' } },
            { path: '/dashboard', component: { template: '<div>dashboard</div>' } },
            { path: '/explore', component: { template: '<div />' } },
        ],
    });
    await router.push(path);
    await router.isReady();

    const HomeView = (await import('../../src/views/HomeView.vue')).default;
    const wrapper = mount(HomeView, { global: { plugins: [pinia, router] } });
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { wrapper, router };
}

describe('HomeView site entry', () => {
    it('sends logged-out visitors to /login when the public page is off', async () => {
        const { wrapper, router } = await mountHome({
            sessionState: 'loggedOut',
            enablePublicPage: false,
        });
        expect(router.currentRoute.value.path).toBe('/login');
        wrapper.unmount();
    });

    it('keeps visitors on / when the public page is enabled', async () => {
        const { wrapper, router } = await mountHome({
            sessionState: 'loggedOut',
            enablePublicPage: true,
        });
        expect(router.currentRoute.value.path).toBe('/');
        wrapper.unmount();
    });
});
