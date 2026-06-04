import { Box, Container, Typography, Link } from '@mui/material';

export default function Footer({ mode }) {
  const footerHeadingStyle = {
    color: mode === 'dark' ? '#ffffff' : '#090514',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontSize: '1.15rem',
    pb: 1,
    mb: 3,
    borderBottom: mode === 'dark' ? '2px solid #ffffff' : '2px solid #090514',
    display: 'inline-block',
    fontFamily: "'Orbitron', 'Inter', 'Segoe UI', sans-serif",
  };

  const footerBodyStyle = {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontSize: '0.95rem',
    lineHeight: 1.8,
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: mode === 'dark' ? '#090514' : '#f0edff',
        pt: 8,
        pb: 4,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: { xs: 5, md: 4 },
          }}
        >
          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Typography variant="subtitle1" sx={footerHeadingStyle}>
              Quick Links
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link
                href="#"
                underline="none"
                sx={{
                  ...footerBodyStyle,
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                Core Systems
              </Link>

              <Link
                href="#"
                underline="none"
                sx={{
                  ...footerBodyStyle,
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                AI Workstations
              </Link>

              <Link
                href="#"
                underline="none"
                sx={{
                  ...footerBodyStyle,
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                Documentation
              </Link>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Typography variant="subtitle1" sx={footerHeadingStyle}>
              Communication
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={footerBodyStyle}
              >
                <Box
                  component="span"
                  sx={{ color: 'primary.main', fontWeight: 'bold' }}
                >
                  Email:{' '}
                </Box>
                ops@nexuslabs.dev
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={footerBodyStyle}
              >
                <Box
                  component="span"
                  sx={{ color: 'primary.main', fontWeight: 'bold' }}
                >
                  HQ Node:{' '}
                </Box>
                Cluster-7, SF, CA
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '33%' } }}>
            <Typography variant="subtitle1" sx={footerHeadingStyle}>
              About Us
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ...footerBodyStyle, lineHeight: 1.8 }}
            >
              Nexus Labs builds ultra-premium computing rigs specifically
              optimized for deep-stack programmers and data engineers.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 8,
            pt: 3,
            borderTop:
              mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.05)'
                : '1px solid rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: "'Inter', sans-serif" }}
          >
            © {new Date().getFullYear()} Nexus Labs Inc.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}