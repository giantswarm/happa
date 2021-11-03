import { addDecorator } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import theme from 'styles/theme';
import ThemeProvider from 'styles/ThemeProvider';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/app.sass';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

addDecorator((story) => (
  <MemoryRouter>
    <ThemeProvider theme={theme}>{story()}</ThemeProvider>
  </MemoryRouter>
));
