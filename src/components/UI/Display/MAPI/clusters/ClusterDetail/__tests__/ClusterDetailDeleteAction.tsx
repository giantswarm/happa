import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import sub from 'date-fns/fp/sub';
import { withMarkup } from 'test/assertUtils';
import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailDeleteAction, {
  ClusterDetailDeleteActionNameVariant,
} from '../ClusterDetailDeleteAction';

describe('ClusterDetailDeleteAction', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: new Date().toISOString(),
      nodePoolsCount: 0,
      workerNodesCount: 0,
      onDelete: jest.fn(),
    });
  });

  it('displays the delete button and disclaimer', () => {
    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: new Date().toISOString(),
      nodePoolsCount: 0,
      workerNodesCount: 0,
      onDelete: jest.fn(),
      unauthorized: false,
    });

    expect(screen.getByRole('button', { name: /Delete/ })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please make sure you really want to delete this cluster before you proceed, as there is no way to undo this. Data stored on the worker nodes will be lost. Workloads will be terminated.'
      )
    ).toBeInTheDocument();
  });

  it('displays various information about the cluster when trying to delete it', async () => {
    const creationDate = sub({
      hours: 1,
    })(new Date()).toISOString();

    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: creationDate,
      nodePoolsCount: 2,
      workerNodesCount: 3,
      userInstalledAppsCount: 5,
      onDelete: jest.fn(),
      unauthorized: false,
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));

    expect(
      await screen.findByText('Is this the cluster you want to delete?')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name: at3s7')).toBeInTheDocument();
    expect(screen.getByText('Description: A test cluster')).toBeInTheDocument();
    expect(screen.getByText(/Created/)).toBeInTheDocument();
    expect(screen.getByText(/about 1 hour ago/)).toBeInTheDocument();
    expect(
      screen.getByText('Has 3 worker nodes in 2 node pools, 5 apps installed.')
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Confirm/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
  });

  it('allows the number of user installed apps to not be specified', async () => {
    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: new Date().toISOString(),
      nodePoolsCount: 1,
      workerNodesCount: 1,
      onDelete: jest.fn(),
      unauthorized: false,
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));

    expect(
      await withMarkup(screen.findByText)(
        'Has 1 worker node in 1 node pool, n/a apps installed.'
      )
    ).toBeInTheDocument();
  });

  it('only allows deletion if the cluster name is confirmed', async () => {
    const onDeleteMockFn = jest.fn();

    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: new Date().toISOString(),
      nodePoolsCount: 1,
      workerNodesCount: 1,
      onDelete: onDeleteMockFn,
      unauthorized: false,
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Confirm/ }));

    expect(
      screen.getByText('Are you sure you want to delete this cluster forever?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('If yes, please enter the cluster name:')
    ).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /Delete/ });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Cluster name');
    expect(nameInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'at3s' } });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(nameInput, { target: { value: 'at3s7' } });
    await waitFor(() => expect(deleteButton).not.toBeDisabled());

    fireEvent.click(deleteButton);

    expect(onDeleteMockFn).toHaveBeenCalled();

    await waitForElementToBeRemoved(() =>
      screen.getByText('Are you sure you want to delete this cluster forever?')
    );
  });

  it('can be closed by pressing the cancel button', async () => {
    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: new Date().toISOString(),
      nodePoolsCount: 1,
      workerNodesCount: 1,
      onDelete: jest.fn(),
      unauthorized: false,
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Cancel/ }));

    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /Cancel/ })
    );
  });

  it('can be configured to display different identification labels', async () => {
    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: new Date().toISOString(),
      nodePoolsCount: 1,
      workerNodesCount: 1,
      variant: ClusterDetailDeleteActionNameVariant.ID,
      onDelete: jest.fn(),
      unauthorized: false,
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));

    expect(await screen.findByLabelText('ID: at3s7')).toBeInTheDocument();
    expect(screen.getByText('Name: A test cluster')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));

    expect(
      await screen.findByText('If yes, please enter the cluster ID:')
    ).toBeInTheDocument();
  });

  it('displays a warning message and the delete button as disabled if the user does not have permissions to delete clusters', () => {
    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: new Date().toISOString(),
      nodePoolsCount: 0,
      workerNodesCount: 0,
      onDelete: jest.fn(),
      unauthorized: true,
    });

    expect(screen.getByRole('button', { name: /Delete/ })).toBeDisabled();

    expect(
      screen.getByText(
        'For deleting this cluster, you need additional permissions. Please talk to your administrator.'
      )
    ).toBeInTheDocument();
  });
});
