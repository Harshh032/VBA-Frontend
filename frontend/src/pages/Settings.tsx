import React from 'react';
import { Box, Container, Typography, Paper, Switch, FormControlLabel } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Email Notifications"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Push Notifications"
          />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Privacy Settings
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Show Profile to Public"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Allow Messages from Anyone"
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings; 