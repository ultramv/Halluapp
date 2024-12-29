import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface SubCategory {
    subcategory_id: number;
    name: string;
    image_url: string;
}

interface Category {
    category_id: number;
    name: string;
    image_url: string;
    subcategories: SubCategory[];
}

interface SubCategoriesProps extends PageProps {
    category: Category;
}

export default function SubCategories({ auth, category }: SubCategoriesProps) {
    const [highlightedIds, setHighlightedIds] = useState<number[]>([]);

    useEffect(() => {
        // Get highlighted subcategory IDs from URL
        const urlParams = new URLSearchParams(window.location.search);
        const highlight = urlParams.get('highlight');
        if (highlight) {
            setHighlightedIds(highlight.split(',').map(Number));
        }
    }, []);

    return (
        <>
            <Head title={`${category.name} - Halluapp`} />
            <div className="min-h-screen bg-[#bce7f8]">
                <div className="px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="text-[#3da0ff]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-2xl font-bold text-[#3da0ff]">{category.name}</h1>
                            <div className="w-6"></div> {/* Spacer for alignment */}
                        </div>
                    </div>

                    {/* Category Image */}
                    <div className="mb-8">
                        <div className="aspect-video w-full bg-[#fffad0] rounded-2xl overflow-hidden">
                            <img
                                src={category.image_url}
                                alt={category.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Subcategories Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {category.subcategories.map((subcategory) => {
                            const isHighlighted = highlightedIds.includes(subcategory.subcategory_id);
                            return (
                                <div
                                    key={subcategory.subcategory_id}
                                    className={`bg-white rounded-xl p-4 shadow-lg transition ${
                                        isHighlighted ? 'ring-2 ring-[#3da0ff] scale-[1.02]' : ''
                                    }`}
                                >
                                    <div className="aspect-square w-full bg-[#fffad0] rounded-lg mb-3 overflow-hidden">
                                        <img
                                            src={subcategory.image_url}
                                            alt={subcategory.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-medium text-[#3da0ff] text-sm">
                                        {subcategory.name}
                                        {isHighlighted && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#fffad0] text-[#3da0ff]">
                                                Recommended
                                            </span>
                                        )}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <footer className="mt-8 text-center text-sm text-[#3da0ff]">
                        <p>Select a service to get started</p>
                    </footer>
                </div>
            </div>
        </>
    );
} 