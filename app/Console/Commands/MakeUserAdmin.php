<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email}';
    protected $description = 'Make a user an admin by their email';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $adminRole = Role::where('slug', 'admin')->first();
        if (!$adminRole) {
            $this->error('Admin role not found. Please run the RolesAndPermissionsSeeder first.');
            return 1;
        }

        if ($user->hasRole('admin')) {
            $this->info("User {$email} is already an admin.");
            return 0;
        }

        $user->roles()->attach($adminRole->id);
        $this->info("Successfully made {$email} an admin.");
        return 0;
    }
} 