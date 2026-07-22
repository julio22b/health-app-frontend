import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/api/axiosInstance';
import authReducer, { logIn, logOut } from './authSlice';
import { createTestStore } from '@/test/test-utils';
import { makeDoctor } from '@/test/fixtures';

describe('authSlice', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('initial state', () => {
        it('derives isLoggedIn/token from localStorage when a token is present', async () => {
            localStorage.setItem('token', 'abc123');
            vi.resetModules();
            const { default: freshAuthReducer } = await import('./authSlice');
            const state = freshAuthReducer(undefined, { type: '@@INIT' });
            expect(state.isLoggedIn).toBe(true);
            expect(state.token).toBe('abc123');
        });

        it('defaults to logged out when there is no token', async () => {
            vi.resetModules();
            const { default: freshAuthReducer } = await import('./authSlice');
            const state = freshAuthReducer(undefined, { type: '@@INIT' });
            expect(state.isLoggedIn).toBe(false);
            expect(state.token).toBe('');
        });
    });

    describe('logOut', () => {
        it('resets state to logged out and clears the stored token', () => {
            localStorage.setItem('token', 'abc123');
            const preState = {
                isLoggedIn: true,
                doctor: makeDoctor(),
                error: null,
                loading: false,
                token: 'abc123',
            };

            const state = authReducer(preState, logOut());

            expect(state).toEqual({ isLoggedIn: false, doctor: null, error: null, loading: false, token: '' });
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('logIn reducer transitions', () => {
        it('sets loading on pending', () => {
            const state = authReducer(undefined, { type: logIn.pending.type });
            expect(state.loading).toBe(true);
        });

        it('on fulfilled: logs in, stores the doctor/token, and persists the token', () => {
            const payload = {
                token: 'new-token',
                message: 'ok',
                doctor: makeDoctor(),
            };

            const state = authReducer(undefined, { type: logIn.fulfilled.type, payload });

            expect(state.loading).toBe(false);
            expect(state.isLoggedIn).toBe(true);
            expect(state.doctor).toEqual(payload.doctor);
            expect(state.token).toBe('new-token');
            expect(localStorage.getItem('token')).toBe('new-token');
        });

        it('on rejected: stores the error and clears loading', () => {
            const state = authReducer(undefined, { type: logIn.rejected.type, payload: 'Invalid credentials' });
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Invalid credentials');
        });
    });

    describe('logIn thunk', () => {
        it('posts the credentials to /auth/login and updates the store on success', async () => {
            vi.mocked(api.post).mockResolvedValueOnce({
                data: {
                    token: 'server-token',
                    message: 'ok',
                    doctor: makeDoctor(),
                },
            });

            const store = createTestStore();
            await store.dispatch(logIn({ username: 'test', password: 'test' }));

            expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'test', password: 'test' });
            expect(store.getState().auth.isLoggedIn).toBe(true);
            expect(store.getState().auth.token).toBe('server-token');
        });

        it('stores the rejection message on failure', async () => {
            vi.mocked(api.post).mockRejectedValueOnce({
                isAxiosError: true,
                message: 'Request failed',
                response: { data: { error: 'Invalid credentials' } },
            });

            const store = createTestStore();
            await store.dispatch(logIn({ username: 'test', password: 'wrong' }));

            expect(store.getState().auth.isLoggedIn).toBe(false);
            expect(store.getState().auth.error).toBe('Invalid credentials');
        });
    });
});
