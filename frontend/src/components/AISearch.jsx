import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Paper,
  IconButton,
  Zoom,
  Button,
  TextField,
  keyframes,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import axios from 'axios';

// --- تأثيرات حركية مبهجة للطفل (CSS Animations) ---
const bounce = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-12px) scale(1.05); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 107, 107, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
`;

const spinAndWin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const talking = keyframes`
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.12) scaleX(1.02); }
`;

export default function AISearch() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false); 
  const [inputMode, setInputMode] = useState('audio'); 
  const [textQuery, setTextQuery] = useState(''); 
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'أهلاً بك يا بطل! اختر من الأعلى كيف تريد سؤالي اليوم، بالكلام أم بالكتابة؟ 🌟' }
  ]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  // 🎤 دالة تشغيل وإيقاف المايكروفون
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
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
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          await sendAudioToBackend(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setError('');
      } catch (err) {
        console.error('تعذر الوصول إلى المايكروفون:', err);
        setError('يا بطل، يرجى السماح للمتصفح باستخدام المايكروفون لنبدأ اللعب معاً!');
      }
    }
  };

  // 🎤 دالة إرسال الصوت
  const sendAudioToBackend = async (audioBlob) => {
    setLoading(true);
    setError('');
    
    setChatHistory(prev => [...prev, { role: 'user', text: '🎤 [رسالة صوتية من البطل]' }]);

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
        setChatHistory(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'user') {
            updated[updated.length - 1].text = `👦: ${res.data.user_text || 'تحدّثتَ بصوتك البطل'}`;
          }
          return [...updated, { 
            role: 'ai', 
            text: res.data.text,
            audioUrl: res.data.audio_url 
          }];
        });

        if (res.data.audio_url) {
          playAudioResponse(res.data.audio_url);
        }
      } else {
        setError(res.data.message || 'أوه! حدث خطأ بسيط، أعد المحاولة يا بطل.');
      }
    } catch (err) {
      console.error("خطأ الاتصال:", err);
      setError(err.response?.data?.message || 'لم أستطع سماعك جيداً، هل يمكنك المحاولة مرة أخرى؟');
    } finally {
      setLoading(false);
    }
  };

  // ✍️ دالة إرسال البحث النصي
  const handleTextSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!textQuery.trim() || loading) return;

    const query = textQuery.trim();
    setTextQuery('');
    setLoading(true);
    setError('');

    setChatHistory(prev => [...prev, { role: 'user', text: `✍️ البطل يسأل: ${query}` }]);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', { text_prompt: query }, {
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (res.data.success) {
        setChatHistory(prev => [...prev, { 
          role: 'ai', 
          text: res.data.text,
          audioUrl: res.data.audio_url 
        }]);

        if (res.data.audio_url) {
          playAudioResponse(res.data.audio_url);
        }
      } else {
        setError(res.data.message || 'أوه! حدث خطأ في معالجة النص.');
      }
    } catch (err) {
      console.error("خطأ الاتصال بالنص:", err);
      setError(err.response?.data?.message || 'تعذر الاتصال بالسيرفر للحصول على نتائج البحث.');
    } finally {
      setLoading(false);
    }
  };

  const playAudioResponse = (url) => {
    try {
      const audioResponse = new Audio(url);
      audioResponse.volume = 1.0;
      audioResponse.onplay = () => setIsPlayingAudio(true);
      audioResponse.onended = () => setIsPlayingAudio(false);
      audioResponse.play().catch(e => {
        console.warn("المتصفح حظر التشغيل التلقائي مؤقتاً:", e);
        setIsPlayingAudio(false);
      });
    } catch (playbackError) {
      console.error(playbackError);
      setIsPlayingAudio(false);
    }
  };

  const getCharacterDesign = () => {
    if (isRecording) {
      return { emoji: '🧐', animation: `${pulse} 1.2s infinite ease-in-out`, bgColor: '#ff7675', statusText: 'جاري الاستماع لصوتك العذب...' };
    }
    if (loading) {
      return { emoji: '🚀', animation: `${spinAndWin} 2s infinite linear`, bgColor: '#fdcb6e', statusText: 'أفكر في إجابة ذكية وممتعة لك...' };
    }
    if (isPlayingAudio) {
      return { emoji: '🥳', animation: `${talking} 0.5s infinite ease-in-out`, bgColor: '#2ecc71', statusText: 'أنا أتحدث إليك الآن! 🎵' };
    }
    return { emoji: '🤖', animation: `${bounce} 2.5s infinite ease-in-out`, bgColor: isDarkMode ? '#0984e3' : '#74b9ff', statusText: 'أنا جاهز ومتحمس لمساعدتك!' };
  };

  const character = getCharacterDesign();

  const clearChat = () => {
    setChatHistory([{ role: 'ai', text: 'أهلاً بك مجدداً يا بطل! اختر كيف تريد سؤالي الآن وابدأ فوراً. 🌟' }]);
    setError('');
  };

  return (
    <Box sx={{ 
      minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, 
      backgroundColor: theme.palette.background.default, 
      backgroundImage: isDarkMode 
        ? 'radial-gradient(#2c3e50 20%, transparent 20%), radial-gradient(#1e272e 20%, transparent 20%)'
        : 'radial-gradient(#dff9fb 20%, transparent 20%), radial-gradient(#f1f2f6 20%, transparent 20%)',
      backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px', direction: 'rtl' 
    }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ 
          p: { xs: 2.5, md: 4 }, borderRadius: '32px', 
          backgroundColor: theme.palette.background.paper, 
          boxShadow: isDarkMode ? '0px 20px 40px rgba(0, 0, 0, 0.5)' : '0px 20px 40px rgba(116, 185, 255, 0.25)', 
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', border: `4px solid ${isDarkMode ? '#0984e3' : '#74b9ff'}`, maxHeight: '88vh'
        }}>
          
          {/* الترويسة العليا */}
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: isDarkMode ? '#64b5f6' : '#0984e3' }}>
              صديقي الذكي 🤖✨
            </Typography>
            {chatHistory.length > 1 && (
              <IconButton onClick={clearChat} color="error" title="ابدأ من جديد">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          {/* أزرار تبديل الوضع (صوت / نص) */}
          <Box sx={{ 
            display: 'flex', gap: 1, p: 0.5, width: '100%', 
            backgroundColor: isDarkMode ? '#1e272e' : '#f1f2f6', 
            borderRadius: '20px', mb: 2, border: `1px solid ${theme.palette.divider}` 
          }}>
            <Button
              fullWidth
              variant={inputMode === 'audio' ? 'contained' : 'text'}
              onClick={() => { if(!loading && !isRecording) setInputMode('audio'); }}
              startIcon={<MicIcon sx={{ ml: 0.5, mr: 0 }} />}
              sx={{
                borderRadius: '16px', fontFamily: 'Cairo, sans-serif', fontWeight: 800,
                backgroundColor: inputMode === 'audio' ? (isDarkMode ? '#0984e3' : '#74b9ff') : 'transparent',
                color: inputMode === 'audio' ? '#ffffff' : (isDarkMode ? '#95a5a6' : '#636e72'),
                '&:hover': { backgroundColor: inputMode === 'audio' ? '#0984e3' : (isDarkMode ? '#2c3e50' : '#e4e7eb') }
              }}
            >
              تسجيل صوتي 🎤
            </Button>
            <Button
              fullWidth
              variant={inputMode === 'text' ? 'contained' : 'text'}
              onClick={() => { if(!loading && !isRecording) setInputMode('text'); }}
              startIcon={<KeyboardIcon sx={{ ml: 0.5, mr: 0 }} />}
              sx={{
                borderRadius: '16px', fontFamily: 'Cairo, sans-serif', fontWeight: 800,
                backgroundColor: inputMode === 'text' ? '#00b894' : 'transparent',
                color: inputMode === 'text' ? '#ffffff' : (isDarkMode ? '#95a5a6' : '#636e72'),
                '&:hover': { backgroundColor: inputMode === 'text' ? '#009473' : (isDarkMode ? '#2c3e50' : '#e4e7eb') }
              }}
            >
              كتابة نصية ✍️
            </Button>
          </Box>

          {/* الأفاتار المتحرك */}
          <Zoom in={true}>
            <Box sx={{ 
              width: '110px', height: '110px', borderRadius: '50%', backgroundColor: character.bgColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', 
              animation: character.animation, boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
              border: '5px solid #ffffff', mb: 0.5, userSelect: 'none'
            }}>
              {character.emoji}
            </Box>
          </Zoom>

          <Typography variant="caption" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: isDarkMode ? '#fff' : character.bgColor, mb: 1.5 }}>
            {character.statusText}
          </Typography>

          {/* منطقة الشات والرسائل */}
          <Box sx={{ 
            width: '100%', flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, maxHeight: '33vh',
            display: 'flex', flexDirection: 'column', gap: 2,
            '&::-webkit-scrollbar': { width: '6px' }, 
            '&::-webkit-scrollbar-thumb': { backgroundColor: isDarkMode ? '#0984e3' : '#74b9ff', borderRadius: '10px' }
          }}>
            {chatHistory.map((msg, index) => (
              <Box key={index} sx={{ alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end', width: '100%', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end' }}>
                <Paper elevation={1} sx={{ 
                  p: 2, borderRadius: msg.role === 'user' ? '24px 24px 24px 4px' : '24px 24px 4px 24px',
                  backgroundColor: msg.role === 'user' 
                    ? (isDarkMode ? '#1e3a8a' : '#e3f2fd') 
                    : (isDarkMode ? '#065f46' : '#e8f5e9'),
                  borderRight: msg.role === 'user' 
                    ? `6px solid ${isDarkMode ? '#3b82f6' : '#2196f3'}` 
                    : `6px solid ${isDarkMode ? '#10b981' : '#4caf50'}`,
                  maxWidth: '85%'
                }}>
                  <Typography sx={{ 
                    fontFamily: 'Cairo, sans-serif', 
                    fontWeight: 700, 
                    color: isDarkMode ? '#ffffff' : '#2d3436', 
                    fontSize: '1rem', lineHeight: 1.6 
                  }}>
                    {msg.text}
                  </Typography>
                  
                  {msg.role === 'ai' && msg.audioUrl && (
                    <Button 
                      onClick={() => playAudioResponse(msg.audioUrl)}
                      variant="text" 
                      size="small" 
                      startIcon={<PlayArrowIcon sx={{ ml: 0.5, mr: 0 }} />}
                      sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: isDarkMode ? '#34d399' : '#4caf50', mt: 1, p: 0 }}
                    >
                      استمع مرة أخرى 🎧
                    </Button>
                  )}
                </Paper>
              </Box>
            ))}
            
            {loading && (
              <Box sx={{ 
                display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-end', 
                backgroundColor: isDarkMode ? '#2c3e50' : '#fff9db', 
                p: 1.5, borderRadius: '16px', border: '1px dashed #fdcb6e' 
              }}>
                <CircularProgress size={16} sx={{ color: '#fdcb6e' }} />
                <Typography sx={{ fontFamily: 'Cairo, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: isDarkMode ? '#fff' : '#6d4c41' }}>
                  جاري تجهيز رد ذكي وساحر... ✨
                </Typography>
              </Box>
            )}
            
            <div ref={chatBottomRef} />
          </Box>

          {error && (
            <Box sx={{ p: 2, mb: 2, width: '100%', borderRadius: '16px', backgroundColor: '#ffebee', border: '2px solid #ff7675', color: '#d63031', fontFamily: 'Cairo, sans-serif', fontWeight: 700, textAlign: 'center' }}>
              {error}
            </Box>
          )}

          {/* منطقة التحكم والمدخلات السفلية */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 'auto', minHeight: '90px', alignItems: 'center' }}>
            
            {/* وضع المايكروفون */}
            {inputMode === 'audio' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
                <IconButton 
                  onClick={toggleRecording}
                  disabled={loading}
                  sx={{
                    backgroundColor: isRecording ? '#ff7675' : (isDarkMode ? '#0984e3' : '#74b9ff'), 
                    color: '#ffffff', borderRadius: '50%', width: '80px', height: '80px',
                    boxShadow: isRecording ? '0px 0px 25px #ff7675' : '0px 8px 20px rgba(0,0,0,0.3)',
                    animation: isRecording ? `${pulse} 1s infinite` : 'none',
                    '&:hover': { backgroundColor: isRecording ? '#e17055' : '#0984e3', transform: 'scale(1.06)' }
                  }}
                >
                  {isRecording ? <StopIcon sx={{ fontSize: '40px' }} /> : <MicIcon sx={{ fontSize: '40px' }} />}
                </IconButton>
                <Typography variant="body2" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: isRecording ? '#ff7675' : (isDarkMode ? '#64b5f6' : '#0984e3') }}>
                  {isRecording ? 'اضغط هنا للإنهاء والإرسال 🌟' : 'اضغط على المايك وابدأ الكلام! 🎤'}
                </Typography>
              </Box>
            )}

            {/* وضع كتابة النص */}
            {inputMode === 'text' && (
              <Box 
                component="form" 
                onSubmit={handleTextSearchSubmit} 
                sx={{ 
                  width: '100%', 
                  display: 'flex', 
                  gap: 1.5, 
                  alignItems: 'center', 
                  px: 1 
                }}
              >
                <TextField
                  fullWidth
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  disabled={loading}
                  placeholder="اكتب سؤالك هنا يا بطل... 🔍"
                  variant="outlined"
                  InputProps={{
                    sx: {
                      borderRadius: '20px',
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 700,
                      backgroundColor: isDarkMode ? '#1e272e' : '#f8f9fa',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      '& fieldset': { borderColor: isDarkMode ? '#555' : '#ccc', borderWidth: '1.5px' },
                      '&:hover fieldset': { borderColor: '#00b894' },
                      '&.Mui-focused fieldset': { borderColor: '#00b894', borderWidth: '2px' },
                      '& input::placeholder': { color: isDarkMode ? '#95a5a6' : '#7f8c8d', opacity: 1 }
                    }
                  }}
                />

                {/* زر الإرسال المنفصل تماماً والكبير الخارجي */}
                <Button
                  type="submit"
                  disabled={loading || !textQuery.trim()}
                  variant="contained"
                  endIcon={<SendIcon sx={{ transform: 'rotate(180deg)', mr: 0.5, ml: 0 }} />}
                  sx={{
                    minWidth: '110px',
                    height: '56px', // متوافق تماماً مع نفس الارتفاع الافتراضي للـ TextField
                    borderRadius: '20px',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 900,
                    fontSize: '1rem',
                    backgroundColor: isDarkMode ? '#00e676' : '#00b894', 
                    color: isDarkMode ? '#000000' : '#ffffff', 
                    boxShadow: isDarkMode ? '0px 4px 14px rgba(0, 230, 118, 0.4)' : '0px 4px 10px rgba(0, 184, 148, 0.3)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#00c853' : '#009473',
                      transform: 'scale(1.03)'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: isDarkMode ? '#2c3e50' : '#e4e7eb',
                      color: isDarkMode ? '#7f8c8d' : '#a4b0be'
                    }
                  }}
                >
                  إرسال
                </Button>
              </Box>
            )}

          </Box>

        </Paper>
      </Container>
    </Box>
  );
}














// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Box, 
//   Container, 
//   Typography, 
//   CircularProgress, 
//   Paper,
//   IconButton,
//   Zoom,
//   Button,
//   TextField,
//   InputAdornment,
//   keyframes,
//   useTheme
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import MicIcon from '@mui/icons-material/Mic';
// import StopIcon from '@mui/icons-material/Stop';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// import SendIcon from '@mui/icons-material/Send';
// import KeyboardIcon from '@mui/icons-material/Keyboard';
// import axios from 'axios';

// // --- تأثيرات حركية مبهجة للطفل (CSS Animations) ---
// const bounce = keyframes`
//   0%, 100% { transform: translateY(0) scale(1); }
//   50% { transform: translateY(-12px) scale(1.05); }
// `;

