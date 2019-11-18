import { cleanup, render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import theme from 'styles/theme';

// Components
import NodeCountSelector from 'shared/NodeCountSelector';

function renderWithProps(props) {
  return render(
    <ThemeProvider theme={theme}>
      <NodeCountSelector {...props} />
    </ThemeProvider>
  );
}

describe('NodeCountSelector', () => {
  afterEach(cleanup);

  it('renders without crashing', () => {
    renderWithProps({});
  });

  it('shows 1 picker with autoscale off', () => {
    const { getAllByTestId } = renderWithProps({ autoscalingEnabled: false });

    expect(getAllByTestId('node-count-selector-picker').length).toBe(1);
  });

  it('shows 2 pickers with autoscale on', () => {
    const { getAllByTestId } = renderWithProps({ autoscalingEnabled: true });

    expect(getAllByTestId('node-count-selector-picker').length).toBe(2);
  });
});
