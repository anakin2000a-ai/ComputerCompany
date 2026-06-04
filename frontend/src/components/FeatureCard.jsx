import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material';

export default function FeatureCard({ feature, mode, onConfigure }) {
  return (
    <Card
      sx={{
        flex: '1 1 33.33%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '12px',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: 'primary.main',
          transition: 'all 0.3s',
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', pt: 5, px: 3 }}>
        <Box
          sx={{
            mb: 3,
            display: 'inline-flex',
            p: 2,
            bgcolor: mode === 'dark' ? '#211842' : '#f0edff',
            borderRadius: '50%',
          }}
        >
          {feature.icon}
        </Box>

        <Typography gutterBottom variant="h5" sx={{ fontWeight: 'bold' }}>
          {feature.title}
        </Typography>

        <Typography color="text.secondary" variant="body2">
          {feature.desc}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
        <Button
          size="small"
          color="primary"
          onClick={() => onConfigure(feature)}
          sx={{ fontWeight: 'bold' }}
        >
          Configure Architecture →
        </Button>
      </CardActions>
    </Card>
  );
}