// const pulse = keyframes`
//   0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
//   70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 107, 107, 0); }
//   100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
// `;

// const spinAndWin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;

// const talking = keyframes`
//   0%, 100% { transform: scaleY(1); }
//   50% { transform: scaleY(1.12) scaleX(1.02); }
// `;

// export default function AISearch() {
//   const theme = useTheme();
//   const isDarkMode = theme.palette.mode === 'dark';

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false); 
//   const [inputMode, setInputMode] = useState('audio'); 
//   const [textQuery, setTextQuery] = useState(''); 
//   const [chatHistory, setChatHistory] = useState([
//     { role: 'ai', text: 'أهلاً بك يا بطل! اختر من الأعلى كيف تريد سؤالي اليوم، بالكلام أم بالكتابة؟ 🌟' }
//   ]);
  
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const chatBottomRef = useRef(null);

//   useEffect(() => {
//     if (chatBottomRef.current) {
//       chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [chatHistory, loading]);

//   // 🎤 دالة تشغيل وإيقاف المايكروفون
//   const toggleRecording = async () => {
//     if (isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     } else {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioChunksRef.current = [];
        
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = mediaRecorder;

//         mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorder.onstop = async () => {
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//           stream.getTracks().forEach(track => track.stop());
//           await sendAudioToBackend(audioBlob);
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//         setError('');
//       } catch (err) {
//         console.error('تعذر الوصول إلى المايكروفون:', err);
//         setError('يا بطل، يرجى السماح للمتصفح باستخدام المايكروفون لنبدأ اللعب معاً!');
//       }
//     }
//   };

//   // 🎤 دالة إرسال الصوت
//   const sendAudioToBackend = async (audioBlob) => {
//     setLoading(true);
//     setError('');
    
//     setChatHistory(prev => [...prev, { role: 'user', text: '🎤 [رسالة صوتية من البطل]' }]);

//     const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
//     const formData = new FormData();
//     formData.append('audio', audioFile); 

//     try {
//       const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', formData, {
//         headers: { 
//           'Content-Type': 'multipart/form-data',
//           'Accept': 'application/json'
//         }
//       });

//       if (res.data.success) {
//         setChatHistory(prev => {
//           const updated = [...prev];
//           if (updated.length > 0 && updated[updated.length - 1].role === 'user') {
//             updated[updated.length - 1].text = `👦: ${res.data.user_text || 'تحدّثتَ بصوتك البطل'}`;
//           }
//           return [...updated, { 
//             role: 'ai', 
//             text: res.data.text,
//             audioUrl: res.data.audio_url 
//           }];
//         });

//         if (res.data.audio_url) {
//           playAudioResponse(res.data.audio_url);
//         }
//       } else {
//         setError(res.data.message || 'أوه! حدث خطأ بسيط، أعد المحاولة يا بطل.');
//       }
//     } catch (err) {
//       console.error("خطأ الاتصال:", err);
//       setError(err.response?.data?.message || 'لم أستطع سماعك جيداً، هل يمكنك المحاولة مرة أخرى؟');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✍️ دالة إرسال البحث النصي
//   const handleTextSearchSubmit = async (e) => {
//     if (e) e.preventDefault();
//     if (!textQuery.trim() || loading) return;

//     const query = textQuery.trim();
//     setTextQuery('');
//     setLoading(true);
//     setError('');

//     setChatHistory(prev => [...prev, { role: 'user', text: `✍️ البطل يسأل: ${query}` }]);

//     try {
//       const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', { text_prompt: query }, {
//         headers: { 
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });

//       if (res.data.success) {
//         setChatHistory(prev => [...prev, { 
//           role: 'ai', 
//           text: res.data.text,
//           audioUrl: res.data.audio_url 
//         }]);

//         if (res.data.audio_url) {
//           playAudioResponse(res.data.audio_url);
//         }
//       } else {
//         setError(res.data.message || 'أوه! حدث خطأ في معالجة النص.');
//       }
//     } catch (err) {
//       console.error("خطأ الاتصال بالنص:", err);
//       setError(err.response?.data?.message || 'تعذر الاتصال بالسيرفر للحصول على نتائج البحث.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const playAudioResponse = (url) => {
//     try {
//       const audioResponse = new Audio(url);
//       audioResponse.volume = 1.0;
//       audioResponse.onplay = () => setIsPlayingAudio(true);
//       audioResponse.onended = () => setIsPlayingAudio(false);
//       audioResponse.play().catch(e => {
//         console.warn("المتصفح حظر التشغيل التلقائي مؤقتاً:", e);
//         setIsPlayingAudio(false);
//       });
//     } catch (playbackError) {
//       console.error(playbackError);
//       setIsPlayingAudio(false);
//     }
//   };

