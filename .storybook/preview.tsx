import React from 'react';
import { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import theme from '../src/styles/theme';
import ThemeProvider from '../src/components/ThemeProvider';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/app.sass';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </MemoryRouter>
    ),
  ],
};

export default preview;
