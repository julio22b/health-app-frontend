import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { navigateMock } from '@/test/setup';
import { ROUTES } from '@/routes';
import { makePatient } from '@/test/fixtures';
import api from '@/api/axiosInstance';
import Patients from './Patients';

describe('Patients', () => {
    it('fetches patients on mount', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patients: [] } });
        renderWithProviders(<Patients />);
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/patients'));
    });

    it('shows a loading message while the request is pending', async () => {
        vi.mocked(api.get).mockImplementationOnce(() => new Promise(() => {}));
        renderWithProviders(<Patients />);
        expect(await screen.findByText('Loading patients...')).toBeInTheDocument();
    });

    it('shows an error message when the request fails', async () => {
        vi.mocked(api.get).mockRejectedValueOnce({
            isAxiosError: true,
            message: 'Request failed',
            response: { data: { error: 'Could not load patients' } },
        });
        renderWithProviders(<Patients />);
        expect(await screen.findByText('Error: Could not load patients')).toBeInTheDocument();
    });

    it('shows "No patients yet." when the list is empty', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patients: [] } });
        renderWithProviders(<Patients />);
        expect(await screen.findByText('No patients yet.')).toBeInTheDocument();
    });

    it('renders the patient list with a count once fetched', async () => {
        const patients = [makePatient({ id: 1, name: 'Alice Smith' }), makePatient({ id: 2, name: 'Bob Jones' })];
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patients } });
        renderWithProviders(<Patients />);

        expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Jones')).toBeInTheDocument();
        expect(screen.getByText('2 patients')).toBeInTheDocument();
    });

    it('filters the list by search term (case-insensitive) after the debounce delay', async () => {
        const patients = [makePatient({ id: 1, name: 'Alice Smith' }), makePatient({ id: 2, name: 'Bob Jones' })];
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patients } });
        renderWithProviders(<Patients />);
        await screen.findByText('Alice Smith');

        fireEvent.change(screen.getByPlaceholderText('Search patient'), { target: { value: 'alice' } });

        await waitFor(() => expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument());
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('shows "No patients match your search." when the debounced search has no matches', async () => {
        const patients = [makePatient({ id: 1, name: 'Alice Smith' })];
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patients } });
        renderWithProviders(<Patients />);
        await screen.findByText('Alice Smith');

        fireEvent.change(screen.getByPlaceholderText('Search patient'), { target: { value: 'zzz' } });

        expect(await screen.findByText('No patients match your search.')).toBeInTheDocument();
        expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('logs out and navigates to /login', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patients: [] } });
        const user = userEvent.setup();
        const { store } = renderWithProviders(<Patients />, {
            preloadedState: { auth: { isLoggedIn: true, doctor: null, error: null, loading: false, token: 't' } },
        });

        await user.click(screen.getByRole('button', { name: /log out/i }));

        expect(store.getState().auth.isLoggedIn).toBe(false);
        expect(navigateMock).toHaveBeenCalledWith(ROUTES.LOGIN);
    });

    it('links "Add" and "Quick Record" to the expected routes', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patients: [] } });
        renderWithProviders(<Patients />);

        expect(screen.getByRole('link', { name: /add/i })).toHaveAttribute('href', ROUTES.PATIENTS_NEW);
        expect(screen.getByRole('link', { name: /quick record/i })).toHaveAttribute('href', ROUTES.CONSULTATION_NEW);
    });
});
