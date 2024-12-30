<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\FirebaseAuthController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

Route::get('/', function () {
    return Inertia::render('Welcome/index', [
        'appInfo' => [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ],
    ]);
})->name('welcome');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/categories/{category}', function (int $category) {
    // Get the categories data from the JSON file
    $categoriesData = json_decode(file_get_contents(base_path('json/welcomepagedata.json')), true);
    
    // Find the requested category
    $selectedCategory = collect($categoriesData['categories'])->firstWhere('category_id', $category);
    
    if (!$selectedCategory) {
        abort(404);
    }

    return Inertia::render('SubCategories/Index', [
        'category' => $selectedCategory
    ]);
})->name('categories.show');

Route::post('/auth/firebase', function (Request $request) {
    try {
        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
            'firebase_uid' => 'required|string',
        ]);

        \Log::info('Firebase auth attempt', [
            'email' => $validated['email'],
            'firebase_uid' => $validated['firebase_uid']
        ]);

        $user = User::where('firebase_uid', $validated['firebase_uid'])
            ->orWhere('email', $validated['email'])
            ->first();

        if (!$user) {
            \Log::info('Creating new user', ['email' => $validated['email']]);
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'firebase_uid' => $validated['firebase_uid'],
                'password' => Hash::make(Str::random(32)),
            ]);
        } else {
            \Log::info('Updating existing user', ['email' => $validated['email']]);
            
            $user->update([
                'firebase_uid' => $validated['firebase_uid'],
                'name' => $validated['name'],
            ]);
        }

        Auth::login($user);
        
        \Log::info('User authenticated successfully', ['email' => $validated['email']]);

        return response()->json(['user' => $user]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::warning('Firebase auth validation error', [
            'errors' => $e->errors(),
            'request' => $request->all()
        ]);
        
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Firebase auth error: ' . $e->getMessage(), [
            'request' => $request->all(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'message' => 'Authentication failed',
            'errors' => ['email' => ['Authentication failed. Please try again.']]
        ], 500);
    }
})->middleware(['web']);

require __DIR__.'/auth.php';
