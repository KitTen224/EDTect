<?php

use Laravel\Sanctum\Sanctum;

return [

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:3000,localhost:8000,::1'
    )),

    'guard' => ['web'],

    'expiration' => 60 * 24 * 7, // 1 week in minutes

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', 'japan_journey_'),

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
    ],
];
