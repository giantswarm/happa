import { AWSInfoResponse, v4AWSClusterResponse } from 'testUtils/mockHttpCalls';
import { renderWithStore } from 'testUtils/renderUtils';

import ScaleClusterModal from '../ScaleClusterModal';

const renderWithProps = (props = {}) => {
  const initialState = {
    app: {
      info: AWSInfoResponse,
    },
  };
  const defaultProps = Object.assign(
    {},
    {
      cluster: v4AWSClusterResponse,
    },
    props
  );

  return renderWithStore(ScaleClusterModal, defaultProps, initialState);
};

describe('ScaleClusterModal', () => {
  it('renders without crashing', () => {
    renderWithProps();
  });
});
