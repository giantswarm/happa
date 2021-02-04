import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { Providers } from 'shared/constants';
import { renderWithTheme } from 'testUtils/renderUtils';

import V5ClusterDetailTableNodePoolScaling from '../V5ClusterDetailTableNodePoolScaling';

describe('V5ClusterDetailTableNodePoolScaling', () => {
  describe('Azure', () => {
    it('does not render the spot instances column if the feature is unsupported', () => {
      renderWithTheme(V5ClusterDetailTableNodePoolScaling, {
        provider: Providers.AZURE,
        supportsSpotInstances: false,
      });

      expect(screen.queryByText(/spot instances/i)).not.toBeInTheDocument();
    });

    it('renders the spot instances column if the feature is supported', async () => {
      renderWithTheme(V5ClusterDetailTableNodePoolScaling, {
        provider: Providers.AZURE,
        supportsSpotInstances: true,
      });

      const labelElement = screen.getByText('Spot instances');
      expect(labelElement).toBeInTheDocument();

      // Hover over element to see explanation.
      fireEvent.mouseEnter(labelElement);
      const explanationText = 'Whether Spot instances are used or not.';
      const explanationElement = screen.getByText(explanationText);
      expect(explanationElement).toBeInTheDocument();
      fireEvent.mouseLeave(labelElement);

      await waitForElementToBeRemoved(() => screen.getByText(explanationText));
    });
  });
});