//   const getCharacterDesign = () => {
//     if (isRecording) {
//       return { emoji: '🧐', animation: `${pulse} 1.2s infinite ease-in-out`, bgColor: '#ff7675', statusText: 'جاري الاستماع لصوتك العذب...' };
//     }
//     if (loading) {
//       return { emoji: '🚀', animation: `${spinAndWin} 2s infinite linear`, bgColor: '#fdcb6e', statusText: 'أفكر في إجابة ذكية وممتعة لك...' };
//     }
//     if (isPlayingAudio) {
//       return { emoji: '🥳', animation: `${talking} 0.5s infinite ease-in-out`, bgColor: '#2ecc71', statusText: 'أنا أتحدث إليك الآن! 🎵' };
//     }
//     return { emoji: '🤖', animation: `${bounce} 2.5s infinite ease-in-out`, bgColor: isDarkMode ? '#0984e3' : '#74b9ff', statusText: 'أنا جاهز ومتحمس لمساعدتك!' };
//   };

//   const character = getCharacterDesign();

//   const clearChat = () => {
//     setChatHistory([{ role: 'ai', text: 'أهلاً بك مجدداً يا بطل! اختر كيف تريد سؤالي الآن وابدأ فوراً. 🌟' }]);
//     setError('');
//   };

//   return (
//     <Box sx={{ 
//       minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, 
//       backgroundColor: theme.palette.background.default, 
//       backgroundImage: isDarkMode 
//         ? 'radial-gradient(#2c3e50 20%, transparent 20%), radial-gradient(#1e272e 20%, transparent 20%)'
//         : 'radial-gradient(#dff9fb 20%, transparent 20%), radial-gradient(#f1f2f6 20%, transparent 20%)',
//       backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px', direction: 'rtl' 
//     }}>
//       <Container maxWidth="sm">
//         <Paper elevation={4} sx={{ 
//           p: { xs: 2.5, md: 4 }, borderRadius: '32px', 
//           backgroundColor: theme.palette.background.paper, 
//           boxShadow: isDarkMode ? '0px 20px 40px rgba(0, 0, 0, 0.5)' : '0px 20px 40px rgba(116, 185, 255, 0.25)', 
//           display: 'flex', flexDirection: 'column',
//           alignItems: 'center', border: `4px solid ${isDarkMode ? '#0984e3' : '#74b9ff'}`, maxHeight: '88vh'
//         }}>
          
//           {/* الترويسة العليا */}
//           <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//             <Typography variant="h5" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: isDarkMode ? '#64b5f6' : '#0984e3' }}>
//               صديقي الذكي 🤖✨
//             </Typography>
//             {chatHistory.length > 1 && (
//               <IconButton onClick={clearChat} color="error" title="ابدأ من جديد">
//                 <DeleteIcon />
//               </IconButton>
//             )}
//           </Box>

//           {/* أزرار تبديل الوضع (صوت / نص) */}
//           <Box sx={{ 
//             display: 'flex', gap: 1, p: 0.5, width: '100%', 
//             backgroundColor: isDarkMode ? '#1e272e' : '#f1f2f6', 
//             borderRadius: '20px', mb: 2, border: `1px solid ${theme.palette.divider}` 
//           }}>
//             <Button
//               fullWidth
//               variant={inputMode === 'audio' ? 'contained' : 'text'}
//               onClick={() => { if(!loading && !isRecording) setInputMode('audio'); }}
//               startIcon={<MicIcon sx={{ ml: 0.5, mr: 0 }} />}
//               sx={{
//                 borderRadius: '16px', fontFamily: 'Cairo, sans-serif', fontWeight: 800,
//                 backgroundColor: inputMode === 'audio' ? (isDarkMode ? '#0984e3' : '#74b9ff') : 'transparent',
//                 color: inputMode === 'audio' ? '#ffffff' : (isDarkMode ? '#95a5a6' : '#636e72'),
//                 '&:hover': { backgroundColor: inputMode === 'audio' ? '#0984e3' : (isDarkMode ? '#2c3e50' : '#e4e7eb') }
//               }}
//             >
//               تسجيل صوتي 🎤
//             </Button>
//             <Button
//               fullWidth
//               variant={inputMode === 'text' ? 'contained' : 'text'}
//               onClick={() => { if(!loading && !isRecording) setInputMode('text'); }}
//               startIcon={<KeyboardIcon sx={{ ml: 0.5, mr: 0 }} />}
//               sx={{
//                 borderRadius: '16px', fontFamily: 'Cairo, sans-serif', fontWeight: 800,
//                 backgroundColor: inputMode === 'text' ? '#00b894' : 'transparent',
//                 color: inputMode === 'text' ? '#ffffff' : (isDarkMode ? '#95a5a6' : '#636e72'),
//                 '&:hover': { backgroundColor: inputMode === 'text' ? '#009473' : (isDarkMode ? '#2c3e50' : '#e4e7eb') }
//               }}
//             >
//               كتابة نصية ✍️
//             </Button>
//           </Box>

//           {/* الأفاتار المتحرك */}
//           <Zoom in={true}>
//             <Box sx={{ 
//               width: '110px', height: '110px', borderRadius: '50%', backgroundColor: character.bgColor,
//               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', 
//               animation: character.animation, boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
//               border: '5px solid #ffffff', mb: 0.5, userSelect: 'none'
//             }}>
//               {character.emoji}
//             </Box>
//           </Zoom>

//           <Typography variant="caption" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: isDarkMode ? '#fff' : character.bgColor, mb: 1.5 }}>
//             {character.statusText}
//           </Typography>

//           {/* منطقة الشات والرسائل */}
//           <Box sx={{ 
//             width: '100%', flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, maxHeight: '33vh',
//             display: 'flex', flexDirection: 'column', gap: 2,
//             '&::-webkit-scrollbar': { width: '6px' }, 
//             '&::-webkit-scrollbar-thumb': { backgroundColor: isDarkMode ? '#0984e3' : '#74b9ff', borderRadius: '10px' }
//           }}>
//             {chatHistory.map((msg, index) => (
//               <Box key={index} sx={{ alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end', width: '100%', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end' }}>
//                 <Paper elevation={1} sx={{ 
//                   p: 2, borderRadius: msg.role === 'user' ? '24px 24px 24px 4px' : '24px 24px 4px 24px',
//                   backgroundColor: msg.role === 'user' 
//                     ? (isDarkMode ? '#1e3a8a' : '#e3f2fd') 
//                     : (isDarkMode ? '#065f46' : '#e8f5e9'),
//                   borderRight: msg.role === 'user' 
//                     ? `6px solid ${isDarkMode ? '#3b82f6' : '#2196f3'}` 
//                     : `6px solid ${isDarkMode ? '#10b981' : '#4caf50'}`,
//                   maxWidth: '85%'
//                 }}>
//                   <Typography sx={{ 
//                     fontFamily: 'Cairo, sans-serif', 
//                     fontWeight: 700, 
//                     color: isDarkMode ? '#ffffff' : '#2d3436', 
//                     fontSize: '1rem', lineHeight: 1.6 
//                   }}>
//                     {msg.text}
//                   </Typography>
                  
//                   {msg.role === 'ai' && msg.audioUrl && (
//                     <Button 
//                       onClick={() => playAudioResponse(msg.audioUrl)}
//                       variant="text" 
//                       size="small" 
//                       startIcon={<PlayArrowIcon sx={{ ml: 0.5, mr: 0 }} />}
//                       sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: isDarkMode ? '#34d399' : '#4caf50', mt: 1, p: 0 }}
//                     >
//                       استمع مرة أخرى 🎧
//                     </Button>
//                   )}
//                 </Paper>
//               </Box>
//             ))}
            
//             {loading && (
//               <Box sx={{ 
//                 display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-end', 
//                 backgroundColor: isDarkMode ? '#2c3e50' : '#fff9db', 
//                 p: 1.5, borderRadius: '16px', border: '1px dashed #fdcb6e' 
//               }}>
//                 <CircularProgress size={16} sx={{ color: '#fdcb6e' }} />
//                 <Typography sx={{ fontFamily: 'Cairo, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: isDarkMode ? '#fff' : '#6d4c41' }}>
//                   جاري تجهيز رد ذكي وساحر... ✨
//                 </Typography>
//               </Box>
//             )}
            
//             <div ref={chatBottomRef} />
//           </Box>

//           {error && (
//             <Box sx={{ p: 2, mb: 2, width: '100%', borderRadius: '16px', backgroundColor: '#ffebee', border: '2px solid #ff7675', color: '#d63031', fontFamily: 'Cairo, sans-serif', fontWeight: 700, textAlign: 'center' }}>
//               {error}
//             </Box>
//           )}

//           {/* منطقة التحكم والمدخلات السفلية */}
//           <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 'auto', minHeight: '90px', alignItems: 'center' }}>
            
//             {/* وضع المايكروفون */}
//             {inputMode === 'audio' && (
//               <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
//                 <IconButton 
//                   onClick={toggleRecording}
//                   disabled={loading}
//                   sx={{
//                     backgroundColor: isRecording ? '#ff7675' : (isDarkMode ? '#0984e3' : '#74b9ff'), 
//                     color: '#ffffff', borderRadius: '50%', width: '80px', height: '80px',
//                     boxShadow: isRecording ? '0px 0px 25px #ff7675' : '0px 8px 20px rgba(0,0,0,0.3)',
//                     animation: isRecording ? `${pulse} 1s infinite` : 'none',
//                     '&:hover': { backgroundColor: isRecording ? '#e17055' : '#0984e3', transform: 'scale(1.06)' }
//                   }}
//                 >
//                   {isRecording ? <StopIcon sx={{ fontSize: '40px' }} /> : <MicIcon sx={{ fontSize: '40px' }} />}
//                 </IconButton>
//                 <Typography variant="body2" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: isRecording ? '#ff7675' : (isDarkMode ? '#64b5f6' : '#0984e3') }}>
//                   {isRecording ? 'اضغط هنا للإنهاء والإرسال 🌟' : 'اضغط على المايك وابدأ الكلام! 🎤'}
//                 </Typography>
//               </Box>
//             )}

