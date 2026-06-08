<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

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
public function searchAudio(Request $request)
    {
        $userTextPrompt = '';

        // [فحص ذكي أولي]: إذا كان الإرسال عبارة عن نص قادم من خلية البحث الجديدة
        if ($request->has('text_prompt') || $request->json('text_prompt')) {
            $userTextPrompt = $request->input('text_prompt') ?? $request->json('text_prompt');
        } else {
            // وإلا، نقوم بمعالجة ملف الـ Blob الصوتي كما هو مسبقاً
            $fileContents = null;
            $fileName = 'voice_' . time() . '.webm';

            if ($request->hasFile('audio') && $request->file('audio')->isValid()) {
                $fileContents = file_get_contents($request->file('audio')->getRealPath());
            } else if ($request->getContent()) {
                $fileContents = $request->getContent();
            }

            if (!$fileContents || strlen($fileContents) < 100) {
                return response()->json([
                    'success' => false, 
                    'message' => 'ملف الصوت المستلم فارغ، حاول التحدث مجدداً يا بطل!'
                ], 400);
            }

            try {
                // تحويل صوت الطفل إلى نص عبر Groq Whisper
                $whisperResponse = Http::withoutVerifying()
                    ->withToken(env('GROQ_API_KEY'))
                    ->attach('file', $fileContents, $fileName)
                    ->post('https://api.groq.com/openai/v1/audio/transcriptions', [
                        'model' => 'whisper-large-v3',
                        'language' => 'ar'
                    ]);

                if (!$whisperResponse->successful()) {
                    return response()->json([
                        'success' => false, 
                        'message' => 'لم أستطع تفسير الكلمات من خادم معالجة الصوت.'
                    ], 400);
                }

                $userTextPrompt = $whisperResponse->json()['text'] ?? '';

            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => 'خطأ في معالجة نبرة الصوت.'], 500);
            }
        }

        // التحقق النهائي من وجود نص (سواء أكان مكتوباً أو محولاً من صوت)
        if (empty(trim($userTextPrompt))) {
            return response()->json([
                'success' => false, 
                'message' => 'أوه! لم يتم استقبال كلمات واضحة، حاول مجدداً يا بطل.'
            ], 400);
        }

        try {
            // توليد رد تربوي وذكي ومبسط عبر OpenRouter يناسب عقلية الأطفال
            $aiResponse = Http::withoutVerifying()
                ->withHeaders([
                    'Authorization' => 'Bearer ' . env('AI_API_KEY'),
                    'Content-Type'  => 'application/json',
                ])
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => 'openrouter/auto',
                    'messages' => [[
                        'role' => 'user', 
                        'content' => $userTextPrompt . ' (تخيل أنك معلم ومربي ذكي للأطفال، أجب على هذا الطفل بأسلوب مشجع ومبسط جداً وبدون استخدام علامات النجوم ** أو التنسيقات البرمجية المعقدة لتناسب القراءة الصوتية)'
                    ]],
                    'temperature' => 0.7
                ]);

            if (!$aiResponse->successful()) {
                return response()->json([
                    'success' => false, 
                    'message' => 'فشل نظام الذكاء الاصطناعي في توليد الرد المطلوب.'
                ], 400);
            }

            $aiTextResult = $aiResponse->json()['choices'][0]['message']['content'];
            
            // تنظيف النص بالكامل من علامات النجوم لتوفير النطق الصحيح
            $cleanText = str_replace(['**', '*', '#', '`'], '', $aiTextResult);

            // تقطيع وتجميع كتل الصوت (Chunking) لـ Google TTS لضمان الانسيابية
            $textChunks = explode('.', $cleanText);
            $combinedAudioData = '';
            $hasAudioData = false;

            foreach ($textChunks as $chunk) {
                $chunk = trim($chunk);
                if (empty($chunk)) continue;

                $subChunks = $this->mbStrSplit($chunk, 90); 

                foreach ($subChunks as $subChunk) {
                    $subChunk = trim($subChunk);
                    if (empty($subChunk)) continue;

                    $encodedText = urlencode($subChunk);
                    $ttsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q={$encodedText}";
                    
                    $chunkAudio = @file_get_contents($ttsUrl);
                    
                    if ($chunkAudio !== false) {
                        $combinedAudioData .= $chunkAudio;
                        $hasAudioData = true;
                    }
                }
            }

            if (!$hasAudioData) {
                return response()->json([
                    'success' => false, 
                    'message' => 'نجح توليد النص ولكن تعذر تحويله لصوت متزامن.'
                ], 500);
            }
            
            // حفظ ملف الصوت النهائي في الـ Storage
            $audioFileName = 'reply_' . time() . '_' . uniqid() . '.mp3';
            
            if (!Storage::disk('public')->exists('audio')) {
                Storage::disk('public')->makeDirectory('audio');
            }
            
            Storage::disk('public')->put('audio/' . $audioFileName, $combinedAudioData);
            $finalAudioUrl = asset('storage/audio/' . $audioFileName);

            return response()->json([
                'success' => true,
                'text' => $aiTextResult,           // نص إجابة الـ AI المعروضة بالشات
                'user_text' => $userTextPrompt,   // النص المستعلم عنه ليظهر بفقاعة الطفل
                'audio_url' => $finalAudioUrl     // رابط ملف الـ MP3 المتصل
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'خطأ داخلي في السيرفر: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * دالة مساعدة لتقطيع النصوص الطويلة مع الحفاظ على الحروف العربية (Multi-byte).
     */
    private function mbStrSplit($string, $split_length = 1) {
        if ($split_length <= 0) return false;
        $array = array();
        $strlen = mb_strlen($string);
        for ($i = 0; $i < $strlen; $i += $split_length) {
            $array[] = mb_substr($string, $i, $split_length);
        }
        return $array;
    }
// 2. دالة معالجة البحث الصوتي والرد الصوتي المتكاملة 🎤🎯
// public function searchAudio(Request $request)
// {
//     $fileContents = null;
//     $fileName = 'voice_' . time() . '.webm';

//     if ($request->hasFile('audio') && $request->file('audio')->isValid()) {
//         $fileContents = file_get_contents($request->file('audio')->getRealPath());
//     } else if ($request->getContent()) {
//         $fileContents = $request->getContent();
//     }

//     if (!$fileContents || strlen($fileContents) < 100) {
//         return response()->json([
//             'success' => false, 
//             'message' => 'ملف الصوت المستلم تالف أو فارغ.'
//         ], 400);
//     }

//     try {
//         // 1. تحويل الصوت إلى نص عبر Groq Whisper
//         $whisperResponse = Http::withoutVerifying()
//             ->withToken(env('GROQ_API_KEY'))
//             ->attach('file', $fileContents, $fileName)
//             ->post('https://api.groq.com/openai/v1/audio/transcriptions', [
//                 'model' => 'whisper-large-v3',
//                 'language' => 'ar'
//             ]);

//         if (!$whisperResponse->successful()) {
//             return response()->json(['success' => false, 'message' => 'خطأ معالجة Groq.'], 400);
//         }

//         $userTextPrompt = $whisperResponse->json()['text'] ?? '';

//         if (empty(trim($userTextPrompt))) {
//             return response()->json(['success' => false, 'message' => 'لم يتم التقاط نص واضح.'], 400);
//         }

//         // 2. طلب الرد الذكي من OpenRouter
//         $aiResponse = Http::withoutVerifying()
//             ->withHeaders([
//                 'Authorization' => 'Bearer ' . env('AI_API_KEY'),
//                 'Content-Type'  => 'application/json',
//             ])
//             ->post('https://openrouter.ai/api/v1/chat/completions', [
//                 'model' => 'openrouter/auto',
//                 'messages' => [[
//                     'role' => 'user', 
//                     'content' => $userTextPrompt . ' (الرجاء الإجابة بشكل مختصر وواضح ومباشر لتناسب القراءة الصوتية وبدون استخدام علامات النجوم ** أو التنسيقات المعقدة)'
//                 ]],
//                 'temperature' => 0.7
//             ]);

//         if (!$aiResponse->successful()) {
//             return response()->json(['success' => false, 'message' => 'فشل توليد الرد الذكي.'], 400);
//         }

//         $aiTextResult = $aiResponse->json()['choices'][0]['message']['content'];
        
//         // تنظيف النص من علامات النجوم والتنسيقات لضمان جودة النطق الصوتي
//         $cleanText = str_replace(['**', '*', '#'], '', $aiTextResult);

//         // 3. معالجة النصوص الطويلة عبر تقطيعها (Chunking) لـ Google TTS
//         // نقوم بتقسيم النص إلى جمل لا تتعدى 100 حرف لضمان عدم حظر أو بتر الصوت من جوجل
//         $textChunks = explode('.', $cleanText);
//         $combinedAudioData = '';
//         $hasAudioData = false;

//         foreach ($textChunks as $chunk) {
//             $chunk = trim($chunk);
//             if (empty($chunk)) continue;

//             // إذا كانت الجملة طويلة جداً، نقسمها بناءً على الفواصل
//             $subChunks = mb_str_split($chunk, 90); 

//             foreach ($subChunks as $subChunk) {
//                 $subChunk = trim($subChunk);
//                 if (empty($subChunk)) continue;

//                 $encodedText = urlencode($subChunk);
//                 $ttsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q={$encodedText}";
                
//                 $chunkAudio = @file_get_contents($ttsUrl);
                
//                 if ($chunkAudio !== false) {
//                     // دمج البيانات الصوتية الخام (تشتغل بسلاسة لأنها بصيغة MP3 متطابقة الترميز)
//                     $combinedAudioData .= $chunkAudio;
//                     $hasAudioData = true;
//                 }
//             }
//         }

//         if (!$hasAudioData) {
//             return response()->json(['success' => false, 'message' => 'فشل السيرفر في توليد الصوت الراجع.'], 500);
//         }
        
//         // 4. حفظ ملف الـ MP3 المدمج النهائي
//         $audioFileName = 'reply_' . time() . '_' . uniqid() . '.mp3';
        
//         if (!Storage::disk('public')->exists('audio')) {
//             Storage::disk('public')->makeDirectory('audio');
//         }
        
//         Storage::disk('public')->put('audio/' . $audioFileName, $combinedAudioData);
//         $finalAudioUrl = asset('storage/audio/' . $audioFileName);

//         return response()->json([
//             'success' => true,
//             'text' => $aiTextResult,
//             'audio_url' => $finalAudioUrl
//         ], 200);

//     } catch (\Exception $e) {
//         return response()->json([
//             'success' => false, 
//             'message' => 'خطأ داخلي بالسيرفر: ' . $e->getMessage()
//         ], 500);
//     }
// }
// public function searchAudio(Request $request)
//     {
//         $fileContents = null;
//         $fileName = 'voice_' . time() . '.webm';

//         // 1. التحقق المرن من طريقة إرسال الملف (كـ Form Data أو كـ Raw Blob)
//         if ($request->hasFile('audio') && $request->file('audio')->isValid()) {
//             $fileContents = file_get_contents($request->file('audio')->getRealPath());
//         } else if ($request->getContent()) {
//             $fileContents = $request->getContent();
//         }

//         if (!$fileContents || strlen($fileContents) < 100) {
//             return response()->json([
//                 'success' => false, 
//                 'message' => 'ملف الصوت المستلم فارغ أو غير واضح، حاول التحدث مجدداً يا بطل!'
//             ], 400);
//         }

//         try {
//             // 2. تحويل صوت الطفل إلى نص مكتوب عبر Groq Whisper
//             $whisperResponse = Http::withoutVerifying()
//                 ->withToken(env('GROQ_API_KEY'))
//                 ->attach('file', $fileContents, $fileName)
//                 ->post('https://api.groq.com/openai/v1/audio/transcriptions', [
//                     'model' => 'whisper-large-v3',
//                     'language' => 'ar'
//                 ]);

//             if (!$whisperResponse->successful()) {
//                 return response()->json([
//                     'success' => false, 
//                     'message' => 'لم أستطع تفسير الصوت من خادم معالجة الكلمات.'
//                 ], 400);
//             }

//             $userTextPrompt = $whisperResponse->json()['text'] ?? '';

//             if (empty(trim($userTextPrompt))) {
//                 return response()->json([
//                     'success' => false, 
//                     'message' => 'أوه! لم أسمع أي كلام واضح، اضغط على المايك وتحدث مرة أخرى.'
//                 ], 400);
//             }

//             // 3. توليد رد تربوي وذكي يناسب الأطفال عبر OpenRouter
//             $aiResponse = Http::withoutVerifying()
//                 ->withHeaders([
//                     'Authorization' => 'Bearer ' . env('AI_API_KEY'),
//                     'Content-Type'  => 'application/json',
//                 ])
//                 ->post('https://openrouter.ai/api/v1/chat/completions', [
//                     'model' => 'openrouter/auto',
//                     'messages' => [[
//                         'role' => 'user', 
//                         'content' => $userTextPrompt . ' (تخيل أنك معلم ومربي ذكي للأطفال، أجب على هذا الطفل بأسلوب مشجع ومبسط جداً وبدون استخدام علامات النجوم ** أو التنسيقات البرمجية المعقدة لتناسب القراءة الصوتية)'
//                     ]],
//                     'temperature' => 0.7
//                 ]);

//             if (!$aiResponse->successful()) {
//                 return response()->json([
//                     'success' => false, 
//                     'message' => 'فشل في استدعاء عقل الذكاء الاصطناعي لتوليد الرد.'
//                 ], 400);
//             }

//             $aiTextResult = $aiResponse->json()['choices'][0]['message']['content'];
            
//             // تنظيف النص تماماً من أي نجوم وتنسيقات تفسد جودة نطق الآلة للطفل
//             $cleanText = str_replace(['**', '*', '#', '`'], '', $aiTextResult);

//             // 4. تقطيع النص الطويل (Chunking) لضمان عدم حظره أو بتره من Google TTS القياسي
//             $textChunks = explode('.', $cleanText);
//             $combinedAudioData = '';
//             $hasAudioData = false;

//             foreach ($textChunks as $chunk) {
//                 $chunk = trim($chunk);
//                 if (empty($chunk)) continue;

//                 // إذا كانت هناك جملة طويلة جداً بدون نقاط، نقسمها لأجزاء تحت الـ 90 حرفاً
//                 $subChunks = $this->mbStrSplit($chunk, 90); 

//                 foreach ($subChunks as $subChunk) {
//                     $subChunk = trim($subChunk);
//                     if (empty($subChunk)) continue;

//                     $encodedText = urlencode($subChunk);
//                     $ttsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q={$encodedText}";
                    
//                     $chunkAudio = @file_get_contents($ttsUrl);
                    
//                     if ($chunkAudio !== false) {
//                         // دمج كتل الـ MP3 الصوتية الخام بسلاسة خلف الكواليس لتعطي ملفاً متصلاً كاملاً
//                         $combinedAudioData .= $chunkAudio;
//                         $hasAudioData = true;
//                     }
//                 }
//             }

//             if (!$hasAudioData) {
//                 return response()->json([
//                     'success' => false, 
//                     'message' => 'نجح توليد النص ولكن فشل النظام في تحويله لصوت راجع.'
//                 ], 500);
//             }
            
//             // 5. حفظ ملف الـ MP3 المدمج الكامل في المجلد العام (Public Storage)
//             $audioFileName = 'reply_' . time() . '_' . uniqid() . '.mp3';
            
//             if (!Storage::disk('public')->exists('audio')) {
//                 Storage::disk('public')->makeDirectory('audio');
//             }
            
//             Storage::disk('public')->put('audio/' . $audioFileName, $combinedAudioData);
//             $finalAudioUrl = asset('storage/audio/' . $audioFileName);

//             // 6. إرجاع النتيجة الكاملة متوافقة مع واجهة الشات والشخصية الكرتونية
//             return response()->json([
//                 'success' => true,
//                 'text' => $aiTextResult,           // رد الـ AI المكتوب في الشات
//                 'user_text' => $userTextPrompt,   // النص الذي نطقه الطفل ليظهر في فقاعته
//                 'audio_url' => $finalAudioUrl     // رابط ملف الصوت المدمج الكامل للتشغيل
//             ], 200);

//         } catch (\Exception $e) {
//             return response()->json([
//                 'success' => false, 
//                 'message' => 'خطأ داخلي في السيرفر الخلفي: ' . $e->getMessage()
//             ], 500);
//         }
//     }

//     /**
//      * دالة مساعدة لتقطيع النصوص الطويلة مع الحفاظ على الحروف العربية (Multi-byte).
//      */
//     private function mbStrSplit($string, $split_length = 1) {
//         if ($split_length <= 0) return false;
//         $array = array();
//         $strlen = mb_strlen($string);
//         for ($i = 0; $i < $strlen; $i += $split_length) {
//             $array[] = mb_substr($string, $i, $split_length);
//         }
//         return $array;
//     }
// // دالة مساعدة لتقطيع النصوص الطويلة مع الحفاظ على الحروف العربية (Multi-byte)
// function mb_str_split($string, $split_length = 1) {
//     if ($split_length <= 0) return false;
//     $array = array();
//     $strlen = mb_strlen($string);
//     for ($i = 0; $i < $strlen; $i += $split_length) {
//         $array[] = mb_substr($string, $i, $split_length);
//     }
//     return $array;
// }
}