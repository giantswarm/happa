import { screen } from '@testing-library/react';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailAppListWidgetStatus from '../ClusterDetailAppListWidgetStatus';

describe('ClusterDetailAppListWidgetStatus', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailAppListWidgetStatus, {});
  });

  it('displays the app status', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    app.status!.release.status = 'deployed';

    renderWithTheme(ClusterDetailAppListWidgetStatus, {
      app,
    });

    expect(screen.getByLabelText('App status: deployed')).toBeInTheDocument();
  });

  it(`displays a 'n/a' label if the app status is not there`, () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    delete app.status!.release.status;

    renderWithTheme(ClusterDetailAppListWidgetStatus, {
      app,
    });

    expect(
      screen.getByLabelText('no information available')
    ).toBeInTheDocument();
  });
});
