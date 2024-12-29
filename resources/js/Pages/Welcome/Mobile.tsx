import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface Category {
    category_id: number;
    name: string;
    image_url: string;
    subcategories: {
        subcategory_id: number;
        name: string;
        image_url: string;
    }[];
}

interface QuickQuestion {
    id: number;
    question: string;
    relatedServices: {
        categoryId: number;
        subcategoryIds: number[];
    };
}

interface WelcomeProps extends PageProps {
    appInfo?: {
        canLogin: boolean;
        canRegister: boolean;
        laravelVersion: string | null;
        phpVersion: string | null;
    };
}

export default function MobileWelcome({ auth, appInfo = { canLogin: false, canRegister: false, laravelVersion: null, phpVersion: null } }: WelcomeProps) {
    const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

    const quickQuestions: QuickQuestion[] = [
        {
            id: 1,
            question: "Do you want to clean house?",
            relatedServices: {
                categoryId: 1, // Home Services
                subcategoryIds: [3] // Cleaning
            }
        },
        {
            id: 2,
            question: "Do you want to hire a music player?",
            relatedServices: {
                categoryId: 2, // Event Services
                subcategoryIds: [4, 5] // Photography, Catering (example)
            }
        },
        {
            id: 3,
            question: "Are you looking for a Venue to host an event?",
            relatedServices: {
                categoryId: 2, // Event Services
                subcategoryIds: [6] // Event Planning
            }
        },
        {
            id: 4,
            question: "Are you looking to rent music instruments?",
            relatedServices: {
                categoryId: 3, // Equipment Rentals
                subcategoryIds: [8] // Event Equipment
            }
        }
    ];

    const categories: Category[] = [
        {
            category_id: 1,
            name: "Home Services",
            image_url: "/images/home_services.jpg",
            subcategories: []
        },
        {
            category_id: 2,
            name: "Event Services",
            image_url: "/images/event_services.jpg",
            subcategories: []
        },
        {
            category_id: 3,
            name: "Equipment Rentals",
            image_url: "/images/equipment_rentals.jpg",
            subcategories: []
        },
        {
            category_id: 4,
            name: "Personal Services",
            image_url: "/images/personal_services.jpg",
            subcategories: []
        }
    ];

    return (
        <>
            <Head title="Welcome to Halluapp" />
            <div className="block min-h-screen bg-[#bce7f8] md:hidden">
                <div className="px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-center mb-4">
                            <h1 className="text-3xl font-bold text-[#3da0ff]">Halluapp</h1>
                        </div>
                        {!auth.user && (
                            <div className="flex justify-center space-x-4">
                                {appInfo.canLogin && (
                                    <Link
                                        href="/login"
                                        className="rounded-md bg-[#3da0ff] px-6 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-[#3da0ff]/90"
                                    >
                                        Log in
                                    </Link>
                                )}
                                {appInfo.canRegister && (
                                    <Link
                                        href="/register"
                                        className="rounded-md bg-[#fffad0] px-6 py-2.5 text-sm font-medium text-[#3da0ff] shadow-lg transition hover:bg-[#fffad0]/90"
                                    >
                                        Register
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Content - Flexbox Layout */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        {/* 3 Small Boxes */}
                        {categories.slice(0, 3).map((category) => (
                            <Link
                                key={category.category_id}
                                href={`/categories/${category.category_id}`}
                                className="w-[calc(50%-8px)] rounded-2xl bg-white p-4 shadow-xl transition hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="aspect-square w-full bg-[#fffad0] rounded-xl mb-4">
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className="h-full w-full object-cover rounded-xl"
                                    />
                                </div>
                                <h3 className="font-bold text-[#3da0ff]">{category.name}</h3>
                            </Link>
                        ))}

                        {/* Large Box */}
                        <Link
                            href={`/categories/${categories[3].category_id}`}
                            className="w-full rounded-2xl bg-white p-4 shadow-xl transition hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="aspect-video w-full bg-[#fffad0] rounded-xl mb-4">
                                <img
                                    src={categories[3].image_url}
                                    alt={categories[3].name}
                                    className="h-full w-full object-cover rounded-xl"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-[#3da0ff]">{categories[3].name}</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Discover our wide range of personal services tailored to your needs
                            </p>
                        </Link>
                    </div>

                    {/* Quick Questions Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-[#3da0ff] mb-4">Need help finding a service?</h2>
                        <div className="space-y-3">
                            {quickQuestions.map((q) => (
                                <div
                                    key={q.id}
                                    className={`bg-white rounded-xl p-4 shadow-lg transition ${
                                        selectedQuestion === q.id ? 'ring-2 ring-[#3da0ff]' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-700">{q.question}</p>
                                        <Link
                                            href={`/categories/${q.relatedServices.categoryId}?highlight=${q.relatedServices.subcategoryIds.join(',')}`}
                                            className="ml-4 px-4 py-2 bg-[#3da0ff] text-white rounded-lg text-sm font-medium shadow-md hover:bg-[#3da0ff]/90 transition"
                                            onClick={() => setSelectedQuestion(q.id)}
                                        >
                                            Yes
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-8 text-center text-sm text-[#3da0ff]">
                        <p>Find the perfect service for your needs</p>
                    </footer>
                </div>
            </div>
        </>
    );
} 