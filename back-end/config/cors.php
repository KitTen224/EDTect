<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Recommended production settings commented out
    | Use these for development and adjust for production
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
        'forgot-password',
        'reset-password'
    ],

    'allowed_methods' => [
        'POST',
        'GET',
        'OPTIONS',
        'PUT',
        'PATCH',
        'DELETE'
    ],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // 'https://yourproductiondomain.com'
    ],

    'allowed_origins_patterns' => [
        // For dynamic subdomains if needed
        // 'https?://(.+\.)?yourdomain\.com'
    ],

    'allowed_headers' => [
        'Origin',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN'
    ],

    'exposed_headers' => [
        'Authorization',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN'
    ],

    'max_age' => 60 * 60 * 24, // 24 hours

    'supports_credentials' => true,
];
