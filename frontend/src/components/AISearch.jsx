import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete'; // الأيقونة المستقرة والمصححة لـ Vite
import axios from 'axios';

export default function AISearch() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // مصفوفة لتخزين سجل المحادثة كاملة (القديم والجديد)
  const [chatHistory, setChatHistory] = useState([]);
  
  const chatBottomRef = useRef(null);

  // تأثير للتمرير التلقائي لأسفل الشاشة عند ظهور رد جديد
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userQuestion = prompt.trim();
    setLoading(true);
    setError('');
    setPrompt(''); // تفريغ الحقل فوراً لتجربة مستخدم سلسة

    // 1. إضافة سؤال المستخدم فوراً إلى واجهة المحادثة
    setChatHistory(prev => [...prev, { role: 'user', text: userQuestion }]);

    try {
      // الاتصال بسيرفر لارافل المطور عبر الـ Endpoint الخاص بك
      const res = await axios.post('http://127.0.0.1:8000/api/ai/search', {
        prompt: userQuestion
      });

      if (res.data.success) {
        // 2. إضافة رد الذكاء الاصطناعي إلى سجل المحادثة للاحتفاظ به مع القديم
        setChatHistory(prev => [...prev, { role: 'ai', text: res.data.text }]);
      } else {
        setError(res.data.message || 'حدث خطأ ما أثناء جلب البيانات.');
      }
    } catch (err) {
      console.error(err);
      setError('تعذر الاتصال بالسيرفر الخلفي. تأكد من تشغيله.');
    } finally {
      setLoading(false);
    }
  };

  // دالة لتفريغ المحادثة والبدء من جديد عند الحاجة
  const clearChat = () => {
    setChatHistory([]);
    setError('');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '85vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 3,
        backgroundColor: '#0a0b10', // الخلفية الداكنة العميقة للتطبيق
        direction: 'rtl'
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={4} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '16px', 
            backgroundColor: '#ffffff', // الكارد يظل أبيض ناصعاً بوضوح وثبات
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '80vh' // تحديد حد أقصى لطول الكارد لضمان مرونة الشات
          }}
        >
          {/* رأس الكارد يحتوي على العنوان وزر مسح السجل */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#1a237e' }}
            >
              Ai Search
            </Typography>
            
            {chatHistory.length > 0 && (
              <Button 
                onClick={clearChat}
                variant="text" 
                color="error"
                startIcon={<DeleteIcon sx={{ ml: 1, mr: 0 }} />} // تم التحديث هنا بنجاح
                sx={{ fontFamily: 'A, sans-serif', fontWeight: 900 }}
              >
                مسح المحادثة
              </Button>
            )}
          </Box>

          {/* منطقة عرض الرسائل المتعاقبة (تاريخ المحادثة) */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              mb: 3, 
              pr: 1,
              pl: 1,
              maxHeight: '45vh',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '4px' }
            }}
          >
            {chatHistory.map((msg, index) => (
              <Box key={index} sx={{ mb: 3, textAlign: 'right' }}>
                {msg.role === 'user' ? (
                  /* تصميم فقاعة سؤال المستخدم القديم والجديد */
                  <Box sx={{ mb: 1 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#1a237e !important', mb: 0.5 }}
                    >
                      أنت:
                    </Typography>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        display: 'inline-block',
                        borderRadius: '12px 0px 12px 12px',
                        backgroundColor: '#e8eaf6',
                        fontFamily: 'A, sans-serif',
                        fontWeight: 900,
                        color: '#1a237e !important',
                        maxWidth: '85%'
                      }}
                    >
                      {msg.text}
                    </Paper>
                  </Box>
                ) : (
                  /* تصميم فقاعة جواب الذكاء الاصطناعي المتناسق */
                  <Box sx={{ mb: 1 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ fontFamily: 'A, sans-serif', fontWeight: 900, color: '#666666 !important', mb: 0.5 }}
                    >
                      الرد الذكي:
                    </Typography>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: '0px 12px 12px 12px',
                        backgroundColor: '#f5f6fa',
                        borderRight: '4px solid #1a237e', 
                        fontFamily: 'A, sans-serif',
                        fontWeight: 100,
                        lineHeight: 1.8,
                        color: '#2c3e50 !important',
                        fontSize: '1.05rem',
                        whiteSpace: 'pre-line',
                        display: 'block'
                      }}
                    >
                      {msg.text}
                    </Paper>
                  </Box>
                )}
              </Box>
            ))}

            {/* مؤشر التحميل أثناء انتظار الرد الجديد */}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={18} sx={{ color: '#1a237e' }} />
                <Typography sx={{ fontFamily: 'A, sans-serif', fontSize: '0.9rem', color: '#666' }}>
                  جاري تفكير وإعداد الرد الذكي...
                </Typography>
              </Box>
            )}

            {/* خطأ الاتصال إن وجد */}
            {error && (
              <Box 
                sx={{ 
                  p: 2, mt: 2, borderRadius: '8px', 
                  backgroundColor: '#ffebee', borderLeft: '4px solid #d32f2f',
                  color: '#c62828 !important', fontFamily: 'A, sans-serif'
                }}
              >
                {error}
              </Box>
            )}
            
            {/* نقطة مرجعية للتمرير التلقائي لسلسلة الرسائل */}
            <div ref={chatBottomRef} />
          </Box>

          <hr style={{ border: '0', borderTop: '1px solid #e0e0e0', marginBottom: '20px' }} />

          {/* نموذج البحث (حقل الإدخال والزر مثبتان في الأسفل دائماً) */}
          <Box component="form" onSubmit={handleSearch}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'stretch'
              }}
            >
              {/* الحقل الآمن بالكامل ضد تأثيرات وتلوين الوضع الداكن الافتراضية للـ MUI */}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="اكتب سؤالاً آخر أو ابحث عن شيء جديد هنا..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'A, sans-serif',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa', 
                    color: '#2c3e50 !important', 
                    '& fieldset': { borderColor: '#cccccc !important' },
                    '&:hover fieldset': { borderColor: '#1a237e !important' },
                    '&.Mui-focused fieldset': { borderColor: '#1a237e !important', borderWidth: '2px' },
                  },
                  '& .MuiInputBase-input': {
                    color: '#2c3e50 !important',
                    '-webkit-text-fill-color': '#2c3e50 !important',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#7f8c8d !important',
                    opacity: '1 !important',
                    '-webkit-text-fill-color': '#7f8c8d !important',
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !prompt.trim()}
                startIcon={!loading && <SearchIcon sx={{ ml: 1, mr: 0 }} />}
                sx={{
                  fontFamily: 'A, sans-serif',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  backgroundColor: '#1a237e', 
                  color: '#ffffff !important',
                  px: 4,
                  py: { xs: 1.5, sm: 0 },
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  minWidth: '140px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#12185c',
                    boxShadow: '0px 7px 15px rgba(26, 35, 126, 0.4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'إرسال'}
              </Button>
            </Box>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}