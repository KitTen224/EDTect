<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index()
    {
        $restaurants = Place::where(function ($q) {
            $q->whereJsonContains('tags', 'catering')
                ->orWhereJsonContains('tags', 'meal')
                ->orWhere('genre_name', 'meal')
                ->orWhere('genre_name', 'like', '%居酒屋%')
                ->orWhere('genre_name', 'like', '%中華%');
        })->get();

        return response()->json($restaurants);
    }
}
