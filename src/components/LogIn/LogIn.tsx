import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Field, FieldGroup, FieldLabel } from '../ui/field';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { logIn } from '@/features/auth/authSlice';
import { Spinner } from '../ui/spinner';
import { ROUTES } from '@/routes';
import { ArrowRight, Eye, EyeOff, Mic } from 'lucide-react';

const LogIn = () => {
    const [formState, setFormState] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const { loading, error } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(logIn(formState)).unwrap();
            navigate(ROUTES.PATIENTS);
        } catch {
            // error is handled in slice
        }
    };

    return (
        <div className='h-screen flex flex-col justify-center'>
            <div className='text-center my-12 flex flex-col items-center'>
                <div className='rounded-2xl bg-primary p-4 mb-4 flex items-center justify-center shadow-md shadow-gray-400'>
                    <Mic className='text-2xl font-bold text-white' />
                </div>
                <h1 className='text-2xl font-bold'>MediScribe</h1>
                <p className='text-muted-foreground text-sm'>Clinical AI Assistant</p>
            </div>
            <form onSubmit={handleSubmit} className='p-4 flex flex-col justify-center items-center'>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor='username' className='font-semibold'>
                            Username
                        </FieldLabel>
                        <Input
                            id='username'
                            placeholder='Enter your username'
                            type='text'
                            required
                            value={formState.username}
                            onChange={(e) => setFormState({ ...formState, username: e.target.value })}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor='password' className='font-semibold'>
                            Password
                        </FieldLabel>
                        <div className='relative'>
                            <Input
                                id='password'
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Enter your password'
                                required
                                value={formState.password}
                                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                                className='pr-10'
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword((prev) => !prev)}
                                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                            >
                                {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                            </button>
                        </div>
                    </Field>
                    {error && <p className='text-sm font-medium text-destructive mb-2 w-full'>{error}</p>}
                    <Field orientation='horizontal'>
                        <Button type='submit' className='w-full py-6'>
                            Log in
                            {!loading && <ArrowRight />}
                            {loading && <Spinner data-icon='inline-end' />}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    );
};

export default LogIn;
