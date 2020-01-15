import { fireEvent } from '@testing-library/react';
import React from 'react';
import { AWSInfoResponse, v4AWSClusterResponse } from 'testUtils/mockHttpCalls';
import { renderWithStore } from 'testUtils/renderUtils';

import ScaleClusterModal from '../ScaleClusterModal';

const elementIDs = {
  Title: 'scale-cluster-modal/title',
  Footer: 'scale-cluster-modal/footer',
};

const renderWithProps = (props = {}) => {
  const elementRef = React.createRef();

  const initialState = {
    app: {
      info: AWSInfoResponse,
    },
  };
  const defaultProps = Object.assign(
    {},
    {
      ref: elementRef,
      cluster: v4AWSClusterResponse,
    },
    props
  );

  const element = renderWithStore(
    ScaleClusterModal,
    defaultProps,
    initialState
  );

  // Make modal visible
  elementRef.current.show();

  return element;
};

describe('ScaleClusterModal', () => {
  it('renders without crashing', () => {
    renderWithProps();
  });

  it('has the cluster id in the title', () => {
    const { getByTestId } = renderWithProps();
    const titleElement = getByTestId(elementIDs.Title);

    const hasIdInTitle = titleElement.textContent.includes(
      v4AWSClusterResponse.id
    );

    expect(hasIdInTitle).toBeTruthy();
  });

  it('has a cancel button in the footer, that closes the modal', () => {
    const { getByText } = renderWithProps();

    const cancelButton = getByText('Cancel');
    expect(cancelButton.tagName.toLowerCase()).toBe('button');

    fireEvent.click(cancelButton);
  });
});
