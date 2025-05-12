import React from 'react';
import { Box, Container, Typography, Paper, TextField, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Messages: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Messages
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <List>
              <ListItem>
                <ListItemText
                  primary="John Doe"
                  secondary="Hello! How are you doing?"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Jane Smith"
                  secondary="Can we schedule a meeting tomorrow?"
                />
              </ListItem>
            </List>
            
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                size="small"
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                sx={{ minWidth: '100px' }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Messages; 