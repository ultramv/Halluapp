import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import axios from 'axios';

interface Invitation {
    id: number;
    code: string;
    role_slug: string;
    redirect_url: string | null;
    is_used: boolean;
    expires_at: string | null;
    created_at: string;
    creator: {
        name: string;
    };
}

interface InvitationsPageProps extends PageProps {
    invitations: {
        data: Invitation[];
        current_page: number;
        last_page: number;
    };
}

export default function Index({ auth, invitations, currentRoute }: InvitationsPageProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const generateInvite = async (roleSlug: string) => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await axios.post('/invitations', {
                role_slug: roleSlug,
                redirect_url: redirectUrl || undefined,
            });
            setQrCode(response.data.qr_code);
            setInviteUrl(response.data.invite_url);
            router.reload();
        } catch (error: any) {
            console.error('Error generating invitation:', error);
            setError(error.response?.data?.message || 'Error generating invitation');
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteInvitation = (id: number) => {
        if (confirm('Are you sure you want to delete this invitation?')) {
            router.delete(`/invitations/${id}`);
        }
    };

    if (!auth.user) {
        return null;
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            currentRoute={currentRoute}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Invitations</h2>}
        >
            <Head title="Invitations" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                                            <div className="mt-2 text-sm text-red-700">{error}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label htmlFor="redirectUrl" className="mb-2 block text-sm font-medium text-gray-700">
                                    Redirect URL (Optional)
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="url"
                                        id="redirectUrl"
                                        value={redirectUrl}
                                        onChange={(e) => setRedirectUrl(e.target.value)}
                                        placeholder="https://your-app.com/register"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mb-6 flex gap-4">
                                <button
                                    onClick={() => generateInvite('customer')}
                                    disabled={isGenerating}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Generate Customer Invite
                                </button>
                                <button
                                    onClick={() => generateInvite('service-provider')}
                                    disabled={isGenerating}
                                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    Generate Service Provider Invite
                                </button>
                            </div>

                            {qrCode && inviteUrl && (
                                <div className="mb-6 rounded-lg border p-4">
                                    <div className="mb-4">
                                        <img
                                            src={`data:image/svg+xml;base64,${qrCode}`}
                                            alt="QR Code"
                                            className="h-64 w-64"
                                        />
                                    </div>
                                    <div className="break-all">
                                        <p className="font-semibold">Invite URL:</p>
                                        <p className="text-blue-600">{inviteUrl}</p>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Redirect URL
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Created At
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {invitations.data.map((invitation) => (
                                            <tr key={invitation.id}>
                                                <td className="whitespace-nowrap px-6 py-4 font-mono">
                                                    {invitation.code}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 capitalize">
                                                    {invitation.role_slug.replace('-', ' ')}
                                                </td>
                                                <td className="max-w-xs truncate px-6 py-4">
                                                    {invitation.redirect_url}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {invitation.is_used ? (
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                                                            Used
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {new Date(invitation.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <button
                                                        onClick={() => deleteInvitation(invitation.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 