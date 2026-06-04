import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import SecurityIcon from '@mui/icons-material/Security';

export const features = [
  {
    icon: <SpeedIcon fontSize="large" color="primary" />,
    title: 'Quantum Speed',
    desc: 'Equipped with custom overclocked architectures for blazing-fast compiling and rendering.',
    details: 'Fine-tune core voltage, clock multipliers, and liquid cooling thresholds.',
  },
  {
    icon: <MemoryIcon fontSize="large" color="primary" />,
    title: 'Neural Graphics',
    desc: 'Next-gen ray tracing units built specifically for AI workloads and extreme gaming.',
    details: 'Allocate VRAM weights across tensor processing nodes.',
  },
  {
    icon: <SecurityIcon fontSize="large" color="primary" />,
    title: 'Cryptographic Security',
    desc: 'Hardware-isolated security keys keeping your code and data locked down tight.',
    details: 'Provision secure physical enclaves, manage local AES-256 root seeds.',
  },
];