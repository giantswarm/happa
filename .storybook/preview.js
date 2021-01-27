import { addDecorator } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router';
import theme from 'styles/theme';
import ThemeProvider from 'styles/ThemeProvider';

import 'babel-polyfill';
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'noty/lib/noty.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'styles/app.sass';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

addDecorator((story) => (
  <MemoryRouter>
    <ThemeProvider theme={theme}>{story()}</ThemeProvider>
  </MemoryRouter>
));
