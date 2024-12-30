<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Log;

class InvitationController extends Controller
{
    public function index()
    {
        $invitations = Invitation::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Invitations/Index', [
            'invitations' => $invitations
        ]);
    }

    public function store(Request $request)
    {
        try {
            Log::info('Creating invitation', [
                'role_slug' => $request->role_slug,
                'redirect_url' => $request->redirect_url,
            ]);

            $validated = $request->validate([
                'role_slug' => 'required|string|in:customer,service-provider',
                'expires_at' => 'nullable|date|after:now',
                'redirect_url' => 'nullable|url|max:255',
            ]);

            $invitation = Invitation::create([
                'created_by' => auth()->id(),
                'code' => Invitation::generateCode(),
                'role_slug' => $validated['role_slug'],
                'redirect_url' => $validated['redirect_url'] ?? null,
                'expires_at' => $validated['expires_at'] ?? null,
            ]);

            Log::info('Invitation created', [
                'invitation_id' => $invitation->id,
                'code' => $invitation->code,
            ]);

            $inviteUrl = $invitation->getInviteUrl();
            $qrCode = base64_encode(QrCode::format('svg')
                ->size(300)
                ->errorCorrection('H')
                ->generate($inviteUrl));

            return response()->json([
                'invitation' => $invitation,
                'qr_code' => $qrCode,
                'invite_url' => $inviteUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating invitation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Error creating invitation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Invitation $invitation)
    {
        try {
            Log::info('Deleting invitation', ['invitation_id' => $invitation->id]);
            $invitation->delete();
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Error deleting invitation', [
                'error' => $e->getMessage(),
                'invitation_id' => $invitation->id,
            ]);
            return redirect()->back()->with('error', 'Error deleting invitation');
        }
    }
}