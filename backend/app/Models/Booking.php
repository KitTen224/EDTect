<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory;
    use SoftDeletes;

     protected $fillable = [
        'user_id',
        'place_id',
        'booking_time',
        'number_of_people',
        'special_requests',
        'status'
    ];

    protected $casts = [
        'booking_time' => 'datetime'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function place() {
        return $this->belongsTo(Place::class);
    }

    public function detail() {
        return $this->hasOne(BookingDetail::class);
    }
}
