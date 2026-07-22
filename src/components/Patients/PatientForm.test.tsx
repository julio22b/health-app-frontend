import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { navigateMock, toastMock } from '@/test/setup';
import { getAgeFromDOB, getDOBFromAge } from '@/lib/utils';
import { makePatient } from '@/test/fixtures';
import api from '@/api/axiosInstance';
import PatientForm from './PatientForm';

describe('PatientForm (standalone)', () => {
    it('renders an empty "Add new patient" form when there is no patientToEdit', () => {
        renderWithProviders(<PatientForm />, { initialEntries: ['/patients/new'] });

        expect(screen.getByRole('heading', { name: 'Add new patient' })).toBeInTheDocument();
        expect(screen.getByLabelText(/^Name/)).toHaveValue('');
        expect(screen.getByLabelText(/Date of birth/i)).toHaveValue('');
    });

    it('renders a prefilled "Edit patient" form when a patientToEdit is passed via location state', () => {
        const patient = makePatient();
        renderWithProviders(<PatientForm />, {
            initialEntries: [{ pathname: '/patients/1/edit', state: { patientToEdit: patient } }],
        });

        expect(screen.getByRole('heading', { name: 'Edit patient' })).toBeInTheDocument();
        expect(screen.getByLabelText(/^Name/)).toHaveValue(patient.name);
        expect(screen.getByLabelText(/Date of birth/i)).toHaveValue(patient.date_of_birth);
        expect(screen.getByLabelText('Age')).toHaveValue(getAgeFromDOB(patient.date_of_birth));
    });

    it('shows a validation error and does not dispatch when name and date of birth are empty', async () => {
        const user = userEvent.setup();
        renderWithProviders(<PatientForm />, { initialEntries: ['/patients/new'] });

        await user.click(screen.getByRole('button', { name: /add patient/i }));

        expect(await screen.findByText('Name and date of birth are required')).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('derives age from date of birth', () => {
        renderWithProviders(<PatientForm />, { initialEntries: ['/patients/new'] });

        const dob = '1990-05-20';
        fireEvent.change(screen.getByLabelText(/Date of birth/i), { target: { value: dob } });

        expect(screen.getByLabelText('Age')).toHaveValue(getAgeFromDOB(dob));
    });

    it('derives date of birth from a valid age (1-100)', () => {
        renderWithProviders(<PatientForm />, { initialEntries: ['/patients/new'] });

        fireEvent.change(screen.getByLabelText('Age'), { target: { value: '30' } });

        expect(screen.getByLabelText(/Date of birth/i)).toHaveValue(getDOBFromAge(30));
    });

    it('does not derive date of birth when age is 0 or greater than 100', () => {
        renderWithProviders(<PatientForm />, { initialEntries: ['/patients/new'] });

        const dobInput = screen.getByLabelText(/Date of birth/i);
        fireEvent.change(dobInput, { target: { value: '2000-01-01' } });
        expect(dobInput).toHaveValue('2000-01-01');

        fireEvent.change(screen.getByLabelText('Age'), { target: { value: '0' } });
        expect(dobInput).toHaveValue('2000-01-01');

        fireEvent.change(screen.getByLabelText('Age'), { target: { value: '101' } });
        expect(dobInput).toHaveValue('2000-01-01');
    });

    it('creates a patient, shows a success toast, and navigates back', async () => {
        const patient = makePatient();
        vi.mocked(api.post).mockResolvedValueOnce({ data: { patient } });
        const user = userEvent.setup();
        renderWithProviders(<PatientForm />, { initialEntries: ['/patients/new'] });

        await user.type(screen.getByLabelText(/^Name/), 'New Patient');
        fireEvent.change(screen.getByLabelText(/Date of birth/i), { target: { value: '1995-03-10' } });
        await user.click(screen.getByRole('button', { name: /add patient/i }));

        await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(-1));
        expect(api.post).toHaveBeenCalledWith('/patients', {
            name: 'New Patient',
            date_of_birth: '1995-03-10',
            gender: 'MALE',
        });
        expect(toastMock.success).toHaveBeenCalledWith('Patient successfully created');
    });

    it('updates a patient, shows a success toast, and navigates back', async () => {
        const patient = makePatient();
        vi.mocked(api.put).mockResolvedValueOnce({ data: { patient } });
        const user = userEvent.setup();
        renderWithProviders(<PatientForm />, {
            initialEntries: [{ pathname: '/patients/1/edit', state: { patientToEdit: patient } }],
        });

        await user.click(screen.getByRole('button', { name: /update patient/i }));

        await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(-1));
        expect(api.put).toHaveBeenCalledWith(`/patients/${patient.id}`, {
            id: patient.id,
            name: patient.name,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
        });
        expect(toastMock.success).toHaveBeenCalledWith('Patient successfully updated');
    });

    it('shows an error toast and does not navigate when creation fails', async () => {
        vi.mocked(api.post).mockRejectedValueOnce({
            isAxiosError: true,
            message: 'Request failed',
            response: { data: { error: 'Server error' } },
        });
        const user = userEvent.setup();
        renderWithProviders(<PatientForm />, { initialEntries: ['/patients/new'] });

        await user.type(screen.getByLabelText(/^Name/), 'New Patient');
        fireEvent.change(screen.getByLabelText(/Date of birth/i), { target: { value: '1995-03-10' } });
        await user.click(screen.getByRole('button', { name: /add patient/i }));

        await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('Error creating patient. Please try again'));
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('calls navigate(-1) when Cancel is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<PatientForm />, { initialEntries: ['/patients/new'] });

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(navigateMock).toHaveBeenCalledWith(-1);
    });
});
