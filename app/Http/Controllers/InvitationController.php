<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

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
        $request->validate([
            'role_slug' => 'required|string|in:customer,service-provider',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $invitation = Invitation::create([
            'created_by' => auth()->id(),
            'code' => Invitation::generateCode(),
            'role_slug' => $request->role_slug,
            'expires_at' => $request->expires_at,
        ]);

        $inviteUrl = url("/register?code={$invitation->code}");
        $qrCode = base64_encode(QrCode::format('svg')->size(300)->generate($inviteUrl));

        return response()->json([
            'invitation' => $invitation,
            'qr_code' => $qrCode,
            'invite_url' => $inviteUrl,
        ]);
    }

    public function destroy(Invitation $invitation)
    {
        $invitation->delete();
        return redirect()->back();
    }
} 