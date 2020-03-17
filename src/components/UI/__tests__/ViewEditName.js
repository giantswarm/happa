import { render } from '@testing-library/react';
import React from 'react';
import ViewEditName from 'UI/ViewEditName';

const renderComponent = (props = {}) => {
  return render(<ViewEditName {...props} />);
};

describe('ViewEditName', () => {
  it('renders without crashing', () => {
    renderComponent();
  });
});
