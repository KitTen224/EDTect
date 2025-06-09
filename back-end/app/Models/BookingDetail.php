<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingDetail extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = [
        'booking_id',
        'room_type',
        'number_of_rooms',
        'menu_selected',
        'table_preference',
        'ticket_type',
        'price_per_unit',
        'total_price',
        'notes'
    ];

    protected $casts = [
        'price_per_unit' => 'float',
        'total_price' => 'float'
    ];

    public function booking() {
        return $this->belongsTo(Booking::class);
    }
}
