import type { PropsWithChildren, ReactElement } from 'react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, type InitialEntry } from 'react-router';
import { render, type RenderOptions } from '@testing-library/react';
import authSlice from '@/features/auth/authSlice';
import patientsSlice from '@/features/patients/patientsSlice';
import consultationsSlice from '@/features/consultations/consultationsSlice';
import type { RootState } from '@/app/store';

const rootReducer = combineReducers({
    auth: authSlice,
    patients: patientsSlice,
    consultations: consultationsSlice,
});

export function createTestStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
    });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    preloadedState?: Partial<RootState>;
    store?: ReturnType<typeof createTestStore>;
    initialEntries?: InitialEntry[];
    route?: string;
}

export function renderWithProviders(
    ui: ReactElement,
    {
        preloadedState,
        store = createTestStore(preloadedState),
        initialEntries = ['/'],
        route,
        ...renderOptions
    }: RenderWithProvidersOptions = {},
) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <Provider store={store}>
                <MemoryRouter initialEntries={initialEntries}>
                    {route ? (
                        <Routes>
                            <Route path={route} element={children} />
                        </Routes>
                    ) : (
                        children
                    )}
                </MemoryRouter>
            </Provider>
        );
    }

    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
