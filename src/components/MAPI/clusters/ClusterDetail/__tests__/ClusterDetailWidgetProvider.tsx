import { screen } from '@testing-library/react';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import * as capzv1alpha3Mocks from 'testUtils/mockHttpCalls/capzv1alpha3';
import { renderWithTheme } from 'testUtils/renderUtils';

import ClusterDetailWidgetProvider from '../ClusterDetailWidgetProvider';

type ComponentProps = React.ComponentPropsWithoutRef<
  typeof ClusterDetailWidgetProvider
>;

describe('ClusterDetailWidgetProvider', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailWidgetProvider, {} as ComponentProps);
  });

  it('displays loading animations if the cluster is still loading', () => {
    renderWithTheme(ClusterDetailWidgetProvider, {
      cluster: undefined,
    } as ComponentProps);

    expect(screen.getAllByLabelText('Loading...').length).toEqual(4);
  });

  it('displays the cluster region on Azure', () => {
    renderWithTheme(ClusterDetailWidgetProvider, {
      cluster: capiv1alpha3Mocks.randomCluster1,
      providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
    } as ComponentProps);

    expect(screen.getByText('Azure region')).toBeInTheDocument();
    expect(screen.getByText('westeurope')).toBeInTheDocument();
  });

  it('displays the subscription ID on Azure', () => {
    renderWithTheme(ClusterDetailWidgetProvider, {
      cluster: capiv1alpha3Mocks.randomCluster1,
      providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
    } as ComponentProps);

    expect(screen.getByText('Subscription ID')).toBeInTheDocument();
    expect(screen.getByText('test-subscription')).toBeInTheDocument();
  });
});
