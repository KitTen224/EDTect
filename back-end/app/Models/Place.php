<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Place extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'owner_id',
        'name',
        'tags',
        'genre_name',
        'description',
        'address',
        'latitude',
        'longitude',
        'phone',
        'email',
        'website',
        'opening_hours',
        'average_rating',
        'is_featured',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'is_featured' => 'boolean',
    ];

    // 🔗 Relationships

    public function owner() {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function categories() {
        return $this->belongsToMany(Category::class, 'place_categories');
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }

    public function bookings() {
        return $this->hasMany(Booking::class);
    }

    public function itineraryPlaces() {
        return $this->hasMany(ItineraryPlace::class);
    }

    public function events() {
        return $this->hasMany(Event::class);
    }

    public function favorites() {
        return $this->hasMany(Favorite::class);
    }

    public function aiSuggestions() {
        return $this->hasMany(AiSuggestion::class);
    }
}
