<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    public const FEE_AMOUNTS = [
        'kebersihan' => 15000,
        'satpam' => 100000,
    ];

    protected $fillable = [
        'house_id',
        'resident_id',
        'payment_date',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'payment_date' => 'date:Y-m-d',
    ];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(PaymentDetail::class);
    }
}
