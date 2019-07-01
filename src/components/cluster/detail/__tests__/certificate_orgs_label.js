import '@testing-library/react/cleanup-after-each';
import 'jest-dom/extend-expect';
import { render } from '@testing-library/react';
import React from 'react';

import CertificateOrgsLabel from '../certificate_orgs_label.js';

it('renders single label without crashing', () => {
  const div = document.createElement('div');
  render(<CertificateOrgsLabel value={'foobar'} />, div);
});

it('renders multiple labels without crashing', () => {
  const div = document.createElement('div');
  render(<CertificateOrgsLabel value={'foobar,foo,bar'} />, div);
});

it('renders empty label without crashing', () => {
  const div = document.createElement('div');
  render(<CertificateOrgsLabel value={''} />, div);
});

it('renders multiple labels in alphabetic order', () => {
  const { getByTestId } = render(
    <CertificateOrgsLabel value={'Exa,Mega,Atto,Zepto,Yokto'} />
  );

  expect(getByTestId('orglabel-0')).toHaveTextContent('Atto');
  expect(getByTestId('orglabel-1')).toHaveTextContent('Exa');
  expect(getByTestId('orglabel-2')).toHaveTextContent('Mega');
  expect(getByTestId('orglabel-3')).toHaveTextContent('Yokto');
  expect(getByTestId('orglabel-4')).toHaveTextContent('Zepto');
});
