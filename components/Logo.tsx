import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

export type KylrixApp = 'root' | 'vault' | 'flow' | 'note' | 'connect';

interface LogoProps {
  sx?: any;
  size?: number;
  app?: KylrixApp;
  variant?: 'full' | 'icon';
  component?: any;
  href?: string;
}

const flowOffset = keyframes`
  0% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
`;

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'all 0.3s ease',
  textDecoration: 'none'
});

const Logo: React.FC<LogoProps> = ({ 
  sx, 
  size = 40, 
  app = 'flow', 
  variant = 'full',
  component,
  href
}) => {
  const configs = {
    root: { color1: "#6366F1", color2: "#00A3FF", name: "KYLRIX", desc: "Ecosystem Hub" },
    vault: { color1: "#6366F1", color2: "#222222", name: "VAULT", desc: "Zero-Knowledge Storage" },
    flow: { color1: "#00FF94", color2: "#00B2FF", name: "FLOW", desc: "AI Orchestration" },
    note: { color1: "#6366F1", color2: "#A855F7", name: "NOTE", desc: "Structured Intelligence" },
    connect: { color1: "#F43F5E", color2: "#FB923C", name: "CONNECT", desc: "P2P Encryption" }
  };

  const current = configs[app];

  return (
    <LogoContainer sx={sx} component={component} href={href}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-${app}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={current.color1} />
            <stop offset="100%" stopColor={current.color2} />
          </linearGradient>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" /><feComposite operator="in" in="noise" in2="SourceGraphic" result="composite" /><feBlend mode="overlay" in="composite" in2="SourceGraphic" /></filter>
        </defs>

        {app === 'flow' && (
          <>
            <path d="M30 20V80" stroke={`url(#grad-${app})`} strokeWidth="8" strokeLinecap="round" />
            <path
              d="M70 20L35 50L70 80"
              stroke={`url(#grad-${app})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 5"
              style={{ animation: `${flowOffset} 5s linear infinite` }}
            />
          </>
        )}
        
        {(app === 'root' || app === 'vault' || app === 'note' || app === 'connect') && (
           <g filter="url(#grain)">
             <path d="M30 20V80" stroke={`url(#grad-${app})`} strokeWidth="10" strokeLinecap="round" />
             <path d="M70 20L35 50L70 80" stroke={`url(#grad-${app})`} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
             <circle cx="35" cy="50" r="5" fill="#fff" />
           </g>
        )}
      </svg>
      {variant === 'full' && (
        <Box>
          <Typography sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', fontSize: `${size * 0.7}px`, lineHeight: 1, textTransform: 'uppercase', fontFamily: 'inherit' }}>
            {current.name}
          </Typography>
        </Box>
      )}
    </LogoContainer>
  );
};

export default Logo;
