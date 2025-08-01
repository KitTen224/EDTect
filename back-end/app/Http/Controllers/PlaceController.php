<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;

class PlaceController extends Controller
{
    public function index()
    {
        $sights = Place::where(function ($q) {
            $q->whereJsonContains('tags', 'tourism')
                ->orWhereJsonContains('tags', 'tourism.attraction')
                ->orWhereJsonContains('tags', 'tourism.sights')
                ->orWhereJsonContains('tags', 'leisure')
                ->orWhere('genre_name', 'attraction')
                ->orWhere('genre_name', 'experience');
        })->get();

        return response()->json($sights);
    }
}
