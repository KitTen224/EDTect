<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    use SoftDeletes;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */


    protected $fillable = [
        'user_name',
        'name',
        'email',
        'password',
        'address',
        'role',
        'avatar_url',
        'business_info',
    ];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    // 🧷 Relationships

    public function places() {
        return $this->hasMany(Place::class, 'owner_id');
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }

    public function bookings() {
        return $this->hasMany(Booking::class);
    }

    public function itineraries() {
        return $this->hasMany(Itinerary::class);
    }

    public function favorites() {
        return $this->hasMany(Favorite::class);
    }

    public function aiProfile() {
        return $this->hasOne(AiUserProfile::class);
    }

    public function aiLogs() {
        return $this->hasMany(AiInteractionLog::class);
    }

    public function aiSuggestions() {
        return $this->hasMany(AiSuggestion::class);
    }
}

