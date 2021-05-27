import { screen } from '@testing-library/react';
import { getComponentWithStore, renderWithStore } from 'testUtils/renderUtils';

import AccessControlRoleDetail from '../AccessControlRoleDetail';
import { AccessControlSubjectTypes, IAccessControlPermissions } from '../types';

const defaultPermissions: IAccessControlPermissions = {
  subjects: {
    [AccessControlSubjectTypes.Group]: {
      canAdd: true,
      canDelete: true,
      canList: true,
    },
    [AccessControlSubjectTypes.User]: {
      canAdd: true,
      canDelete: true,
      canList: true,
    },
    [AccessControlSubjectTypes.ServiceAccount]: {
      canAdd: true,
      canDelete: true,
      canList: true,
    },
  },
};

describe('AccessControlRoleDetail', () => {
  it('renders without crashing', () => {
    renderWithStore(AccessControlRoleDetail, {
      namespace: 'org-test',
      permissions: defaultPermissions,
      activeRole: {
        name: '',
        namespace: '',
        managedBy: '',
        groups: {},
        users: {},
        serviceAccounts: {},
        permissions: [],
      },
      onAdd: jest.fn(),
      onDelete: jest.fn(),
    });
  });

  it('renders role details correctly', () => {
    const initialProps = {
      namespace: 'org-test',
      permissions: defaultPermissions,
      activeRole: {
        name: 'test-role',
        namespace: '',
        managedBy: 'party-operator',
        groups: {},
        users: {},
        serviceAccounts: {},
        permissions: [],
      },
      onAdd: jest.fn(),
      onDelete: jest.fn(),
    };
    const { rerender } = renderWithStore(AccessControlRoleDetail, initialProps);

    expect(screen.getByText('test-role')).toBeInTheDocument();
    expect(screen.getByText('Cluster role')).toBeInTheDocument();
    expect(screen.getByLabelText('Cluster role')).toBeInTheDocument();
    expect(
      screen.getByText('Managed by Giant Swarm (party-operator)')
    ).toBeInTheDocument();

    rerender(
      getComponentWithStore(AccessControlRoleDetail, {
        ...initialProps,
        activeRole: {
          ...initialProps.activeRole,
          namespace: 'test',
        },
      })
    );

    expect(screen.getByText('Namespaced role')).toBeInTheDocument();
    expect(screen.queryByLabelText('Cluster role')).not.toBeInTheDocument();

    rerender(
      getComponentWithStore(AccessControlRoleDetail, {
        ...initialProps,
        activeRole: {
          ...initialProps.activeRole,
          managedBy: '',
        },
      })
    );
    expect(screen.getByText('Managed by you')).toBeInTheDocument();
  });

  it('renders a loader if there is no data yet', () => {
    const { rerender } = renderWithStore(AccessControlRoleDetail, {
      namespace: 'org-test',
      permissions: defaultPermissions,
      activeRole: undefined,
      onAdd: jest.fn(),
      onDelete: jest.fn(),
    });

    expect(screen.getByTitle('Loading...')).toBeInTheDocument();

    rerender(
      getComponentWithStore(AccessControlRoleDetail, {
        namespace: 'org-test',
        permissions: defaultPermissions,
        activeRole: {
          name: 'test-role',
          namespace: '',
          managedBy: 'party-operator',
          groups: {},
          users: {},
          serviceAccounts: {},
          permissions: [],
        },
        onAdd: jest.fn(),
        onDelete: jest.fn(),
      })
    );

    expect(screen.queryByTitle('Loading...')).not.toBeInTheDocument();
  });
});