//             {/* وضع كتابة النص */}
//             {inputMode === 'text' && (
//               <Box component="form" onSubmit={handleTextSearchSubmit} sx={{ width: '100%', px: 1 }}>
//                 <TextField
//                   fullWidth
//                   value={textQuery}
//                   onChange={(e) => setTextQuery(e.target.value)}
//                   disabled={loading}
//                   placeholder="اكتب سؤالك هنا يا بطل... 🔍"
//                   variant="outlined"
//                   InputProps={{
//                     sx: {
//                       borderRadius: '25px',
//                       fontFamily: 'Cairo, sans-serif',
//                       fontWeight: 700,
//                       backgroundColor: isDarkMode ? '#1e272e' : '#f8f9fa',
//                       color: isDarkMode ? '#ffffff' : '#000000',
//                       '& fieldset': { borderColor: '#00b894', borderWidth: '2px' },
//                       '&:hover fieldset': { borderColor: '#009473' },
//                       '&.Mui-focused fieldset': { borderColor: '#009473' },
//                       '& input::placeholder': { color: isDarkMode ? '#95a5a6' : '#7f8c8d', opacity: 1 }
//                     },
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton 
//                           type="submit" 
//                           disabled={loading || !textQuery.trim()}
//                           sx={{ 
//                             color: isDarkMode ? '#00e676' : '#00b894', // لون فسفوري واضح جداً في الدارك مود وأخضر جميل باللايت مود
//                             '&.Mui-disabled': { color: isDarkMode ? '#555' : '#ccc' },
//                             '&:hover': { transform: 'scale(1.1) rotate(-20deg)' }, 
//                             transition: 'transform 0.2s' 
//                           }}
//                         >
//                           <SendIcon sx={{ transform: 'rotate(180deg)' }} />
//                         </IconButton>
//                       </InputAdornment>
//                     )
//                   }}
//                 />
//               </Box>
//             )}

//           </Box>

//         </Paper>
//       </Container>
//     </Box>
//   );
// }

// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Box, 
//   Container, 
//   Typography, 
//   CircularProgress, 
//   Paper,
//   IconButton,
//   Zoom,
//   Button,
//   TextField,
//   InputAdornment,
//   keyframes
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import MicIcon from '@mui/icons-material/Mic';
// import StopIcon from '@mui/icons-material/Stop';
// import VolumeUpIcon from '@mui/icons-material/VolumeUp';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// import SendIcon from '@mui/icons-material/Send';
// import KeyboardIcon from '@mui/icons-material/Keyboard';
// import axios from 'axios';

// // --- تأثيرات حركية مبهجة للطفل (CSS Animations) ---
// const bounce = keyframes`
//   0%, 100% { transform: translateY(0) scale(1); }
//   50% { transform: translateY(-12px) scale(1.05); }
// `;

// const pulse = keyframes`
//   0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
//   70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 107, 107, 0); }
//   100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
// `;

// const spinAndWin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;

// const talking = keyframes`
//   0%, 100% { transform: scaleY(1); }
//   50% { transform: scaleY(1.12) scaleX(1.02); }
// `;

// export default function AISearch() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false); 
//   const [inputMode, setInputMode] = useState('audio'); // 'audio' أو 'text' لتبديل طريقة السؤال
//   const [textQuery, setTextQuery] = useState(''); // لتخزين الكلمة المكتوبة
//   const [chatHistory, setChatHistory] = useState([
//     { role: 'ai', text: 'أهلاً بك يا بطل! اختر من الأعلى كيف تريد سؤالي اليوم، بالكلام أم بالكتابة؟ 🌟' }
//   ]);
  
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const chatBottomRef = useRef(null);

//   // التمرير التلقائي لأسفل المحادثة عند ظهور رسائل جديدة
//   useEffect(() => {
//     if (chatBottomRef.current) {
//       chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [chatHistory, loading]);

//   // 🎤 دالة تشغيل وإيقاف المايكروفون
//   const toggleRecording = async () => {
//     if (isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     } else {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioChunksRef.current = [];
        
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = mediaRecorder;

//         mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorder.onstop = async () => {
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//           stream.getTracks().forEach(track => track.stop());
//           await sendAudioToBackend(audioBlob);
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//         setError('');
//       } catch (err) {
//         console.error('تعذر الوصول إلى المايكروفون:', err);
//         setError('يا بطل، يرجى السماح للمتصفح باستخدام المايكروفون لنبدأ اللعب معاً!');
//       }
//     }
//   };

//   // 🎤 دالة إرسال الصوت وسحب الرد النصي والصوتي من لارافل
//   const sendAudioToBackend = async (audioBlob) => {
//     setLoading(true);
//     setError('');
    
//     setChatHistory(prev => [...prev, { role: 'user', text: '🎤 [رسالة صوتية من البطل]' }]);

//     const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
//     const formData = new FormData();
//     formData.append('audio', audioFile); 

//     try {
//       const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', formData, {
//         headers: { 
//           'Content-Type': 'multipart/form-data',
//           'Accept': 'application/json'
//         }
//       });

//       if (res.data.success) {
//         setChatHistory(prev => {
//           const updated = [...prev];
//           if (updated.length > 0 && updated[updated.length - 1].role === 'user') {
//             updated[updated.length - 1].text = `👦: ${res.data.user_text || 'تحدّثتَ بصوتك البطل'}`;
//           }
//           return [...updated, { 
//             role: 'ai', 
//             text: res.data.text,
//             audioUrl: res.data.audio_url 
//           }];
//         });

//         if (res.data.audio_url) {
//           playAudioResponse(res.data.audio_url);
//         }
//       } else {
//         setError(res.data.message || 'أوه! حدث خطأ بسيط، أعد المحاولة يا بطل.');
//       }
//     } catch (err) {
//       console.error("خطأ الاتصال:", err);
//       const serverErrorMessage = err.response?.data?.message || 'لم أستطع سماعك جيداً، هل يمكنك المحاولة مرة أخرى؟';
//       setError(serverErrorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✍️ دالة إرسال البحث النصي المكتوب إلى الباكيند
//   const handleTextSearchSubmit = async (e) => {
//     if (e) e.preventDefault();
//     if (!textQuery.trim() || loading) return;

//     const query = textQuery.trim();
//     setTextQuery('');
//     setLoading(true);
//     setError('');

//     // إرساء نص الاستعلام داخل واجهة محادثة الطفل فوراً
//     setChatHistory(prev => [...prev, { role: 'user', text: `✍️ البطل يسأل: ${query}` }]);

//     try {
//       const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', { text_prompt: query }, {
//         headers: { 
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });

//       if (res.data.success) {
//         setChatHistory(prev => [...prev, { 
//           role: 'ai', 
//           text: res.data.text,
//           audioUrl: res.data.audio_url 
//         }]);

//         if (res.data.audio_url) {
//           playAudioResponse(res.data.audio_url);
//         }
//       } else {
//         setError(res.data.message || 'أوه! حدث خطأ في معالجة النص.');
//       }
//     } catch (err) {
//       console.error("خطأ الاتصال بالنص:", err);
//       setError(err.response?.data?.message || 'تعذر الاتصال بالسيرفر للحصول على نتائج البحث.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // دالة تشغيل وتزامن حركة الشخصية مع الصوت الراجع
//   const playAudioResponse = (url) => {
//     try {
//       const audioResponse = new Audio(url);
//       audioResponse.volume = 1.0;
      
//       audioResponse.onplay = () => setIsPlayingAudio(true);
//       audioResponse.onended = () => setIsPlayingAudio(false);
      
//       audioResponse.play().catch(e => {
//         console.warn("المتصفح حظر التشغيل التلقائي مؤقتاً:", e);
//         setIsPlayingAudio(false);
//       });
//     } catch (playbackError) {
//       console.error(playbackError);
//       setIsPlayingAudio(false);
//     }
//   };

//   // دالة اختيار حركة ومظهر الشخصية الكرتونية بناءً على حالة التطبيق
//   const getCharacterDesign = () => {
//     if (isRecording) {
//       return { emoji: '🧐', animation: `${pulse} 1.2s infinite ease-in-out`, bgColor: '#ff7675', statusText: 'جاري الاستماع لصوتك العذب...' };
//     }
//     if (loading) {
//       return { emoji: '🚀', animation: `${spinAndWin} 2s infinite linear`, bgColor: '#fdcb6e', statusText: 'أفكر في إجابة ذكية وممتعة لك...' };
//     }
//     if (isPlayingAudio) {
//       return { emoji: '🥳', animation: `${talking} 0.5s infinite ease-in-out`, bgColor: '#2ecc71', statusText: 'أنا أتحدث إليك الآن! 🎵' };
//     }
//     return { emoji: '🤖', animation: `${bounce} 2.5s infinite ease-in-out`, bgColor: '#74b9ff', statusText: 'أنا جاهز ومتحمس لمساعدتك!' };
//   };

//   const character = getCharacterDesign();

//   const clearChat = () => {
//     setChatHistory([{ role: 'ai', text: 'أهلاً بك مجدداً يا بطل! اختر كيف تريد سؤالي الآن وابدأ فوراً. 🌟' }]);
//     setError('');
//   };

//   return (
//     <Box sx={{ 
//       minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, 
//       backgroundColor: '#f0f3f8', 
//       backgroundImage: 'radial-gradient(#dff9fb 20%, transparent 20%), radial-gradient(#f1f2f6 20%, transparent 20%)',
//       backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px', direction: 'rtl' 
//     }}>
//       <Container maxWidth="sm">
//         <Paper elevation={0} sx={{ 
//           p: { xs: 2.5, md: 4 }, borderRadius: '32px', backgroundColor: '#ffffff', 
//           boxShadow: '0px 20px 40px rgba(116, 185, 255, 0.25)', display: 'flex', flexDirection: 'column',
//           alignItems: 'center', border: '4px solid #74b9ff', maxHeight: '88vh'
//         }}>
          
//           {/* ترويسة التطبيق مع زر المسح الدائري اللطيف */}
//           <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//             <Typography variant="h5" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: '#0984e3', textShadow: '1px 1px #dfe6e9' }}>
//               صديقي الذكي 🤖✨
//             </Typography>
//             {chatHistory.length > 1 && (
//               <IconButton onClick={clearChat} color="error" title="ابدأ من جديد">
//                 <DeleteIcon />
//               </IconButton>
//             )}
//           </Box>

