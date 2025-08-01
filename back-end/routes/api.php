<?php

use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\AIChatController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\RestaurantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/admin/statistics', [StatisticsController::class, 'index']);
Route::apiResource('/admin/hotels', HotelController::class);
Route::apiResource('/admin/restaurants', RestaurantController::class);
Route::apiResource('/admin/places', PlaceController::class);

Route::post('/ai/save-itinerary', [AIController::class, 'saveItinerary']);

Route::post('/ai/chat/log', [AIChatController::class, 'store']);
Route::get('/ai/chat/log/{user_id}', [AIChatController::class, 'recent']);
