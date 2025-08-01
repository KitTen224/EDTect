<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    public function index()
    {
        $hotels = Place::where(function ($q) {
            $q->whereJsonContains('tags', 'accommodation')
                ->orWhere('genre_name', 'accommodation');
        })->get();

        return response()->json($hotels);
    }
}