//           {/* 🌟 حزمة تبديل وضع السؤال في الأعلى (صوت / نص) بأسلوب طفولي مبهج */}
//           <Box sx={{ 
//             display: 'flex', gap: 1, p: 0.5, width: '100%', backgroundColor: '#f1f2f6', 
//             borderRadius: '20px', mb: 2, border: '1px solid #dfe6e9' 
//           }}>
//             <Button
//               fullWidth
//               variant={inputMode === 'audio' ? 'contained' : 'text'}
//               onClick={() => { if(!loading && !isRecording) setInputMode('audio'); }}
//               startIcon={<MicIcon sx={{ ml: 0.5, mr: 0 }} />}
//               sx={{
//                 borderRadius: '16px', fontFamily: 'Cairo, sans-serif', fontWeight: 800,
//                 backgroundColor: inputMode === 'audio' ? '#74b9ff' : 'transparent',
//                 color: inputMode === 'audio' ? '#ffffff' : '#636e72',
//                 boxShadow: inputMode === 'audio' ? '0px 4px 10px rgba(116, 185, 255, 0.3)' : 'none',
//                 '&:hover': { backgroundColor: inputMode === 'audio' ? '#0984e3' : '#e4e7eb' }
//               }}
//             >
//               تسجيل صوتي 🎤
//             </Button>
//             <Button
//               fullWidth
//               variant={inputMode === 'text' ? 'contained' : 'text'}
//               onClick={() => { if(!loading && !isRecording) setInputMode('text'); }}
//               startIcon={<KeyboardIcon sx={{ ml: 0.5, mr: 0 }} />}
//               sx={{
//                 borderRadius: '16px', fontFamily: 'Cairo, sans-serif', fontWeight: 800,
//                 backgroundColor: inputMode === 'text' ? '#00b894' : 'transparent',
//                 color: inputMode === 'text' ? '#ffffff' : '#636e72',
//                 boxShadow: inputMode === 'text' ? '0px 4px 10px rgba(0, 184, 148, 0.3)' : 'none',
//                 '&:hover': { backgroundColor: inputMode === 'text' ? '#009473' : '#e4e7eb' }
//               }}
//             >
//               كتابة نصية ✍️
//             </Button>
//           </Box>

//           {/* --- الـ CHARACTER المتحرك الرئيسي --- */}
//           <Zoom in={true}>
//             <Box sx={{ 
//               width: '110px', height: '110px', borderRadius: '50%', backgroundColor: character.bgColor,
//               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', 
//               animation: character.animation, boxShadow: '0px 10px 20px rgba(0,0,0,0.12)',
//               transition: 'background-color 0.4s ease', userSelect: 'none', border: '5px solid #ffffff', mb: 0.5
//             }}>
//               {character.emoji}
//             </Box>
//           </Zoom>

//           <Typography variant="caption" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: character.bgColor, mb: 1.5 }}>
//             {character.statusText}
//           </Typography>

//           {/* --- منطقة عرض شات المحادثة المطور للأطفال --- */}
//           <Box sx={{ 
//             width: '100%', flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, maxHeight: '33vh',
//             display: 'flex', flexDirection: 'column', gap: 2,
//             '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#74b9ff', borderRadius: '10px' }
//           }}>
//             {chatHistory.map((msg, index) => (
//               <Box key={index} sx={{ alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end', width: '100%', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end' }}>
//                 <Paper elevation={0} sx={{ 
//                   p: 2, borderRadius: msg.role === 'user' ? '24px 24px 24px 4px' : '24px 24px 4px 24px',
//                   backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#e8f5e9',
//                   borderRight: msg.role === 'user' ? '6px solid #2196f3' : '6px solid #4caf50',
//                   maxWidth: '85%', position: 'relative'
//                 }}>
//                   <Typography sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, color: '#2d3436', fontSize: '1rem', lineHeight: 1.6 }}>
//                     {msg.text}
//                   </Typography>
                  
//                   {msg.role === 'ai' && msg.audioUrl && (
//                     <Button 
//                       onClick={() => playAudioResponse(msg.audioUrl)}
//                       variant="text" 
//                       size="small" 
//                       startIcon={<PlayArrowIcon sx={{ ml: 0.5, mr: 0 }} />}
//                       sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: '#4caf50', mt: 1, p: 0, minWidth: 'auto', fontSize: '0.8rem' }}
//                     >
//                       استمع مرة أخرى 🎧
//                     </Button>
//                   )}
//                 </Paper>
//               </Box>
//             ))}
            
//             {loading && (
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-end', backgroundColor: '#fff9db', p: 1.5, borderRadius: '16px', border: '1px dashed #f59f00' }}>
//                 <CircularProgress size={16} sx={{ color: '#fdcb6e' }} />
//                 <Typography sx={{ fontFamily: 'Cairo, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#6d4c41' }}>
//                   جاري تجهيز رد ذكي وساحر... ✨
//                 </Typography>
//               </Box>
//             )}
            
//             <div ref={chatBottomRef} />
//           </Box>

//           {error && (
//             <Box sx={{ p: 2, mb: 2, width: '100%', borderRadius: '16px', backgroundColor: '#ffebee', border: '2px solid #ff7675', color: '#d63031', fontFamily: 'Cairo, sans-serif', fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}>
//               {error}
//             </Box>
//           )}

//           {/* --- منطقة التحكم السفلية المتغيرة بناء على الخيار العلوي --- */}
//           <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 'auto', minHeight: '90px', alignItems: 'center' }}>
            
//             {/* 🎤 وضع الصوت المعهود: المايك الدائري الكبير وحركاته المتميزة */}
//             {inputMode === 'audio' && (
//               <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
//                 <IconButton 
//                   onClick={toggleRecording}
//                   disabled={loading}
//                   sx={{
//                     backgroundColor: isRecording ? '#ff7675' : '#74b9ff', color: '#ffffff', borderRadius: '50%', width: '80px', height: '80px',
//                     boxShadow: isRecording ? '0px 0px 25px #ff7675' : '0px 8px 20px rgba(116, 185, 255, 0.4)',
//                     transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
//                     animation: isRecording ? `${pulse} 1s infinite` : 'none',
//                     '&:hover': { backgroundColor: isRecording ? '#e17055' : '#0984e3', transform: 'scale(1.06)' },
//                     '&:active': { transform: 'scale(0.94)' }
//                   }}
//                 >
//                   {isRecording ? <StopIcon sx={{ fontSize: '40px' }} /> : <MicIcon sx={{ fontSize: '40px' }} />}
//                 </IconButton>
//                 <Typography variant="body2" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: isRecording ? '#ff7675' : '#0984e3' }}>
//                   {isRecording ? 'اضغط هنا للإنهاء والإرسال 🌟' : 'اضغط على المايك وابدأ الكلام! 🎤'}
//                 </Typography>
//               </Box>
//             )}

//             {/* ✍️ وضع النص: خلية بحث وإدخال نصية مخصصة للأطفال برونق جذاب */}
//             {inputMode === 'text' && (
//               <Box component="form" onSubmit={handleTextSearchSubmit} sx={{ width: '100%', px: 1 }}>
//                 <TextField
//                   fullWidth
//                   value={textQuery}
//                   onChange={(e) => setTextQuery(e.target.value)}
//                   disabled={loading}
//                   placeholder="اكتب سؤالك أو ما تبحث عنه هنا يا بطل... 🔍"
//                   variant="outlined"
//                   InputProps={{
//                     sx: {
//                       borderRadius: '25px',
//                       fontFamily: 'Cairo, sans-serif',
//                       fontWeight: 700,
//                       backgroundColor: '#f8f9fa',
//                       '& fieldset': { borderColor: '#00b894', borderWidth: '2px' },
//                       '&:hover fieldset': { borderColor: '#009473' },
//                       '&.Mui-focused fieldset': { borderColor: '#009473' }
//                     },
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton 
//                           type="submit" 
//                           disabled={loading || !textQuery.trim()}
//                           sx={{ color: '#00b894', '&:hover': { transform: 'scale(1.1) rotate(-20deg)' }, transition: 'transform 0.2s' }}
//                         >
//                           <SendIcon sx={{ transform: 'rotate(180deg)' }} />
//                         </IconButton>
//                       </InputAdornment>
//                     )
//                   }}
//                 />
//               </Box>
//             )}

//           </Box>

//         </Paper>
//       </Container>
//     </Box>
//   );
// }


























// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Box, 
//   Container, 
//   Typography, 
//   CircularProgress, 
//   Paper,
//   IconButton,
//   Zoom,
//   Button,
//   keyframes
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import MicIcon from '@mui/icons-material/Mic';
// import StopIcon from '@mui/icons-material/Stop';
// import VolumeUpIcon from '@mui/icons-material/VolumeUp';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// import axios from 'axios';

// // --- تأثيرات حركية مبهجة للطفل (CSS Animations) ---
// const bounce = keyframes`
//   0%, 100% { transform: translateY(0) scale(1); }
//   50% { transform: translateY(-12px) scale(1.05); }
// `;

// const pulse = keyframes`
//   0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
//   70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 107, 107, 0); }
//   100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
// `;

// const spinAndWin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;

// const talking = keyframes`
//   0%, 100% { transform: scaleY(1); }
//   50% { transform: scaleY(1.12) scaleX(1.02); }
// `;

// export default function AISearch() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false); 
//   const [chatHistory, setChatHistory] = useState([
//     { role: 'ai', text: 'أهلاً بك يا بطل! اضغط على المايكروفون الكبير وتحدث معي، أنا أستمع إليك! 🌟' }
//   ]);
  
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const chatBottomRef = useRef(null);

//   // التمرير التلقائي لأسفل المحادثة عند ظهور رسائل جديدة
//   useEffect(() => {
//     if (chatBottomRef.current) {
//       chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [chatHistory, loading]);

//   // دالة تشغيل وإيقاف المايكروفون
//   const toggleRecording = async () => {
//     if (isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     } else {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioChunksRef.current = [];
        
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = mediaRecorder;

//         mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorder.onstop = async () => {
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//           stream.getTracks().forEach(track => track.stop());
//           await sendAudioToBackend(audioBlob);
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//         setError('');
//       } catch (err) {
//         console.error('تعذر الوصول إلى المايكروفون:', err);
//         setError('يا بطل، يرجى السماح للمتصفح باستخدام المايكروفون لنبدأ اللعب معاً!');
//       }
//     }
//   };

//   // دالة إرسال الصوت وسحب الرد النصي والصوتي من لارافل
//   const sendAudioToBackend = async (audioBlob) => {
//     setLoading(true);
//     setError('');
    
//     // إضافة فقاعة مؤقتة للطفل أثناء المعالجة ليعرف أن صوته تم تسجيله
//     setChatHistory(prev => [...prev, { role: 'user', text: '🎤 [رسالة صوتية من البطل]' }]);

