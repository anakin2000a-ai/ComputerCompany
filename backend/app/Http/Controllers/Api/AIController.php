<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
public function search(Request $request)
{
    $request->validate([
        'prompt' => 'required|string'
    ]);

    try {
        $response = Http::withoutVerifying() 
            ->withHeaders([
                'Authorization' => 'Bearer ' . env('AI_API_KEY'),
                'HTTP-Referer'  => 'http://localhost:8000', 
                'X-Title'       => 'Nexus Labs App',        
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ])
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                // الموديل التلقائي الذكي - يختار الموديل المجاني الشغال دائماً محلياً
                'model' => 'openrouter/auto', 
                'messages' => [
                    ['role' => 'user', 'content' => $request->prompt]
                ],
                'temperature' => 0.7
            ]);

        if ($response->successful()) {
            $result = $response->json();
            
            if (isset($result['choices'][0]['message']['content'])) {
                return response()->json([
                    'success' => true,
                    'text' => $result['choices'][0]['message']['content']
                ], 200);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'خطأ تفصيلي: ' . $response->body()
        ], $response->status());

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ داخلي في سيرفر لارافل: ' . $e->getMessage()
        ], 500);
    }
}
 
}