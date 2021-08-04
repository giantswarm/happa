import { renderWithTheme } from 'testUtils/renderUtils';

import ClusterDetailDeleteAction from '../ClusterDetailDeleteAction';

type ComponentProps = React.ComponentPropsWithoutRef<
  typeof ClusterDetailDeleteAction
>;

describe('ClusterDetailDeleteAction', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailDeleteAction, {
      name: 'at3s7',
      description: 'A test cluster',
      creationDate: new Date().toISOString(),
      nodePoolsCount: 0,
      workerNodesCount: 0,
      onDelete: jest.fn(),
    } as ComponentProps);
  });
});
