<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FirebaseAuthController extends Controller
{
    public function handleFirebaseAuth(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
            'firebase_uid' => 'required|string',
        ]);

        // Find or create user
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make(Str::random(16)), // Random password for Firebase users
                'firebase_uid' => $request->firebase_uid,
            ]);
        } else {
            // Update existing user's Firebase UID if not set
            if (!$user->firebase_uid) {
                $user->firebase_uid = $request->firebase_uid;
                $user->save();
            }
        }

        // Create a session for the user
        auth()->login($user);

        return response()->json([
            'user' => $user,
            'message' => 'Authentication successful'
        ]);
    }
} 