<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Invitation extends Model
{
    protected $fillable = [
        'created_by',
        'code',
        'role_slug',
        'is_used',
        'expires_at',
        'redirect_url',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateCode(): string
    {
        do {
            // Generate a 17-character code: 12 random chars + 5 timestamp-based chars
            $randomPart = strtoupper(Str::random(12));
            $timestampPart = strtoupper(base_convert(time() % 100000, 10, 36));
            $code = $randomPart . str_pad($timestampPart, 5, '0', STR_PAD_LEFT);
        } while (static::where('code', $code)->exists());

        return $code;
    }

    public function isValid(): bool
    {
        if ($this->is_used) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    public function getInviteUrl(): string
    {
        if ($this->redirect_url) {
            return $this->redirect_url . '?code=' . $this->code;
        }
        return url("/register?code={$this->code}");
    }
} 