//     const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
//     const formData = new FormData();
//     formData.append('audio', audioFile); 

//     try {
//       const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', formData, {
//         headers: { 
//           'Content-Type': 'multipart/form-data',
//           'Accept': 'application/json'
//         }
//       });

//       if (res.data.success) {
//         // تحديث المحادثة: إزالة الرسالة المؤقتة وإضافة النص الفعلي الذي قاله الطفل + رد الـ AI
//         setChatHistory(prev => {
//           const updated = [...prev];
//           // تحديث نص رسالة الطفل الأخيرة بالتحويل الفعلي الذي جاء من Whisper
//           if (updated.length > 0 && updated[updated.length - 1].role === 'user') {
//             updated[updated.length - 1].text = `👦: ${res.data.user_text || 'تحدّثتَ بصوتك البطل'}`;
//           }
//           // إضافة رد الذكاء الاصطناعي الجديد
//           return [...updated, { 
//             role: 'ai', 
//             text: res.data.text,
//             audioUrl: res.data.audio_url 
//           }];
//         });

//         if (res.data.audio_url) {
//           playAudioResponse(res.data.audio_url);
//         }
//       } else {
//         setError(res.data.message || 'أوه! حدث خطأ بسيط، أعد المحاولة يا بطل.');
//       }
//     } catch (err) {
//       console.error("خطأ الاتصال:", err);
//       const serverErrorMessage = err.response?.data?.message || 'لم أستطع سماعك جيداً، هل يمكنك المحاولة مرة أخرى؟';
//       setError(serverErrorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // دالة تشغيل وتزامن حركة الشخصية مع الصوت الراجع
//   const playAudioResponse = (url) => {
//     try {
//       const audioResponse = new Audio(url);
//       audioResponse.volume = 1.0;
      
//       audioResponse.onplay = () => setIsPlayingAudio(true);
//       audioResponse.onended = () => setIsPlayingAudio(false);
      
//       audioResponse.play().catch(e => {
//         console.warn("المتصفح حظر التشغيل التلقائي مؤقتاً:", e);
//         setIsPlayingAudio(false);
//       });
//     } catch (playbackError) {
//       console.error(playbackError);
//       setIsPlayingAudio(false);
//     }
//   };

//   // دالة اختيار حركة ومظهر الشخصية الكرتونية بناءً على حالة التطبيق
//   const getCharacterDesign = () => {
//     if (isRecording) {
//       return { emoji: '🧐', animation: `${pulse} 1.2s infinite ease-in-out`, bgColor: '#ff7675', statusText: 'جاري الاستماع لصوتك العذب...' };
//     }
//     if (loading) {
//       return { emoji: '🚀', animation: `${spinAndWin} 2s infinite linear`, bgColor: '#fdcb6e', statusText: 'أفكر في إجابة ذكية وممتعة لك...' };
//     }
//     if (isPlayingAudio) {
//       return { emoji: '🥳', animation: `${talking} 0.5s infinite ease-in-out`, bgColor: '#2ecc71', statusText: 'أنا أتحدث إليك الآن! 🎵' };
//     }
//     return { emoji: '🤖', animation: `${bounce} 2.5s infinite ease-in-out`, bgColor: '#74b9ff', statusText: 'أنا جاهز ومتحمس للحديث معك!' };
//   };

//   const character = getCharacterDesign();

//   const clearChat = () => {
//     setChatHistory([{ role: 'ai', text: 'أهلاً بك مجدداً يا بطل! أنا متحمس لسماع صوتك الحادق! 🌟' }]);
//     setError('');
//   };

//   return (
//     <Box sx={{ 
//       minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, 
//       backgroundColor: '#f0f3f8', 
//       backgroundImage: 'radial-gradient(#dff9fb 20%, transparent 20%), radial-gradient(#f1f2f6 20%, transparent 20%)',
//       backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px', direction: 'rtl' 
//     }}>
//       <Container maxWidth="sm">
//         <Paper elevation={0} sx={{ 
//           p: { xs: 2.5, md: 4 }, borderRadius: '32px', backgroundColor: '#ffffff', 
//           boxShadow: '0px 20px 40px rgba(116, 185, 255, 0.25)', display: 'flex', flexDirection: 'column',
//           alignItems: 'center', border: '4px solid #74b9ff', maxHeight: '85vh'
//         }}>
          
//           {/* ترويسة التطبيق مع زر المسح الدائري اللطيف */}
//           <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//             <Typography variant="h5" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: '#0984e3', textShadow: '1px 1px #dfe6e9' }}>
//               صديقي الذكي 🤖✨
//             </Typography>
//             {chatHistory.length > 1 && (
//               <IconButton onClick={clearChat} color="error" title="ابدأ من جديد">
//                 <DeleteIcon />
//               </IconButton>
//             )}
//           </Box>

//           {/* --- الـ CHARACTER المتحرك الرئيسي --- */}
//           <Zoom in={true}>
//             <Box sx={{ 
//               width: '120px', height: '120px', borderRadius: '50%', backgroundColor: character.bgColor,
//               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '65px', 
//               animation: character.animation, boxShadow: '0px 10px 20px rgba(0,0,0,0.12)',
//               transition: 'background-color 0.4s ease', userSelect: 'none', border: '5px solid #ffffff', mb: 1
//             }}>
//               {character.emoji}
//             </Box>
//           </Zoom>

//           <Typography variant="caption" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: character.bgColor, mb: 2 }}>
//             {character.statusText}
//           </Typography>

//           {/* --- منطقة عرض شات المحادثة المطور للأطفال --- */}
//           <Box sx={{ 
//             width: '100%', flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, maxHeight: '38vh',
//             display: 'flex', flexDirection: 'column', gap: 2,
//             '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#74b9ff', borderRadius: '10px' }
//           }}>
//             {chatHistory.map((msg, index) => (
//               <Box key={index} sx={{ alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end', width: '100%', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end' }}>
//                 <Paper elevation={0} sx={{ 
//                   p: 2, borderRadius: msg.role === 'user' ? '24px 24px 24px 4px' : '24px 24px 4px 24px',
//                   backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#e8f5e9',
//                   borderRight: msg.role === 'user' ? '6px solid #2196f3' : '6px solid #4caf50',
//                   maxWidth: '85%', position: 'relative'
//                 }}>
//                   <Typography sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, color: '#2d3436', fontSize: '1rem', lineHeight: 1.6 }}>
//                     {msg.text}
//                   </Typography>
                  
//                   {/* زر إعادة الاستماع اللطيف المخصص لفقاعات الـ AI فقط */}
//                   {msg.role === 'ai' && msg.audioUrl && (
//                     <Button 
//                       onClick={() => playAudioResponse(msg.audioUrl)}
//                       variant="text" 
//                       size="small" 
//                       startIcon={<PlayArrowIcon sx={{ ml: 0.5, mr: 0 }} />}
//                       sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: '#4caf50', mt: 1, p: 0, minWidth: 'auto', fontSize: '0.8rem' }}
//                     >
//                       استمع مرة أخرى 🎧
//                     </Button>
//                   )}
//                 </Paper>
//               </Box>
//             ))}
            
//             {/* مؤشر تحميل طفولي لطيف أثناء المعالجة والتفكير */}
//             {loading && (
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-end', backgroundColor: '#fff9db', p: 1.5, borderRadius: '16px', border: '1px dashed #f59f00' }}>
//                 <CircularProgress size={16} sx={{ color: '#fdcb6e' }} />
//                 <Typography sx={{ fontFamily: 'Cairo, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#6d4c41' }}>
//                   البطل الصغير يتحدث والذكاء الاصطناعي يجهز رداً ساحراً... ✨
//                 </Typography>
//               </Box>
//             )}
            
//             <div ref={chatBottomRef} />
//           </Box>

//           {error && (
//             <Box sx={{ p: 2, mb: 2, width: '100%', borderRadius: '16px', backgroundColor: '#ffebee', border: '2px solid #ff7675', color: '#d63031', fontFamily: 'Cairo, sans-serif', fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}>
//               {error}
//             </Box>
//           )}

//           {/* --- أزرار التحكم الكبيرة السهلة للطفل --- */}
//           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%', mt: 'auto' }}>
//             <IconButton 
//               onClick={toggleRecording}
//               disabled={loading}
//               sx={{
//                 backgroundColor: isRecording ? '#ff7675' : '#74b9ff', color: '#ffffff', borderRadius: '50%', width: '85px', height: '85px',
//                 boxShadow: isRecording ? '0px 0px 25px #ff7675' : '0px 8px 20px rgba(116, 185, 255, 0.4)',
//                 transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
//                 animation: isRecording ? `${pulse} 1s infinite` : 'none',
//                 '&:hover': { backgroundColor: isRecording ? '#e17055' : '#0984e3', transform: 'scale(1.06)' },
//                 '&:active': { transform: 'scale(0.94)' }
//               }}
//             >
//               {isRecording ? <StopIcon sx={{ fontSize: '42px' }} /> : <MicIcon sx={{ fontSize: '42px' }} />}
//             </IconButton>

//             <Typography variant="body2" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: isRecording ? '#ff7675' : '#0984e3' }}>
//               {isRecording ? 'اضغط هنا للإنهاء والإرسال 🌟' : 'اضغط على المايك وابدأ الكلام! 🎤'}
//             </Typography>
//           </Box>

//         </Paper>
//       </Container>
//     </Box>
//   );
// }
// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Box, 
//   Container, 
//   Typography, 
//   CircularProgress, 
//   Paper,
//   IconButton,
//   Zoom,
//   keyframes
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import MicIcon from '@mui/icons-material/Mic';
// import StopIcon from '@mui/icons-material/Stop';
// import VolumeUpIcon from '@mui/icons-material/VolumeUp';
// import axios from 'axios';

// // --- تأثيرات حركية مبهجة للطفل (CSS Animations) ---
// const bounce = keyframes`
//   0%, 100% { transform: translateY(0) scale(1); }
//   50% { transform: translateY(-15px) scale(1.05); }
// `;

// const pulse = keyframes`
//   0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
//   70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 107, 107, 0); }
//   100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
// `;

// const spinAndWin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;

// const talking = keyframes`
//   0%, 100% { transform: scaleY(1); }
//   50% { transform: scaleY(1.15) scaleX(1.02); }
// `;

// export default function AISearch() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false); // لمعرفة هل الشخصية تتحدث الآن
//   const [latestAiText, setLatestAiText] = useState('أهلاً بك يا بطل! اضغط على المايكروفون الكبير وتحدث معي، أنا أستمع إليك! 🌟');
  
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const chatBottomRef = useRef(null);

