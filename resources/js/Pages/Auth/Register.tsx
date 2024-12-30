import { useEffect, FormEventHandler } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { signUpWithEmail, signInWithGoogle, getGoogleRedirectResult } from '@/config/firebase';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function Register() {
    const { data, setData, setError, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        const checkRedirectResult = async () => {
            try {
                const user = await getGoogleRedirectResult();
                if (user) {
                    await handleFirebaseAuth(user);
                }
            } catch (error) {
                console.error('Error checking redirect result:', error);
                setError('email' as any, 'Google sign-up failed. Please try again.');
            }
        };

        checkRedirectResult();
    }, []);

    const handleFirebaseAuth = async (firebaseUser: any) => {
        try {
            const response = await axios.post('/auth/firebase', {
                email: firebaseUser.email,
                name: firebaseUser.displayName || data.name,
                firebase_uid: firebaseUser.uid,
            });

            if (response.data.user) {
                router.visit('/dashboard');
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                Object.keys(error.response.data.errors).forEach((key) => {
                    setError(key as any, error.response.data.errors[key][0]);
                });
            } else {
                setError('email' as any, 'Registration failed. Please try again.');
            }
        }
    };

    const handleEmailRegister: FormEventHandler = async (e) => {
        e.preventDefault();
        
        if (data.password !== data.password_confirmation) {
            setError('password_confirmation' as any, 'The password confirmation does not match.');
            return;
        }

        try {
            const firebaseUser = await signUpWithEmail(data.email, data.password);
            await handleFirebaseAuth(firebaseUser);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setError('email' as any, 'This email is already registered.');
            } else {
                setError('email' as any, 'Registration failed. Please try again.');
            }
        }
    };

    const handleGoogleRegister = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            setError('email' as any, 'Google sign-up failed. Please try again.');
        }
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={handleEmailRegister}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href="/login"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            className="flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="ml-2">Sign up with Google</span>
                        </button>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
