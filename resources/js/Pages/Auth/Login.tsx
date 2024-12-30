import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthError } from 'firebase/auth';
import axios, { AxiosError } from 'axios';
import { router } from '@inertiajs/react';

import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface LoginFormData {
    email: string;
    password: string;
    remember: boolean;
}

interface FirebaseLoginResponse {
    message?: string;
    user?: any;
    errors?: Record<string, string[]>;
}

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const { data, setData, setError, processing, errors } = useForm<LoginFormData>({
        email: '',
        password: '',
        remember: false,
    });

    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });

    const handleFirebaseError = (error: AuthError) => {
        console.error('Firebase error:', error);
        switch (error.code) {
            case 'auth/invalid-email':
                setError('email', 'The email address is invalid.');
                break;
            case 'auth/user-disabled':
                setError('email', 'This account has been disabled.');
                break;
            case 'auth/user-not-found':
                setError('email', 'No account found with this email.');
                break;
            case 'auth/wrong-password':
                setError('password', 'Incorrect password.');
                break;
            case 'auth/popup-closed-by-user':
                setError('email', 'Sign-in popup was closed before completion.');
                break;
            default:
                setError('email', `Authentication error: ${error.message}`);
        }
    };

    const handleBackendError = (error: AxiosError<FirebaseLoginResponse>) => {
        console.error('Backend error:', error.response?.data);
        const message = error.response?.data?.message || 
            error.response?.data?.errors?.token?.[0] || 
            error.message;
        setError('email', `Server error: ${message}`);
    };

    const handleEmailLogin: FormEventHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const token = await userCredential.user.getIdToken(true);
            
            try {
                await axios.post('/firebase-login', { token });
                router.visit('/dashboard');
            } catch (error) {
                handleBackendError(error as AxiosError<FirebaseLoginResponse>);
            }
        } catch (error) {
            handleFirebaseError(error as AuthError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken(true);
            
            try {
                await axios.post('/firebase-login', { token });
                router.visit('/dashboard');
            } catch (error) {
                handleBackendError(error as AxiosError<FirebaseLoginResponse>);
            }
        } catch (error) {
            handleFirebaseError(error as AuthError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        disabled={isLoading}
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
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        disabled={isLoading}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href="/register"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Need an account?
                    </Link>

                    <PrimaryButton 
                        className="ms-4" 
                        disabled={isLoading || processing}
                        type="submit"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
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
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="ml-2">{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
