import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
} from '@mui/material';

export default function ArticleCard({ article, mode }) {
  const isDark = mode === 'dark';

  return (
    <Card
      sx={{
        width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' },
        bgcolor: isDark ? '#140e28' : '#ffffff',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.05)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'rgba(124, 77, 255, 0.5)',
          boxShadow: '0 10px 30px rgba(124, 77, 255, 0.2)',
        },
      }}
    >
      <Box sx={{ overflow: 'hidden', position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={article.image}
          alt={article.title}
          sx={{
            transition: 'transform 0.5s ease',
            '&:hover': { transform: 'scale(1.08)' },
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            color: isDark ? '#ffffff' : '#1a1523',
            fontWeight: 700,
            mb: 1.5,
            fontSize: '1.2rem',
            fontFamily: "'Orbitron', sans-serif",
          }}
        >
          {article.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: isDark
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(26, 21, 35, 0.65)',
            lineHeight: 1.6,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {article.description}
        </Typography>
      </CardContent>

      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          variant="text"
          color="primary"
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            p: 0,
            fontWeight: 700,
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '1px',
            fontSize: '0.85rem',
            '&:hover': {
              background: 'transparent',
              color: '#9c4dff',
            },
          }}
        >
          READ ARTICLE →
        </Button>
      </Box>
    </Card>
  );
}