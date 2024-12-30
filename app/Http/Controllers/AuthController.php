<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Kreait\Firebase\Auth as FirebaseAuth;
use Illuminate\Support\Str;
use App\Models\User;

class AuthController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseAuth $firebase)
    {
        \Log::debug('FIREBASE_CREDENTIALS value is: ' . env('FIREBASE_CREDENTIALS'));
        $this->firebase = $firebase;
    }

    public function firebaseLogin(Request $request)
    {
        \Log::debug($request->all());

        $request->validate([
            'token' => 'required|string',
        ]);

        $idToken = $request->input('token');

        try {
            // Verify the ID token
            $verifiedToken = $this->firebase->verifyIdToken($idToken);
            $firebaseUid = $verifiedToken->claims()->get('sub');

            // Retrieve claims (name, email) if they exist
            $email = $verifiedToken->claims()->get('email') ?? null;
            $name = $verifiedToken->claims()->get('name') ?? 'Anonymous';

            // Create or find user in local database
            $user = User::firstOrCreate(
                ['firebase_uid' => $firebaseUid],
                [
                    'email' => $email,
                    'name' => $name,
                    'password' => bcrypt(Str::random(8)), // Set random 8-character password
                ]
            );

            // Log in using Laravel's session
            Auth::login($user);

            return response()->json([
                'status' => 'success',
                'user' => $user,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }
    }
} 