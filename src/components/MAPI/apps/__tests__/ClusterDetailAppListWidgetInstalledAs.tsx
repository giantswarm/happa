import { screen } from '@testing-library/react';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailAppListWidgetInstalledAs from '../ClusterDetailAppListWidgetInstalledAs';

describe('ClusterDetailAppListWidgetInstalledAs', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailAppListWidgetInstalledAs, {});
  });

  it('displays the app installed as name', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      name: 'some-app-alias',
    });

    renderWithTheme(ClusterDetailAppListWidgetInstalledAs, {
      app,
    });

    expect(
      screen.getByLabelText('App installed as: some-app-alias')
    ).toBeInTheDocument();
  });
});
