<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiInteractionLog extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = [
        'user_id',
        'place_id',
        'itinerary_id',
        'action_type',
        'prompt_text',
        'response_text',
        'model_used',
        'timestamp',
        'metadata',
    ];

    protected $casts = [
        'timestamp' => 'datetime'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function place() {
        return $this->belongsTo(Place::class);
    }

    public function itinerary() {
        return $this->belongsTo(Itinerary::class);
    }
}
