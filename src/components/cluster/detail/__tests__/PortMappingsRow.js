import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import theme from 'styles/theme';

import PortMappingsRow from '../PortMappingsRow';

it('renders without crashing', () => {
  const div = document.createElement('div');
  render(
    <Router>
      <ThemeProvider theme={theme}>
        <PortMappingsRow />
      </ThemeProvider>
    </Router>,
    div
  );
});

it('shows port mappings when given a valid cluster object', () => {
  const { getByText } = render(
    <Router>
      <ThemeProvider theme={theme}>
        <PortMappingsRow
          cluster={{
            kvm: { port_mappings: [{ protocol: 'http', port: '12345' }] },
          }}
        />
      </ThemeProvider>
    </Router>
  );

  expect(getByText(/HTTP/)).toBeInTheDocument();
  expect(getByText(/12345/i)).toBeInTheDocument();
});

it('doesnt show port mappings when given an invalid cluster object', () => {
  const { queryByText } = render(
    <Router>
      <ThemeProvider theme={theme}>
        <PortMappingsRow cluster={{ kvm: { yolo: [{ foo: 'bar' }] } }} />
      </ThemeProvider>
    </Router>
  );

  expect(queryByText(/Ingress ports/i)).not.toBeInTheDocument();
});
