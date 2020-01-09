import React from 'react';
import { renderWithTheme } from 'testUtils/renderUtils';

import ChangePasswordForm from '../ChangePasswordForm';

const renderWithProps = (props = {}) =>
  renderWithTheme(ChangePasswordForm, props);

describe('ChangePasswordForm', () => {
  it('renders without crashing', () => {
    renderWithProps();
  });
});
