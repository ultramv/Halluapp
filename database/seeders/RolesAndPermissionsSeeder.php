<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $adminRole = Role::create([
            'name' => 'Admin',
            'slug' => 'admin',
        ]);

        $customerRole = Role::create([
            'name' => 'Customer',
            'slug' => 'customer',
        ]);

        $serviceProviderRole = Role::create([
            'name' => 'Service Provider',
            'slug' => 'service-provider',
        ]);

        // Create permissions
        $manageUsers = Permission::create([
            'name' => 'Manage Users',
            'slug' => 'manage-users',
        ]);

        $manageRoles = Permission::create([
            'name' => 'Manage Roles',
            'slug' => 'manage-roles',
        ]);

        // Assign permissions to admin role
        $adminRole->permissions()->attach([
            $manageUsers->id,
            $manageRoles->id,
        ]);
    }
} 