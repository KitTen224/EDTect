<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'place_id',
        'user_id',
        'title',
        'description',
        'start_time',
        'end_time',
        'image_url',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function place() {
        return $this->belongsTo(Place::class);
    }
}

