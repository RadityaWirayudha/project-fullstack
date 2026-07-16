<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentDetail extends Model
{
    protected $fillable = [
        'payment_id',
        'fee_type',
        'period',
        'amount',
    ];

    protected $casts = [
        'period' => 'date:Y-m-d',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
