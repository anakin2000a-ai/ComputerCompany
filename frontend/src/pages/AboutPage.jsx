import { Box, Container, Typography } from '@mui/material';

import ArticleCard from '../components/ArticleCard';
import { articles } from '../data/articles';

export default function AboutPage({ mode }) {
  const isDark = mode === 'dark';

  return (
    <Box
      sx={{
        bgcolor: isDark ? '#090514' : '#f8f7ff',
        py: { xs: 8, md: 12 },
        flexGrow: 1,
        color: isDark ? '#ffffff' : '#1a1523',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
            mb: 12,
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: '66.66%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '2px',
                display: 'block',
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              OUR SYSTEM MANIFESTO
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 4,
                mt: 1,
                fontSize: { xs: '2.5rem', sm: '3.2rem', md: '3.75rem' },
                fontFamily: "'Orbitron', sans-serif",
                color: isDark ? '#ffffff' : '#1a1523',
              }}
            >
              About Nexus Labs
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{
                color: isDark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(26, 21, 35, 0.7)',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                mb: 3,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Founded by system engineers, Nexus Labs specializes in crafting custom computing
              rigs optimized for deep-stack programming, automated compiling, and large local
              artificial intelligence modeling workloads.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: isDark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(26, 21, 35, 0.7)',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Every environment we deploy leverages premium overclocking tolerances and custom
              hardware keys to guarantee maximum security alongside flawless computation.
            </Typography>
          </Box>

          <Box
            sx={{
              width: { xs: '100%', md: '33.33%' },
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(124, 77, 255, 0.15)',
                border: '1px solid rgba(124, 77, 255, 0.3)',
                width: '100%',
                '&:hover img': { transform: 'scale(1.05)' },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(135deg, rgba(124, 77, 255, 0.3) 0%, rgba(9, 5, 20, 0.6) 100%)',
                  mixBlendMode: 'color',
                  zIndex: 1,
                  pointerEvents: 'none',
                },
              }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop"
                alt="Nexus Labs Hardware Infrastructure"
                sx={{
                  width: '100%',
                  height: '250px',
                  maxHeight: { xs: '320px', md: '450px', lg: '500px' },
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'brightness(0.85) contrast(1.1)',
                  transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px',
              color: isDark ? '#ffffff' : '#1a1523',
            }}
          >
            Latest System Insights
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(26, 21, 35, 0.6)',
              mb: 6,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Technical breakdown, hardware updates, and structural logs from the cluster.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} mode={mode} />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}