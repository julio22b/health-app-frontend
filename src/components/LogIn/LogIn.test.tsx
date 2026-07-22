import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { navigateMock } from '@/test/setup';
import { ROUTES } from '@/routes';
import { makeDoctor } from '@/test/fixtures';
import api from '@/api/axiosInstance';
import LogIn from './LogIn';

const doctor = makeDoctor();

describe('LogIn', () => {
    it('renders with the default test credentials prefilled', () => {
        renderWithProviders(<LogIn />);
        expect(screen.getByLabelText('Username')).toHaveValue('test');
        expect(screen.getByLabelText('Password')).toHaveValue('test');
    });

    it('lets the user type into the username and password fields', async () => {
        const user = userEvent.setup();
        renderWithProviders(<LogIn />);

        const username = screen.getByLabelText('Username');
        await user.clear(username);
        await user.type(username, 'doctor1');
        expect(username).toHaveValue('doctor1');
    });

    it('toggles password visibility', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<LogIn />);

        const password = screen.getByLabelText('Password');
        expect(password).toHaveAttribute('type', 'password');

        const toggleButton = container.querySelector('button[type="button"]');
        expect(toggleButton).not.toBeNull();
        await user.click(toggleButton!);

        expect(password).toHaveAttribute('type', 'text');
    });

    it('navigates to /patients on successful login', async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ data: { token: 'server-token', message: 'ok', doctor } });
        const user = userEvent.setup();
        renderWithProviders(<LogIn />);

        await user.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(ROUTES.PATIENTS));
        expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'test', password: 'test' });
    });

    it('shows an error and does not navigate when login fails', async () => {
        vi.mocked(api.post).mockRejectedValueOnce({
            isAxiosError: true,
            message: 'Request failed',
            response: { data: { error: 'Invalid credentials' } },
        });
        const user = userEvent.setup();
        renderWithProviders(<LogIn />);

        await user.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('shows a spinner instead of the arrow icon while the login request is pending', async () => {
        let resolvePost!: (value: unknown) => void;
        vi.mocked(api.post).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolvePost = resolve;
                }),
        );
        const user = userEvent.setup();
        renderWithProviders(<LogIn />);

        await user.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByRole('status', { name: 'Loading' })).toBeInTheDocument();

        resolvePost({ data: { token: 'server-token', message: 'ok', doctor } });
        await waitFor(() => expect(navigateMock).toHaveBeenCalled());
    });
});
