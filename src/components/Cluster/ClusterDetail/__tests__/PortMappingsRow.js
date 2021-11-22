import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from 'styles/theme';
import ThemeProvider from 'ThemeProvider';

import PortMappingsRow from '../PortMappingsRow';

it('renders without crashing', () => {
  render(
    <Router>
      <ThemeProvider theme={theme}>
        <PortMappingsRow />
      </ThemeProvider>
    </Router>
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
