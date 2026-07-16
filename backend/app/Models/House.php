<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class House extends Model
{
    protected $fillable = [
        'house_number',
        'status',
    ];

    public function houseResidents(): HasMany
    {
        return $this->hasMany(HouseResident::class);
    }

    // Penghuni yang sedang menempati rumah (end_date masih null)
    public function currentOccupancy(): HasOne
    {
        return $this->hasOne(HouseResident::class)->whereNull('end_date');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
