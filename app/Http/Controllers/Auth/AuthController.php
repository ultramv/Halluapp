<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    protected $auth;

    public function __construct(FirebaseAuth $auth)
    {
        $this->auth = $auth;
    }

    public function firebaseLogin(Request $request)
    {
        try {
            $verifiedIdToken = $this->auth->verifyIdToken($request->token);
            $uid = $verifiedIdToken->claims()->get('sub');
            $email = $verifiedIdToken->claims()->get('email');
            $name = $verifiedIdToken->claims()->get('name');

            $user = User::where('firebase_uid', $uid)
                ->orWhere('email', $email)
                ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $name ?? explode('@', $email)[0],
                    'email' => $email,
                    'firebase_uid' => $uid,
                    'password' => bcrypt(uniqid()),
                ]);
            } else {
                if (!$user->firebase_uid) {
                    $user->update(['firebase_uid' => $uid]);
                }
            }

            Auth::login($user);

            return response()->json([
                'user' => $user,
                'message' => 'Successfully logged in',
            ]);
        } catch (FailedToVerifyToken $e) {
            return response()->json([
                'message' => 'Invalid token',
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during authentication',
            ], 500);
        }
    }
} 