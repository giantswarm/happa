import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetVersionInspector from '../ClusterDetailAppListWidgetVersionInspector';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetVersionInspector
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <ClusterDetailAppListWidgetVersionInspector {...p} />
  );

  return getComponentWithStore(
    Component,
    props,
    undefined,
    undefined,
    history,
    auth
  );
}

describe('ClusterDetailAppListWidgetVersionInspector', () => {
  it('renders without crashing', () => {
    render(getComponent({ onSelectVersion: () => {} }));
  });
});
