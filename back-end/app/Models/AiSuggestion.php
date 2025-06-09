<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'place_id',
        'suggestion_date',
        'reason'
    ];

    protected $casts = [
        'suggestion_date' => 'date'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function place() {
        return $this->belongsTo(Place::class);
    }
}
