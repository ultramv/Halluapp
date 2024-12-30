<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;
use Kreait\Firebase\Exception\AuthException;
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        protected FirebaseAuth $firebaseAuth
    ) {}

    public function firebaseLogin(Request $request): JsonResponse
    {
        try {
            Log::info('Firebase login attempt', [
                'request' => $request->all()
            ]);

            $validator = Validator::make($request->all(), [
                'token' => ['required', 'string'],
                'name' => ['sometimes', 'string', 'max:255'],
                'email' => ['sometimes', 'email', 'max:255'],
            ]);

            if ($validator->fails()) {
                Log::warning('Firebase login validation failed', [
                    'errors' => $validator->errors()
                ]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            try {
                $verifiedIdToken = $this->firebaseAuth->verifyIdToken($request->token);
            } catch (FailedToVerifyToken $e) {
                Log::warning('Firebase token verification failed', [
                    'error' => $e->getMessage(),
                    'token' => substr($request->token, 0, 20) . '...'
                ]);
                return response()->json([
                    'message' => 'Invalid authentication token',
                    'error' => $e->getMessage()
                ], 401);
            }
            
            $uid = $verifiedIdToken->claims()->get('sub');
            $tokenEmail = $verifiedIdToken->claims()->get('email');
            $tokenName = $verifiedIdToken->claims()->get('name');
            
            // Prefer request data over token data
            $email = $request->email ?? $tokenEmail;
            $name = $request->name ?? $tokenName ?? explode('@', $email)[0];
            
            Log::info('Firebase token verified', [
                'uid' => $uid,
                'email' => $email,
                'name' => $name
            ]);

            if (!$email) {
                Log::warning('Firebase login failed - email missing', [
                    'uid' => $uid
                ]);
                return response()->json([
                    'message' => 'Email is required for authentication',
                ], 400);
            }

            try {
                $user = User::firstOrNew(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'firebase_uid' => $uid,
                        'password' => bcrypt(uniqid()),
                    ]
                );

                if (!$user->exists) {
                    $user->save();
                    Log::info('New user created', ['user_id' => $user->id]);
                } elseif (!$user->firebase_uid) {
                    $user->update([
                        'firebase_uid' => $uid,
                        'name' => $name, // Update name if it's a new registration
                    ]);
                    Log::info('Existing user updated with Firebase UID', ['user_id' => $user->id]);
                }

                Auth::login($user);
                Log::info('User logged in successfully', ['user_id' => $user->id]);

                return response()->json([
                    'user' => $user,
                    'message' => 'Successfully authenticated',
                ]);

            } catch (\Exception $e) {
                Log::error('User creation/update failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

        } catch (AuthException $e) {
            Log::error('Firebase authentication error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Firebase authentication failed',
                'error' => $e->getMessage()
            ], 401);

        } catch (Throwable $e) {
            Log::error('Unexpected error during authentication', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'An error occurred during authentication',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 