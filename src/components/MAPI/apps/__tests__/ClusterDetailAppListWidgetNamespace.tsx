import { screen } from '@testing-library/react';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailAppListWidgetNamespace from '../ClusterDetailAppListWidgetNamespace';

describe('ClusterDetailAppListWidgetNamespace', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailAppListWidgetNamespace, {});
  });

  it('displays the app target namespace', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    renderWithTheme(ClusterDetailAppListWidgetNamespace, {
      app,
    });

    expect(
      screen.getByLabelText('App target namespace: giantswarm')
    ).toBeInTheDocument();
  });
});
