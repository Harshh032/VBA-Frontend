import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton } from '@mui/material';
import { Description, Download, Delete } from '@mui/icons-material';

const Documents: React.FC = () => {
  const documents = [
    {
      id: 1,
      name: 'Project Proposal.pdf',
      size: '2.5 MB',
      date: '2024-03-15'
    },
    {
      id: 2,
      name: 'Meeting Notes.docx',
      size: '1.2 MB',
      date: '2024-03-14'
    },
    {
      id: 3,
      name: 'Budget.xlsx',
      size: '3.1 MB',
      date: '2024-03-13'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Documents
        </Typography>
        
        <Paper sx={{ p: 2 }}>
          <List>
            {documents.map((doc, index) => (
              <React.Fragment key={doc.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="download">
                        <Download />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Description color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.name}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" color="text.secondary">
                          Size: {doc.size}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded on {doc.date}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < documents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Documents; 