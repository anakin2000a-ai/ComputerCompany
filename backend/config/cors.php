<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'], // يسمح بجميع الطرق POST, GET, OPTIONS...

    // استبدل الأسطر القديمة وضَعْ العناوين الخاصة بالفرونت إند بدقة:
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // يسمح بجميع الهيدرز بما فيها Authorization

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // مهم جداً إذا كنت تستخدم سبرنت أو سانكتوم
];