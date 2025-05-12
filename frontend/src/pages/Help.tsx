import React from 'react';
import { Box, Container, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Divider } from '@mui/material';
import { ExpandMore, Help as HelpIcon, ContactSupport, Email } from '@mui/icons-material';

const Help: React.FC = () => {
  const faqs = [
    {
      question: 'How do I update my profile?',
      answer: 'To update your profile, go to the Profile page and click the Edit Profile button. You can then modify your information and save the changes.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the Login page and click on "Forgot Password". Follow the instructions sent to your email.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can contact our support team through the Contact Us page or by emailing support@example.com.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Help & Support
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contact Support
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText
                primary="Email Support"
                secondary="support@example.com"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <ContactSupport />
              </ListItemIcon>
              <ListItemText
                primary="Live Chat"
                secondary="Available Monday-Friday, 9AM-5PM"
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Help; 