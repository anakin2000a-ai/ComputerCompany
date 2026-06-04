import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogContent,
  Divider,
  TextField,
  IconButton,
  Zoom,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import FeatureCard from '../components/FeatureCard';
import { features } from '../data/features.jsx';

export default function HomePage({ mode }) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <>
      <Box
        sx={{
          background:
            mode === 'dark'
              ? 'linear-gradient(180deg, rgba(20, 14, 40, 0.5) 0%, rgba(9, 5, 20, 0.5) 100%)'
              : 'linear-gradient(180deg, rgba(240, 237, 255, 0.5) 0%, rgba(248, 247, 255, 0.5) 100%)',
          py: 14,
          textAlign: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 900 }}>
            The Ultimate Rig For{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              Developers
            </Box>
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 5, mx: 'auto', maxWidth: '700px' }}
          >
            Unleash cosmic power. Engineered by experts, trusted by dev peers worldwide.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ width: 'auto', mx: 'auto' }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                px: 5,
                py: 1.8,
                borderRadius: '8px',
                fontWeight: 'bold',
                minWidth: '200px',
                whiteSpace: 'nowrap',
              }}
            >
              Deploy Custom Rig
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              sx={{
                px: 5,
                py: 1.8,
                borderRadius: '8px',
                fontWeight: 'bold',
                minWidth: '200px',
                whiteSpace: 'nowrap',
              }}
            >
              View Specs
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 800, mb: 8 }}
        >
          Built For Extreme Workloads
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              mode={mode}
              onConfigure={setSelectedFeature}
            />
          ))}
        </Box>
      </Container>

      <Dialog
        open={Boolean(selectedFeature)}
        onClose={() => setSelectedFeature(null)}
        TransitionComponent={Zoom}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
            },
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: mode === 'dark' ? '#0b071a' : '#ffffff',
            backgroundImage: 'none',
            borderRadius: '16px',
            border:
              mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(0, 0, 0, 0.08)',
            p: 1,
          },
        }}
      >
        {selectedFeature && (
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: mode === 'dark' ? '#ffffff' : 'text.primary',
                }}
              >
                {selectedFeature.title}
              </Typography>

              <IconButton
                onClick={() => setSelectedFeature(null)}
                sx={{ color: mode === 'dark' ? '#ffffff' : 'inherit' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider
              sx={{
                mb: 2,
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'divider',
              }}
            />

            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
              }}
            >
              {selectedFeature.details}
            </Typography>

            <TextField
              fullWidth
              placeholder="e.g. x54"
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: mode === 'dark' ? '#04020a' : '#f8f9fa',
                  '& fieldset': {
                    borderColor:
                      mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputBase-input': {
                  color: mode === 'dark' ? '#ffffff' : 'text.primary',
                },
              }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setSelectedFeature(null)}
              sx={{ py: 1.5, fontWeight: 'bold', borderRadius: '8px' }}
            >
              Save Custom Profile
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}