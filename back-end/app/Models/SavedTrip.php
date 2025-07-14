<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SavedTrip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'form_data',
        'timeline_data',
        'total_duration',
    ];

    /**
     * Cast these JSON columns into PHP arrays automatically.
     */
    protected $casts = [
        'form_data'     => 'array',
        'timeline_data' => 'array',
    ];

    /**
     * These virtual attributes will be appended to the JSON output.
     */
    protected $appends = [
        'regions',
        'travel_styles',
        'total_estimated_cost',
    ];

    /**
     * Expose the regions array (pulled from form_data['regions']).
     */
    public function getRegionsAttribute()
    {
        return $this->form_data['regions'] ?? [];
    }

    /**
     * Expose the travelStyles array (pulled from form_data['travelStyles']).
     */
    public function getTravelStylesAttribute()
    {
        return $this->form_data['travelStyles'] ?? [];
    }

    /**
     * Sum up all of your days' totalCost fields.
     */
    public function getTotalEstimatedCostAttribute()
    {
        if (! isset($this->timeline_data['days'])) {
            return 0;
        }

        return collect($this->timeline_data['days'])
            ->sum('totalCost');
    }
}