//   // دالة تشغيل وإيقاف المايكروفون
//   const toggleRecording = async () => {
//     if (isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     } else {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioChunksRef.current = [];
        
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = mediaRecorder;

//         mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorder.onstop = async () => {
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//           stream.getTracks().forEach(track => track.stop());
//           await sendAudioToBackend(audioBlob);
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//         setError('');
//         setLatestAiText('أنا أستمع إليك الآن بكل حب... تفضل بالكلام يا بطل! 🎧');
//       } catch (err) {
//         console.error('تعذر الوصول إلى المايكروفون:', err);
//         setError('يا بطل، يرجى السماح للمتصفح باستخدام المايكروفون لنبدأ اللعب معاً!');
//       }
//     }
//   };

//   // دالة إرسال الصوت للسيرفر الخلفي
//   const sendAudioToBackend = async (audioBlob) => {
//     setLoading(true);
//     setError('');
    
//     const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
//     const formData = new FormData();
//     formData.append('audio', audioFile); 

//     try {
//       const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', formData, {
//         headers: { 
//           'Content-Type': 'multipart/form-data',
//           'Accept': 'application/json'
//         }
//       });

//       if (res.data.success) {
//         setLatestAiText(res.data.text);

//         if (res.data.audio_url) {
//           try {
//             const audioResponse = new Audio(res.data.audio_url);
//             audioResponse.volume = 1.0;
            
//             // عند بدء تشغيل الصوت، نجعل الشخصية تدخل في حركة التحدث
//             audioResponse.onplay = () => setIsPlayingAudio(true);
//             // عند انتهاء الصوت، تعود الشخصية لوضعها الطبيعي
//             audioResponse.onended = () => setIsPlayingAudio(false);
            
//             await audioResponse.play();
//           } catch (playbackError) {
//             console.warn("المتصفح حظر التشغيل التلقائي مؤقتاً:", playbackError);
//             setIsPlayingAudio(false);
//           }
//         }
//       } else {
//         setError(res.data.message || 'أوه! حدث خطأ بسيط، أعد المحاولة يا بطل.');
//       }
//     } catch (err) {
//       console.error("خطأ الاتصال:", err);
//       const serverErrorMessage = err.response?.data?.message || 'لم أستطع سماعك جيداً، هل يمكنك المحاولة مرة أخرى؟';
//       setError(serverErrorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // دالة اختيار حركة ومظهر الشخصية الكرتونية بناءً على حالة التطبيق
//   const getCharacterDesign = () => {
//     if (isRecording) {
//       return {
//         emoji: '🧐', // تعبير الاستماع بتركيز
//         animation: `${pulse} 1.2s infinite ease-in-out`,
//         bgColor: '#ff7675',
//         statusText: 'جاري الاستماع لصوتك العذب...'
//       };
//     }
//     if (loading) {
//       return {
//         emoji: '🚀', // وضعية التفكير والتحليق بالفضاء
//         animation: `${spinAndWin} 2s infinite linear`,
//         bgColor: '#fdcb6e',
//         statusText: 'أفكر في إجابة ذكية وممتعة لك...'
//       };
//     }
//     if (isPlayingAudio) {
//       return {
//         emoji: '🥳', // يتحدث بسعادة ويغني
//         animation: `${talking} 0.5s infinite ease-in-out`,
//         bgColor: '#2ecc71',
//         statusText: 'أنا أتحدث إليك الآن! 🎵'
//       };
//     }
//     // الحالة العادية (الانتظار والرقص اللطيف)
//     return {
//       emoji: '🤖', // روبوت صديق للأطفال
//       animation: `${bounce} 2.5s infinite ease-in-out`,
//       bgColor: '#74b9ff',
//       statusText: 'أنا جاهز ومتحمس للحديث معك!'
//     };
//   };

//   const character = getCharacterDesign();

//   return (
//     <Box sx={{ 
//       minHeight: '85vh', 
//       display: 'flex', 
//       alignItems: 'center', 
//       justifyContent: 'center', 
//       padding: 3, 
//       backgroundColor: '#f0f3f8', // خلفية فاتحة ومريحة للأطفال
//       backgroundImage: 'radial-gradient(#dff9fb 20%, transparent 20%), radial-gradient(#f1f2f6 20%, transparent 20%)',
//       backgroundSize: '40px 40px',
//       backgroundPosition: '0 0, 20px 20px',
//       direction: 'rtl' 
//     }}>
//       <Container maxWidth="sm">
//         <Paper elevation={0} sx={{ 
//           p: { xs: 3, md: 4 }, 
//           borderRadius: '32px', // حواف دائرية ناعمة جداً تناسب الأطفال
//           backgroundColor: '#ffffff', 
//           boxShadow: '0px 20px 40px rgba(116, 185, 255, 0.25)', 
//           display: 'flex', 
//           flexDirection: 'column',
//           alignItems: 'center',
//           border: '4px solid #74b9ff'
//         }}>
          
//           {/* ترويسة التطبيق الطفولية */}
//           <Typography variant="h4" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: '#0984e3', mb: 1, textShadow: '2px 2px #dfe6e9', textAlign: 'center' }}>
//             صديقي الذكي الممتع ✨
//           </Typography>
//           <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo, sans-serif', color: '#636e72', mb: 4, fontWeight: 700, textAlign: 'center' }}>
//             تحدث معي وسأجيبك بصوت رائع!
//           </Typography>

//           {/* --- الـ CHARACTER المتحرك الرئيسي --- */}
//           <Zoom in={true}>
//             <Box sx={{ 
//               width: '160px', 
//               height: '160px', 
//               borderRadius: '50%', 
//               backgroundColor: character.bgColor,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '80px', // حجم الإيموجي الكرتوني الكبير
//               animation: character.animation,
//               boxShadow: '0px 15px 30px rgba(0,0,0,0.15)',
//               transition: 'background-color 0.4s ease',
//               userSelect: 'none',
//               border: '6px solid #ffffff'
//             }}>
//               {character.emoji}
//             </Box>
//           </Zoom>

//           {/* نص الحالة أسفل الشخصية مباشرة ليعرف الطفل ماذا يفعل الروبوت */}
//           <Typography variant="body2" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: character.bgColor, mt: 2, fontSize: '0.95rem' }}>
//             {character.statusText}
//           </Typography>

//           {/* فقاعة كلام الشخصية الراجعة (النص المكتوب بأسلوب قصصي للأطفال) */}
//           <Paper elevation={0} sx={{ 
//             p: 3, 
//             mt: 4, 
//             mb: 4,
//             borderRadius: '24px', 
//             backgroundColor: '#f1f2f6', 
//             position: 'relative',
//             width: '100%',
//             borderRight: '8px solid #74b9ff',
//             boxSizing: 'border-box'
//           }}>
//             {isPlayingAudio && <VolumeUpIcon sx={{ position: 'absolute', top: 12, left: 12, color: '#2ecc71', animation: `${pulse} 1s infinite` }} />}
//             <Typography sx={{ 
//               fontFamily: 'Cairo, sans-serif', 
//               fontWeight: 800, 
//               lineHeight: 1.8, 
//               color: '#2d3436', 
//               fontSize: '1.15rem',
//               textAlign: 'center'
//             }}>
//               {latestAiText}
//             </Typography>
//           </Paper>

//           {/* رسائل الخطأ بأسلوب مبسط */}
//           {error && (
//             <Box sx={{ p: 2, mb: 3, width: '100%', borderRadius: '16px', backgroundColor: '#ffebee', border: '2px solid #ff7675', color: '#d63031', fontFamily: 'Cairo, sans-serif', fontWeight: 700, textAlign: 'center' }}>
//               {error}
//             </Box>
//           )}

//           {/* --- أزرار التحكم الكبيرة السهلة للطفل --- */}
//           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
            
//             {/* زر المايك المطور المصلح والمعدل بدقة من أخطاء الـ Syntax 🎯 */}
//             <IconButton 
//               onClick={toggleRecording}
//               disabled={loading}
//               sx={{
//                 backgroundColor: isRecording ? '#ff7675' : '#74b9ff',
//                 color: '#ffffff',
//                 borderRadius: '50%',
//                 width: '90px',
//                 height: '90px',
//                 boxShadow: isRecording ? '0px 0px 30px #ff7675' : '0px 10px 25px rgba(116, 185, 255, 0.5)',
//                 transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
//                 animation: isRecording ? `${pulse} 1s infinite` : 'none',
//                 '&:hover': {
//                   backgroundColor: isRecording ? '#e17055' : '#0984e3',
//                   transform: 'scale(1.08)'
//                 },
//                 '&:active': { transform: 'scale(0.92)' }
//               }}
//             >
//               {isRecording ? <StopIcon sx={{ fontSize: '45px' }} /> : <MicIcon sx={{ fontSize: '45px' }} />}
//             </IconButton>

//             <Typography variant="body2" sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, color: isRecording ? '#ff7675' : '#0984e3' }}>
//               {isRecording ? 'اضغط هنا للإنهاء والإرسال 🌟' : 'اضغط عليّ وابدأ الكلام! 🎤'}
//             </Typography>

//           </Box>

//         </Paper>
//       </Container>
//     </Box>
//   );
// }
// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Box, 
//   Container, 
//   Typography, 
//   TextField, 
//   Button, 
//   CircularProgress, 
//   Paper,
//   Fade,
//   IconButton
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import DeleteIcon from '@mui/icons-material/Delete';
// import MicIcon from '@mui/icons-material/Mic';
// import StopIcon from '@mui/icons-material/Stop';
// import axios from 'axios';

// export default function AISearch() {
//   const [prompt, setPrompt] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [chatHistory, setChatHistory] = useState([]);
  
//   // حالات تسجيل الصوت (Audio Recording States)
//   const [isRecording, setIsRecording] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const chatBottomRef = useRef(null);

//   useEffect(() => {
//     if (chatBottomRef.current) {
//       chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [chatHistory, loading]);

