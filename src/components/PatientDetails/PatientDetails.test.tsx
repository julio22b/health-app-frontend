import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { navigateMock, toastMock } from '@/test/setup';
import { ROUTES } from '@/routes';
import { parseDateOnly } from '@/lib/utils';
import { makeConsultation, makePatient } from '@/test/fixtures';
import api from '@/api/axiosInstance';
import PatientDetails from './PatientDetails';

const renderPatientDetails = () =>
    renderWithProviders(<PatientDetails />, {
        route: ROUTES.PATIENT_DETAILS,
        initialEntries: ['/patients/1'],
    });

describe('PatientDetails', () => {
    it('shows a full-page loader while the patient is being fetched', async () => {
        vi.mocked(api.get).mockImplementationOnce(() => new Promise(() => {}));
        renderPatientDetails();
        expect(await screen.findByText('Loading...')).toBeInTheDocument();
    });

    it('shows NotFound when the fetch fails', async () => {
        vi.mocked(api.get).mockRejectedValueOnce({
            isAxiosError: true,
            message: 'Request failed',
            response: { data: { error: 'Not found' } },
        });
        renderPatientDetails();
        expect(await screen.findByText('No patient found')).toBeInTheDocument();
    });

    it('renders the patient summary once loaded', async () => {
        const patient = makePatient();
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patient } });
        const { container } = renderPatientDetails();

        await screen.findByText(patient.name);

        const formattedDOB = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(parseDateOnly(patient.date_of_birth));

        expect(container.textContent).toContain('Female');
        expect(container.textContent).toContain(formattedDOB);

        const visitsLabel = screen.getByText('VISITS');
        expect(visitsLabel.previousElementSibling).toHaveTextContent('0');

        const lastVisitLabel = screen.getByText('LAST VISIT');
        expect(lastVisitLabel.previousElementSibling).toHaveTextContent('Never');

        expect(screen.getByText('No consultations yet')).toBeInTheDocument();
    });

    it('shows the formatted last visit date when present', async () => {
        const patient = makePatient({ last_visit: '2024-03-05T12:00:00.000Z' });
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patient } });
        renderPatientDetails();
        await screen.findByText(patient.name);

        const expected = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
            new Date(patient.last_visit!),
        );
        const lastVisitLabel = screen.getByText('LAST VISIT');
        expect(lastVisitLabel.previousElementSibling).toHaveTextContent(expected);
    });

    it('renders a consultation card for each consultation', async () => {
        const consultation = makeConsultation({ status: 'COMPLETED' });
        const patient = makePatient({ consultations: [consultation] });
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patient } });
        renderPatientDetails();

        await screen.findByText(patient.name);
        expect(screen.getByText('No document generated for this visit')).toBeInTheDocument();
    });

    it('deletes the patient on confirm, shows a toast, and navigates back', async () => {
        const patient = makePatient();
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patient } });
        vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
        const user = userEvent.setup();
        renderPatientDetails();
        await screen.findByText(patient.name);

        await user.click(screen.getByRole('button', { name: 'Delete patient' }));

        await user.click(await screen.findByRole('button', { name: 'Delete' }));

        await waitFor(() => expect(api.patch).toHaveBeenCalledWith(`/patients/${patient.id}`));
        expect(toastMock.success).toHaveBeenCalledWith('Patient deleted');
        expect(navigateMock).toHaveBeenCalledWith(-1);
    });

    it('shows an error toast and does not navigate when deletion fails', async () => {
        const patient = makePatient();
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patient } });
        vi.mocked(api.patch).mockRejectedValueOnce({
            isAxiosError: true,
            message: 'Request failed',
            response: { data: { error: 'Server error' } },
        });
        const user = userEvent.setup();
        renderPatientDetails();
        await screen.findByText(patient.name);

        await user.click(screen.getByRole('button', { name: 'Delete patient' }));
        await user.click(await screen.findByRole('button', { name: 'Delete' }));

        await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('Error deleting patient'));
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('navigates to the edit page with patientToEdit state', async () => {
        const patient = makePatient();
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patient } });
        const user = userEvent.setup();
        renderPatientDetails();
        await screen.findByText(patient.name);

        await user.click(screen.getByRole('button', { name: 'Edit patient' }));

        expect(navigateMock).toHaveBeenCalledWith(ROUTES.PATIENTS_EDIT.replace(':id', String(patient.id)), {
            state: { patientToEdit: patient },
        });
    });

    it('navigates to record a new visit with patient state', async () => {
        const patient = makePatient();
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patient } });
        const user = userEvent.setup();
        renderPatientDetails();
        await screen.findByText(patient.name);

        await user.click(screen.getByRole('button', { name: /record visit/i }));

        expect(navigateMock).toHaveBeenCalledWith(
            ROUTES.CONSULTATION_NEW_EXISTING_PATIENT.replace(':id', String(patient.id)),
            { state: { patient } },
        );
    });
});
