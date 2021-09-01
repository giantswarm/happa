import { Box } from 'grommet';
import React from 'react';

// This is a simple presentational component used at the end of Getting Started
// documentation pages.
// It centers the navigational buttons at the end of those docs.

const GettingStartedBottomNav: React.FC = ({ children }) => (
  <Box direction='row' margin={{ top: 'large' }} justify='center' gap='small'>
    {children}
  </Box>
);

export default GettingStartedBottomNav;
