<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class FirebaseAuthController extends Controller
{
    public function handleFirebaseAuth(Request $request)
    {
        try {
            Log::info('Firebase auth request received', $request->only(['email', 'firebase_uid']));

            $validated = $request->validate([
                'email' => 'required|email',
                'name' => 'required|string',
                'firebase_uid' => 'required|string',
            ]);

            Log::info('Firebase auth validation passed', [
                'email' => $validated['email'],
                'firebase_uid' => $validated['firebase_uid']
            ]);

            $user = User::where('firebase_uid', $validated['firebase_uid'])
                ->orWhere('email', $validated['email'])
                ->with('roles')
                ->first();

            if (!$user) {
                Log::info('Creating new user', ['email' => $validated['email']]);
                
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'firebase_uid' => $validated['firebase_uid'],
                    'password' => Hash::make(Str::random(32)),
                ]);

                // Assign customer role to new user
                $customerRole = Role::where('slug', 'customer')->first();
                if ($customerRole) {
                    $user->roles()->attach($customerRole->id);
                    Log::info('Assigned customer role to new user', ['email' => $validated['email']]);
                } else {
                    Log::warning('Customer role not found when creating user', ['email' => $validated['email']]);
                }

                $user->load('roles');
            } else {
                Log::info('Updating existing user', ['email' => $validated['email']]);
                
                if (!$user->firebase_uid) {
                    $user->update([
                        'firebase_uid' => $validated['firebase_uid'],
                        'name' => $validated['name'],
                    ]);
                    Log::info('Updated user Firebase UID', ['email' => $validated['email']]);
                }
            }

            auth()->login($user);
            
            Log::info('User authenticated successfully', [
                'email' => $validated['email'],
                'roles' => $user->roles->pluck('name')
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'user' => $user,
                    'message' => 'Authentication successful'
                ]);
            }

            return redirect()->intended('/dashboard');
        } catch (ValidationException $e) {
            Log::warning('Firebase auth validation failed', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }

            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            Log::error('Firebase auth error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Authentication failed',
                    'error' => $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['email' => 'Authentication failed. Please try again.']);
        }
    }
} 