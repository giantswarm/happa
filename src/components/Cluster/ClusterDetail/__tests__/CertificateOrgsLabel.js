import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import React from 'react';

import CertificateOrgsLabel from '../CertificateOrgsLabel';

it('renders single label without crashing', () => {
  render(<CertificateOrgsLabel value='foobar' />);
});

it('renders multiple labels without crashing', () => {
  render(<CertificateOrgsLabel value='foobar,foo,bar' />);
});

// eslint-disable-next-line no-empty-function
it('renders empty label without crashing', () => {});

it('renders multiple labels in alphabetic order', () => {
  const { getByTestId } = render(
    <CertificateOrgsLabel value='Exa,Mega,Atto,Zepto,Yokto' />
  );

  expect(getByTestId('orglabel-0')).toHaveTextContent('Atto');
  expect(getByTestId('orglabel-1')).toHaveTextContent('Exa');
  expect(getByTestId('orglabel-2')).toHaveTextContent('Mega');
  expect(getByTestId('orglabel-3')).toHaveTextContent('Yokto');
  expect(getByTestId('orglabel-4')).toHaveTextContent('Zepto');
});
