import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton } from '@mui/material';
import { Bookmark, Delete, OpenInNew } from '@mui/icons-material';

const Bookmarks: React.FC = () => {
  const bookmarks = [
    {
      id: 1,
      title: 'Important Article',
      description: 'A must-read article about web development',
      url: 'https://example.com/article1',
      date: '2024-03-15'
    },
    {
      id: 2,
      title: 'Tutorial Video',
      description: 'React hooks tutorial for beginners',
      url: 'https://example.com/video1',
      date: '2024-03-14'
    },
    {
      id: 3,
      title: 'Documentation',
      description: 'Official documentation for the new API',
      url: 'https://example.com/docs',
      date: '2024-03-13'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bookmarks
        </Typography>
        
        <Paper sx={{ p: 2 }}>
          <List>
            {bookmarks.map((bookmark, index) => (
              <React.Fragment key={bookmark.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="open" href={bookmark.url} target="_blank">
                        <OpenInNew />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Bookmark color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={bookmark.title}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" color="text.secondary">
                          {bookmark.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Added on {bookmark.date}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < bookmarks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Bookmarks; 