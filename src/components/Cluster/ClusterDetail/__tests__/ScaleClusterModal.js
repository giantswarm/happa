import { renderWithTheme } from 'testUtils/renderUtils';

import ScaleClusterModal from '../ScaleClusterModal';

const renderWithProps = (props = {}) => {
  return renderWithTheme(ScaleClusterModal, props);
};

describe('ScaleClusterModal', () => {
  it('renders without crashing', () => {
    renderWithProps();
  });
});