//   // دالة تشغيل وإيقاف المايكروفون
//   const toggleRecording = async () => {
//     if (isRecording) {
//       // إيقاف التسجيل
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     } else {
//       // بدء التسجيل - طلب إذن المايكروفون من المستخدم
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioChunksRef.current = [];
        
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = mediaRecorder;

//         mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorder.onstop = async () => {
//           // تجميع جزيئات الصوت في ملف واحد بصيغة audio/webm
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
//           // إيقاف عمل المايكروفون في الخلفية بعد الانتهاء
//           stream.getTracks().forEach(track => track.stop());

//           // إرسال الملف الصوتي إلى السيرفر الخلفي
//           await sendAudioToBackend(audioBlob);
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//         setError('');
//       } catch (err) {
//         console.error('تعذر الوصول إلى المايكروفون:', err);
//         setError('يرجى السماح بالوصول إلى المايكروفون لتتمكن من التسجيل من المتصفح.');
//       }
//     }
//   };

//   // دالة إرسال الملف الصوتي عبر FormData إلى Laravel ليرد بتسجيل صوتي حقيقي
// const sendAudioToBackend = async (audioBlob) => {
//   setLoading(true);
//   setError('');
  
//   setChatHistory(prev => [...prev, { role: 'user', text: '🎤 [رسالة صوتية]' }]);

//   // تأمين صياغة الملف الصوتي كملف ويف/ويب إم قياسي مدعوم من PHP
//   const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

//   const formData = new FormData();
//   formData.append('audio', audioFile); 

//   try {
//     const res = await axios.post('http://127.0.0.1:8000/api/ai/search-audio', formData, {
//       headers: { 
//         'Content-Type': 'multipart/form-data',
//         'Accept': 'application/json'
//       }
//     });

//     if (res.data.success) {
//       setChatHistory(prev => [...prev, { 
//         role: 'ai', 
//         text: res.data.text,
//         audioUrl: res.data.audio_url 
//       }]);

//       if (res.data.audio_url) {
//         // عزل تشغيل الصوت في كتلة مستقلة تماماً لحماية حالة الـ Error من سياسات المتصفح
//         try {
//           const audioResponse = new Audio(res.data.audio_url);
//           audioResponse.volume = 1.0; 
//           await audioResponse.play();
//         } catch (playbackError) {
//           console.warn("المتصفح حظر التشغيل التلقائي مؤقتاً لحين تفاعل المستخدم:", playbackError);
//         }
//       }

//     } else {
//       setError(res.data.message || 'حدث خطأ ما أثناء معالجة الصوت.');
//     }
//   } catch (err) {
//     console.error("خطأ الاتصال بالسيرفر:", err);
//     const serverErrorMessage = err.response?.data?.message || 'فشلت معالجة الصوت في السيرفر الخلفي.';
//     setError(serverErrorMessage);
//   } finally {
//     setLoading(false);
//   }
// };
//   // دالة إرسال النص العادية
//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!prompt.trim() || loading) return;

//     const userQuestion = prompt.trim();
//     setLoading(true);
//     setError('');
//     setPrompt('');

//     setChatHistory(prev => [...prev, { role: 'user', text: userQuestion }]);

//     try {
//       const res = await axios.post('http://127.0.0.1:8000/api/ai/search', { prompt: userQuestion });
//       if (res.data.success) {
//         setChatHistory(prev => [...prev, { role: 'ai', text: res.data.text }]);
//       } else {
//         setError(res.data.message || 'حدث خطأ ما.');
//       }
//     } catch (err) {
//       setError('تعذر الاتصال بالسيرفر.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearChat = () => {
//     setChatHistory([]);
//     setError('');
//   };

//   return (
//     <Box sx={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: 3, backgroundColor: '#0a0b10', direction: 'rtl' }}>
//       <Container maxWidth="md">
//         <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
          
//           <Box sx={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', mb: 3 }}>
//             <Typography variant="h4" component="h1" sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#1a237e' }}>
//               المساعد الصوتي والذكي
//             </Typography>
//             {chatHistory.length > 0 && (
//               <Button onClick={clearChat} variant="text" color="error" startIcon={<DeleteIcon sx={{ ml: 1, mr: 0 }} />} sx={{ fontFamily: 'A, sans-serif', fontWeight: 900 }}>
//                 مسح المحادثة
//               </Button>
//             )}
//           </Box>

//           {/* مساحة عرض المحادثة المطورة بفقاعات التسجيلات الصوتية */}
//           <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 3, pr: 1, pl: 1, maxHeight: '45vh', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '4px' } }}>
//             {chatHistory.map((msg, index) => (
//               <Box key={index} sx={{ mb: 3, textAlign: 'right' }}>
//                 {msg.role === 'user' ? (
//                   <Box sx={{ mb: 1 }}>
//                     <Typography variant="subtitle2" sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#1a237e !important', mb: 0.5 }}>أنت:</Typography>
//                     <Paper elevation={0} sx={{ p: 2, display: 'inline-block', borderRadius: '12px 0px 12px 12px', backgroundColor: '#e8eaf6', fontFamily: 'A, sans-serif', fontWeight: 900, color: '#1a237e !important', maxWidth: '85%' }}>
//                       {msg.text}
//                     </Paper>
//                   </Box>
//                 ) : (
//                   <Box sx={{ mb: 1 }}>
//                     <Typography variant="subtitle2" sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#666666 !important', mb: 0.5 }}>الرد الصوتي الذكي:</Typography>
//                     <Paper 
//                       elevation={0} 
//                       sx={{ 
//                         p: 2.5, 
//                         borderRadius: '0px 12px 12px 12px', 
//                         backgroundColor: '#f5f6fa', 
//                         borderRight: '4px solid #1a237e', 
//                         display: 'inline-flex',
//                         flexDirection: 'column',
//                         gap: 1.5,
//                         minWidth: '280px',
//                         maxWidth: '85%'
//                       }}
//                     >
//                       {/* ترويسة التسجيل الراجع */}
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1a237e' }}>
//                         <MicIcon fontSize="small" />
//                         <Typography sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, fontSize: '0.95rem' }}>
//                           تسجيل صوتي راجع
//                         </Typography>
//                       </Box>

//                       {/* مشغل التسجيل الصوتي المتزامن */}
//                       {msg.audioUrl ? (
//                         <Box sx={{ width: '100%', mt: 0.5 }}>
//                           <audio src={msg.audioUrl} controls style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
//                         </Box>
//                       ) : (
//                         <Typography sx={{ fontFamily: 'A, sans-serif', fontWeight: 100, lineHeight: 1.8, color: '#2c3e50 !important', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
//                           {msg.text}
//                         </Typography>
//                       )}
//                     </Paper>
//                   </Box>
//                 )}
//               </Box>
//             ))}

//             {loading && (
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
//                 <CircularProgress size={18} sx={{ color: '#1a237e' }} />
//                 <Typography sx={{ fontFamily: 'A, sans-serif', fontSize: '0.9rem', color: '#666' }}>
//                   {isRecording ? 'جاري الاستماع وتسجيل صوتك الآن...' : 'جاري تفكير وتوليد الرد الصوتي والذكاء الاصطناعي...'}
//                 </Typography>
//               </Box>
//             )}

//             {error && <Box sx={{ p: 2, mt: 2, borderRadius: '8px', backgroundColor: '#ffebee', borderLeft: '4px solid #d32f2f', color: '#c62828 !important', fontFamily: 'A, sans-serif' }}>{error}</Box>}
//             <div ref={chatBottomRef} />
//           </Box>

//           <hr style={{ border: '0', borderTop: '1px solid #e0e0e0', marginBottom: '20px' }} />

//           {/* حقل الإدخال السفلي المطور بالمايكروفون والأنميشن الخاطف */}
//           <Box component="form" onSubmit={handleSearch}>
//             <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch' }}>
              
//               {/* زر المايكروفون الأنيق بالتأثيرات الحركية */}
//               <IconButton 
//                 onClick={toggleRecording}
//                 disabled={loading && !isRecording}
//                 sx={{
//                   backgroundColor: isRecording ? '#d32f2f' : '#e8eaf6',
//                   color: isRecording ? '#ffffff' : '#1a237e',
//                   borderRadius: '8px',
//                   width: '54px',
//                   height: '54px',
//                   transition: 'all 0.2s ease-in-out',
//                   '&:hover': {
//                     backgroundColor: isRecording ? '#b71c1c' : '#c5cae9',
//                   },
//                   '&:active': { transform: 'scale(0.92)' }
//                 }}
//               >
//                 {isRecording ? <StopIcon /> : <MicIcon />}
//               </IconButton>

//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 placeholder={isRecording ? "جاري التسجيل... اضغط على المربع الأحمر للإرسال" : "اكتب سؤالاً أو سجل صوتك عبر المايكروفون..."}
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 disabled={loading || isRecording}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     fontFamily: 'A, sans-serif', borderRadius: '8px', backgroundColor: '#fafafa', color: '#2c3e50 !important',
//                     '& fieldset': { borderColor: '#cccccc !important' },
//                     '&:hover fieldset': { borderColor: '#1a237e !important' },
//                     '&.Mui-focused fieldset': { borderColor: '#1a237e !important', borderWidth: '2px' },
//                   },
//                   '& .MuiInputBase-input': { color: '#2c3e50 !important', '-webkit-text-fill-color': '#2c3e50 !important' },
//                   '& .MuiInputBase-input::placeholder': { color: '#7f8c8d !important', opacity: '1 !important', '-webkit-text-fill-color': '#7f8c8d !important' }
//                 }}
//               />

//               <Button
//                 type="submit"
//                 disabled={loading || !prompt.trim() || isRecording}
//                 startIcon={!loading && <SearchIcon sx={{ ml: 1, mr: 0 }} />}
//                 sx={{
//                   fontFamily: 'A, sans-serif', fontWeight: 900, fontSize: '1.1rem', backgroundColor: '#1a237e', color: '#ffffff !important', px: 4, py: { xs: 1.5, sm: 0 }, borderRadius: '8px', whiteSpace: 'nowrap', minWidth: '140px',
//                   transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
//                   '&:hover': { backgroundColor: '#12185c', boxShadow: '0px 6px 20px rgba(26, 35, 126, 0.4)', transform: 'translateY(-2px)' },
//                   '&:active': { transform: 'scale(0.95) translateY(0px)' },
//                   '&:disabled': { backgroundColor: '#e0e0e0 !important', color: '#9e9e9e !important', transform: 'none !important', boxShadow: 'none !important' }
//                 }}
//               >
//                 {loading && !isRecording ? <CircularProgress size={24} color="inherit" /> : 'إرسال'}
//               </Button>
//             </Box>
//           </Box>

//         </Paper>
//       </Container>
//     </Box>
//   );
// }