import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthError } from 'firebase/auth';
import axios, { AxiosError } from 'axios';
import { router } from '@inertiajs/react';
import { User } from '@/types';

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

interface Category {
    id: number;
    name: string;
    image: string;
    subcategories: Array<{
        id: number;
        name: string;
        image: string;
    }>;
}

interface Props {
    authUser: {
        user: User | null;
    };
    currentRoute?: string;
}

export default function Mobile({ authUser, currentRoute }: Props) {
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

    const categories: Category[] = [
        {
            id: 1,
            name: "Cleaning",
            image: "/images/categories/cleaning.jpg",
            subcategories: []
        },
        {
            id: 2,
            name: "Plumbing",
            image: "/images/categories/plumbing.jpg",
            subcategories: []
        },
        {
            id: 3,
            name: "Electrical",
            image: "/images/categories/electrical.jpg",
            subcategories: []
        },
        {
            id: 4,
            name: "Home Improvement",
            image: "/images/categories/home-improvement.jpg",
            subcategories: []
        }
    ];

    const questions = [
        {
            id: 1,
            text: "Need your house cleaned?",
            relatedServices: [1]
        },
        {
            id: 2,
            text: "Having plumbing issues?",
            relatedServices: [2]
        },
        {
            id: 3,
            text: "Electrical problems?",
            relatedServices: [3]
        },
        {
            id: 4,
            text: "Want to improve your home?",
            relatedServices: [4]
        }
    ];

    return (
        <div className="min-h-screen bg-[#bce7f8]">
            <Head title="Welcome" />

            <div className="p-6">
                {/* Categories Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {categories.slice(0, 3).map((category) => (
                        <Link
                            key={category.id}
                            href={`/subcategories/${category.id}`}
                            className="aspect-square bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="h-3/4 bg-[#fffad0]">
                                {/* Image placeholder */}
                            </div>
                            <div className="h-1/4 flex items-center justify-center text-[#3da0ff] font-semibold">
                                {category.name}
                            </div>
                        </Link>
                    ))}
                
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
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

                        <div>
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

                        <div className="flex items-center justify-between">
                            <Link
                                href="/register"
                                className="text-sm text-[#3da0ff] hover:underline"
                            >
                                Need an account?
                            </Link>

                            <PrimaryButton 
                                className="bg-[#3da0ff]" 
                                disabled={isLoading || processing}
                                type="submit"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </PrimaryButton>
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                                    fill="currentColor"
                                />
                            </svg>
                            {isLoading ? 'Signing in...' : 'Sign in with Google'}
                        </button>
                    </form>
                </div>

                {/* Quick Questions */}
                <div className="space-y-4">
                    {questions.map((question) => (
                        <Link
                            key={question.id}
                            href={`/subcategories/${question.relatedServices[0]}?highlight=${question.relatedServices.join(',')}`}
                            className="block w-full"
                        >
                            <button
                                className="w-full bg-white text-[#3da0ff] px-4 py-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                            >
                                {question.text}
                            </button>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
} 