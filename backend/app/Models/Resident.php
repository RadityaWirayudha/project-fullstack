<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resident extends Model
{
    protected $fillable = [
        'full_name',
        'ktp_photo',
        'resident_status',
        'phone_number',
        'marital_status',
    ];

    protected $appends = ['ktp_photo_url'];

    public function houseResidents(): HasMany
    {
        return $this->hasMany(HouseResident::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getKtpPhotoUrlAttribute(): ?string
    {
        return $this->ktp_photo ? '/storage/' . $this->ktp_photo : null;
    }
}
