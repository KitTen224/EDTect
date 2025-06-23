<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItineraryPlace extends Model
{
    use HasFactory;

    protected $fillable = [
        'itinerary_id',
        'place_id',
        'visit_date',
        'start_time',
        'end_time',
        'notes',
        'order'
    ];

    protected $casts = [
        'visit_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'order' => 'integer'
    ];

    public function itinerary() {
        return $this->belongsTo(Itinerary::class);
    }

    public function place() {
        return $this->belongsTo(Place::class);
    }
}
