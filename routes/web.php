<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

require __DIR__.'/auth.php';
