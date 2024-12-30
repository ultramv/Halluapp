import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import RoleLabel from '@/Components/RoleLabel';

export default function Dashboard({ auth, currentRoute }: PageProps) {
    if (!auth.user) {
        return null; // or redirect to login
    }

    const userRole = auth.user.roles?.[0]?.name || 'No Role';

    return (
        <AuthenticatedLayout
            user={auth.user}
            currentRoute={currentRoute}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center gap-3">
                                <span>You're logged in!</span>
                                <RoleLabel role={userRole} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
