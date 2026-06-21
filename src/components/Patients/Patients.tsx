import { useAppDispatch, useAppSelector, useDebounce } from '@/app/hooks';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useEffect } from 'react';
import { fetchPatients, setSearch } from '@/features/patients/patientsSlice';
import { logOut } from '@/features/auth/authSlice';
import PatientCard from './PatientCard';
import { Link, useNavigate } from 'react-router';
import { Mic } from 'lucide-react';
import { ROUTES } from '@/routes';

const Patients = () => {
    const { patients, loading, error, search } = useAppSelector((state) => state.patients);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const debouncedSearch = useDebounce(search, 300);
    const filteredPatients = patients.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

    useEffect(() => {
        dispatch(fetchPatients());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logOut());
        navigate(ROUTES.LOGIN);
    };

    return (
        <section className='p-4 border flex flex-col gap-5'>
            <header className='flex items-center justify-between'>
                <h1 className='text-xl font-bold'>Select patient</h1>
                <Button variant='outline' onClick={handleLogout}>
                    Log out
                </Button>
            </header>

            <div className='flex flex-col gap-4'>
                <Input
                    type='search'
                    placeholder='Search patient'
                    value={search}
                    onChange={(e) => dispatch(setSearch(e.target.value))}
                />

                {loading && <p className='text-center text-gray-600'>Loading patients...</p>}

                {error && <p className='text-center text-destructive'>Error: {error}</p>}

                {!loading && !error && filteredPatients.length === 0 && (
                    <p className='text-center text-gray-600'>
                        {search ? 'No patients match your search.' : 'No patients yet.'}
                    </p>
                )}

                {!loading && !error && patients.length > 0 && (
                    <>
                        <h2 className='text-sm font-semibold text-gray-700 tracking-wider'>Recent appointments</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {filteredPatients.map((patient) => (
                                <PatientCard key={patient.id} patient={patient} />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <Link to={ROUTES.CONSULTATION_NEW}>
                <Button className='rounded-full fixed bottom-4 right-4 p-5 flex items-center justify-between'>
                    <Mic />
                    Quick Record
                </Button>
            </Link>
        </section>
    );
};

export default Patients;
