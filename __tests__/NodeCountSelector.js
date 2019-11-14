import { cleanup, render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import theme from 'styles/theme';

// Components
import NodeCountSelector from 'shared/NodeCountSelector';

describe('NodeCountSelector', () => {
  afterEach(cleanup);

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <NodeCountSelector />
      </ThemeProvider>
    );
  });

  it('shows 1 picker with autoscale off', () => {
    const { getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <NodeCountSelector autoscalingEnabled={false} />
      </ThemeProvider>
    );

    expect(getAllByTestId('node-count-selector-picker').length).toBe(1);
  });

  it('shows 2 pickers with autoscale on', () => {
    const { getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <NodeCountSelector autoscalingEnabled={true} />
      </ThemeProvider>
    );

    expect(getAllByTestId('node-count-selector-picker').length).toBe(2);
  });
});
