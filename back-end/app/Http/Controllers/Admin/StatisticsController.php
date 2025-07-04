<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function index()
    {
        // Phân loại dựa trên tags hoặc genre_name
        // Khách sạn: nơi có tag liên quan đến "accommodation"
        $totalHotels = Place::where(function ($q) {
            $q->whereJsonContains('tags', 'accommodation')
            ->orWhere('genre_name','accommodation');
        })->count();

        // Nhà hàng: tag liên quan đến food hoặc catering
        $totalRestaurants = Place::where(function ($q) {
            $q->whereJsonContains('tags', 'catering')
            ->orWhereJsonContains('tags', 'meal')
            ->orWhere('genre_name','meal')
            ->orWhere('genre_name', 'like', '%居酒屋%')
            ->orWhere('genre_name', 'like', '%中華%');
        })->count();

        // Điểm tham quan: tag liên quan đến tourism hoặc attraction
        $totalPlaces = Place::where(function ($q) {
            $q->whereJsonContains('tags', 'tourism')
            ->orWhereJsonContains('tags', 'tourism.attraction')
            ->orWhereJsonContains('tags', 'tourism.sights')
            ->orWhereJsonContains('tags', 'leisure')
            ->orWhere('genre_name','attraction')
            ->orWhere('genre_name','experience');
        })->count();

        // Reviews
        $totalReviews = Review::count();
        $averageRating = Review::avg('rating');

        // Users, Bookings
        $totalUsers = User::count();
        $totalBookings = Booking::count();

        // Popular Places
        $popularPlaces = Place::withCount('reviews')
            ->orderByDesc('reviews_count')
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'rating' => $p->average_rating,
                'reviewCount' => $p->reviews_count,
            ]);

        // Monthly Stats (6 tháng gần nhất)
        $monthlyStats = collect(range(0, 5))->map(function ($i) {
            $month = Carbon::now()->subMonths($i)->format('Y-m');
            return [
                'month' => $month,
                'bookings' => Booking::where('created_at', 'like', "$month%")->count(),
                'reviews' => Review::where('created_at', 'like', "$month%")->count(),
            ];
        })->reverse()->values();

        return response()->json([
            'totalPlaces' => $totalPlaces,
            'totalRestaurants' => $totalRestaurants,
            'totalHotels' => $totalHotels,
            'totalReviews' => $totalReviews,
            'totalUsers' => $totalUsers,
            'totalBookings' => $totalBookings,
            'averageRating' => round($averageRating, 1),
            'popularPlaces' => $popularPlaces,
            'monthlyStats' => $monthlyStats,
        ]);
    }
}
