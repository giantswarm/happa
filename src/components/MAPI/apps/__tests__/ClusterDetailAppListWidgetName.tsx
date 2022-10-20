import { screen } from '@testing-library/react';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailAppListWidgetName from '../ClusterDetailAppListWidgetName';

describe('ClusterDetailAppListWidgetName', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailAppListWidgetName, {});
  });

  it('displays the app name', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'some-app',
    });

    renderWithTheme(ClusterDetailAppListWidgetName, {
      app,
    });

    expect(screen.getByLabelText('App name: some-app')).toBeInTheDocument();
  });
});
