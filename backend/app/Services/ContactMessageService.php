<?php

namespace App\Services;

use App\Models\ContactMessage;

class ContactMessageService
{
    public function store(array $data): ContactMessage
    {
        return ContactMessage::create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'whatsapp' => $data['whatsapp'] ?? null,
            'message' => $data['message'],
        ]);
    }
}