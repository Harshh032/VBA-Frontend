import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const Calendar: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Calendar
        </Typography>
        
        <Paper sx={{ p: 3, minHeight: '500px' }}>
          <Typography variant="body1">
            Calendar view will be implemented here
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Calendar; 