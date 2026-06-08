
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper,
  Fade,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';

export default function AISearchText() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  
  // حالات تسجيل الصوت (Audio Recording States)
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  // دالة تشغيل وإيقاف المايكروفون
  const toggleRecording = async () => {
    if (isRecording) {
      // إيقاف التسجيل
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // بدء التسجيل - طلب إذن المايكروفون من المستخدم
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // تجميع جزيئات الصوت في ملف واحد بصيغة audio/webm
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // إيقاف عمل المايكروفون في الخلفية بعد الانتهاء
          stream.getTracks().forEach(track => track.stop());

          // إرسال الملف الصوتي إلى السيرفر الخلفي
          await sendAudioToBackend(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setError('');
      } catch (err) {
        console.error('تعذر الوصول إلى المايكروفون:', err);
        setError('يرجى السماح بالوصول إلى المايكروفون لتتمكن من التسجيل من المتصفح.');
      }
    }
  };

  // دالة إرسال الملف الصوتي عبر FormData إلى Laravel ليرد بتسجيل صوتي حقيقي
const sendAudioToBackend = async (audioBlob) => {
  setLoading(true);
  setError('');
  
  setChatHistory(prev => [...prev, { role: 'user', text: '🎤 [رسالة صوتية]' }]);

  // تأمين صياغة الملف الصوتي كملف ويف/ويب إم قياسي مدعوم من PHP
  const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

  const formData = new FormData();
  formData.append('audio', audioFile); 

  try {
    const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });

    if (res.data.success) {
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: res.data.text,
        audioUrl: res.data.audio_url 
      }]);

      if (res.data.audio_url) {
        // عزل تشغيل الصوت في كتلة مستقلة تماماً لحماية حالة الـ Error من سياسات المتصفح
        try {
          const audioResponse = new Audio(res.data.audio_url);
          audioResponse.volume = 1.0; 
          await audioResponse.play();
        } catch (playbackError) {
          console.warn("المتصفح حظر التشغيل التلقائي مؤقتاً لحين تفاعل المستخدم:", playbackError);
        }
      }

    } else {
      setError(res.data.message || 'حدث خطأ ما أثناء معالجة الصوت.');
    }
  } catch (err) {
    console.error("خطأ الاتصال بالسيرفر:", err);
    const serverErrorMessage = err.response?.data?.message || 'فشلت معالجة الصوت في السيرفر الخلفي.';
    setError(serverErrorMessage);
  } finally {
    setLoading(false);
  }
};
  // دالة إرسال النص العادية
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userQuestion = prompt.trim();
    setLoading(true);
    setError('');
    setPrompt('');

    setChatHistory(prev => [...prev, { role: 'user', text: userQuestion }]);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai/search', { prompt: userQuestion });
      if (res.data.success) {
        setChatHistory(prev => [...prev, { role: 'ai', text: res.data.text }]);
      } else {
        setError(res.data.message || 'حدث خطأ ما.');
      }
    } catch (err) {
      setError('تعذر الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setError('');
  };

  return (
    <Box sx={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: 3, backgroundColor: '#0a0b10', direction: 'rtl' }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
          
          <Box sx={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#1a237e' }}>
              المساعد الصوتي والذكي
            </Typography>
            {chatHistory.length > 0 && (
              <Button onClick={clearChat} variant="text" color="error" startIcon={<DeleteIcon sx={{ ml: 1, mr: 0 }} />} sx={{ fontFamily: 'A, sans-serif', fontWeight: 900 }}>
                مسح المحادثة
              </Button>
            )}
          </Box>

          {/* مساحة عرض المحادثة المطورة بفقاعات التسجيلات الصوتية */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 3, pr: 1, pl: 1, maxHeight: '45vh', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '4px' } }}>
            {chatHistory.map((msg, index) => (
              <Box key={index} sx={{ mb: 3, textAlign: 'right' }}>
                {msg.role === 'user' ? (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#1a237e !important', mb: 0.5 }}>أنت:</Typography>
                    <Paper elevation={0} sx={{ p: 2, display: 'inline-block', borderRadius: '12px 0px 12px 12px', backgroundColor: '#e8eaf6', fontFamily: 'A, sans-serif', fontWeight: 900, color: '#1a237e !important', maxWidth: '85%' }}>
                      {msg.text}
                    </Paper>
                  </Box>
                ) : (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#666666 !important', mb: 0.5 }}>الرد الصوتي الذكي:</Typography>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: '0px 12px 12px 12px', 
                        backgroundColor: '#f5f6fa', 
                        borderRight: '4px solid #1a237e', 
                        display: 'inline-flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        minWidth: '280px',
                        maxWidth: '85%'
                      }}
                    >
                      {/* ترويسة التسجيل الراجع */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1a237e' }}>
                        <MicIcon fontSize="small" />
                        <Typography sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, fontSize: '0.95rem' }}>
                          تسجيل صوتي راجع
                        </Typography>
                      </Box>

                      {/* مشغل التسجيل الصوتي المتزامن */}
                      {msg.audioUrl ? (
                        <Box sx={{ width: '100%', mt: 0.5 }}>
                          <audio src={msg.audioUrl} controls style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
                        </Box>
                      ) : (
                        <Typography sx={{ fontFamily: 'A, sans-serif', fontWeight: 100, lineHeight: 1.8, color: '#2c3e50 !important', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                          {msg.text}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                )}
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={18} sx={{ color: '#1a237e' }} />
                <Typography sx={{ fontFamily: 'A, sans-serif', fontSize: '0.9rem', color: '#666' }}>
                  {isRecording ? 'جاري الاستماع وتسجيل صوتك الآن...' : 'جاري تفكير وتوليد الرد الصوتي والذكاء الاصطناعي...'}
                </Typography>
              </Box>
            )}

            {error && <Box sx={{ p: 2, mt: 2, borderRadius: '8px', backgroundColor: '#ffebee', borderLeft: '4px solid #d32f2f', color: '#c62828 !important', fontFamily: 'A, sans-serif' }}>{error}</Box>}
            <div ref={chatBottomRef} />
          </Box>

          <hr style={{ border: '0', borderTop: '1px solid #e0e0e0', marginBottom: '20px' }} />

          {/* حقل الإدخال السفلي المطور بالمايكروفون والأنميشن الخاطف */}
          <Box component="form" onSubmit={handleSearch}>
            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch' }}>
              
              {/* زر المايكروفون الأنيق بالتأثيرات الحركية */}
              <IconButton 
                onClick={toggleRecording}
                disabled={loading && !isRecording}
                sx={{
                  backgroundColor: isRecording ? '#d32f2f' : '#e8eaf6',
                  color: isRecording ? '#ffffff' : '#1a237e',
                  borderRadius: '8px',
                  width: '54px',
                  height: '54px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: isRecording ? '#b71c1c' : '#c5cae9',
                  },
                  '&:active': { transform: 'scale(0.92)' }
                }}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </IconButton>

              <TextField
                fullWidth
                variant="outlined"
                placeholder={isRecording ? "جاري التسجيل... اضغط على المربع الأحمر للإرسال" : "اكتب سؤالاً أو سجل صوتك عبر المايكروفون..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading || isRecording}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'A, sans-serif', borderRadius: '8px', backgroundColor: '#fafafa', color: '#2c3e50 !important',
                    '& fieldset': { borderColor: '#cccccc !important' },
                    '&:hover fieldset': { borderColor: '#1a237e !important' },
                    '&.Mui-focused fieldset': { borderColor: '#1a237e !important', borderWidth: '2px' },
                  },
                  '& .MuiInputBase-input': { color: '#2c3e50 !important', '-webkit-text-fill-color': '#2c3e50 !important' },
                  '& .MuiInputBase-input::placeholder': { color: '#7f8c8d !important', opacity: '1 !important', '-webkit-text-fill-color': '#7f8c8d !important' }
                }}
              />

              <Button
                type="submit"
                disabled={loading || !prompt.trim() || isRecording}
                startIcon={!loading && <SearchIcon sx={{ ml: 1, mr: 0 }} />}
                sx={{
                  fontFamily: 'A, sans-serif', fontWeight: 900, fontSize: '1.1rem', backgroundColor: '#1a237e', color: '#ffffff !important', px: 4, py: { xs: 1.5, sm: 0 }, borderRadius: '8px', whiteSpace: 'nowrap', minWidth: '140px',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { backgroundColor: '#12185c', boxShadow: '0px 6px 20px rgba(26, 35, 126, 0.4)', transform: 'translateY(-2px)' },
                  '&:active': { transform: 'scale(0.95) translateY(0px)' },
                  '&:disabled': { backgroundColor: '#e0e0e0 !important', color: '#9e9e9e !important', transform: 'none !important', boxShadow: 'none !important' }
                }}
              >
                {loading && !isRecording ? <CircularProgress size={24} color="inherit" /> : 'إرسال'}
              </Button>
            </Box>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}