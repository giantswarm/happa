import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { getComponentWithTheme, renderWithTheme } from 'testUtils/renderUtils';

import AccessControlRoleList from '../AccessControlRoleList';
import { IAccessControlRoleSubjectItem } from '../types';

function makeSubjects(
  count: number,
  prefix: string = 'subject'
): Record<string, IAccessControlRoleSubjectItem> {
  const subjects: Record<string, IAccessControlRoleSubjectItem> = {};

  for (let i = 0; i < count; i++) {
    const name = `${prefix}-${i}`;
    subjects[name] = {
      name,
      isEditable: true,
      roleBindings: [],
    };
  }

  return subjects;
}

describe('AccessControlRoleList', () => {
  it('renders without crashing', () => {
    renderWithTheme(AccessControlRoleList, {
      activeRoleName: '',
      setActiveRoleName: jest.fn(),
      roles: [],
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleList>);
  });

  it('renders various roles correctly', () => {
    renderWithTheme(AccessControlRoleList, {
      activeRoleName: '',
      setActiveRoleName: jest.fn(),
      roles: [
        {
          name: 'some-role',
          managedBy: '',
          namespace: '',
          groups: {},
          users: {},
          serviceAccounts: {},
          permissions: [],
        },
        {
          name: 'some-other-role',
          managedBy: '',
          namespace: 'test-namespace',
          groups: {
            'group-1': {
              name: 'group-1',
              isEditable: true,
              roleBindings: [],
            },
          },
          users: {
            'user-1': {
              name: 'user-1',
              isEditable: true,
              roleBindings: [],
            },
          },
          serviceAccounts: {},
          permissions: [
            {
              apiGroups: ['*'],
              resources: ['*'],
              resourceNames: [],
              verbs: ['*'],
            },
          ],
        },
        {
          name: 'some-cool-role',
          managedBy: '',
          namespace: 'test-namespace',
          groups: {},
          // eslint-disable-next-line no-magic-numbers
          users: makeSubjects(150),
          serviceAccounts: {},
          permissions: [
            {
              apiGroups: ['*'],
              resources: ['*'],
              resourceNames: [],
              verbs: ['*'],
            },
          ],
        },
      ],
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleList>);

    let role = screen
      .getByText('some-role')
      .closest('[role=button]') as HTMLElement;
    expect(within(role).getByLabelText('Cluster role')).toBeInTheDocument();
    expect(within(role).getByText('Groups: None')).toBeInTheDocument();
    expect(within(role).getByText('Users: None')).toBeInTheDocument();

    role = screen
      .getByText('some-other-role')
      .closest('[role=button]') as HTMLElement;
    expect(
      within(role).queryByLabelText('Cluster role')
    ).not.toBeInTheDocument();
    expect(within(role).getByText('Groups: 1')).toBeInTheDocument();
    expect(within(role).getByText('Users: 1')).toBeInTheDocument();

    role = screen
      .getByText('some-cool-role')
      .closest('[role=button]') as HTMLElement;
    expect(
      within(role).queryByLabelText('Cluster role')
    ).not.toBeInTheDocument();
    expect(within(role).getByText('Groups: None')).toBeInTheDocument();
    expect(within(role).getByText('Users: 99+')).toBeInTheDocument();
  });

  it('renders a loading placeholder if the data is not present', () => {
    const { rerender } = renderWithTheme(AccessControlRoleList, {
      activeRoleName: '',
      setActiveRoleName: jest.fn(),
      roles: undefined,
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleList>);
    expect(screen.getAllByTitle('Loading...').length).toBeGreaterThan(0);

    rerender(
      getComponentWithTheme(AccessControlRoleList, {
        activeRoleName: '',
        setActiveRoleName: jest.fn(),
        roles: [],
      })
    );

    expect(screen.queryByTitle('Loading...')).not.toBeInTheDocument();
  });

  it('renders a placeholder if the data is present, but empty', () => {
    renderWithTheme(AccessControlRoleList, {
      activeRoleName: '',
      setActiveRoleName: jest.fn(),
      roles: [],
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleList>);

    expect(screen.getByText('No roles available')).toBeInTheDocument();
  });

  it('can select a specific active role', () => {
    const setActiveRoleNameMockFn = jest.fn();
    renderWithTheme(AccessControlRoleList, {
      activeRoleName: '',
      setActiveRoleName: setActiveRoleNameMockFn,
      roles: [
        {
          name: 'some-role',
          managedBy: '',
          namespace: '',
          groups: {},
          users: {},
          serviceAccounts: {},
          permissions: [],
        },
        {
          name: 'some-other-role',
          managedBy: '',
          namespace: 'test-namespace',
          groups: {
            'group-1': {
              name: 'group-1',
              isEditable: true,
              roleBindings: [],
            },
          },
          users: {
            'user-1': {
              name: 'user-1',
              isEditable: true,
              roleBindings: [],
            },
          },
          serviceAccounts: {},
          permissions: [
            {
              apiGroups: ['some-group.domain.com'],
              resources: ['*'],
              resourceNames: [],
              verbs: ['*'],
            },
          ],
        },
      ],
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleList>);

    fireEvent.click(screen.getByText('some-role').closest('[role=button]')!);

    expect(setActiveRoleNameMockFn).toHaveBeenCalledWith('some-role');
  });

  it('can search for a specific role', async () => {
    renderWithTheme(AccessControlRoleList, {
      activeRoleName: '',
      setActiveRoleName: jest.fn(),
      roles: [
        {
          name: 'some-role',
          managedBy: '',
          namespace: '',
          groups: {},
          users: {},
          serviceAccounts: {},
          permissions: [],
        },
        {
          name: 'some-other-role',
          managedBy: '',
          namespace: 'test-namespace',
          groups: {
            'group-1': {
              name: 'group-1',
              isEditable: true,
              roleBindings: [],
            },
          },
          users: {
            'user-1': {
              name: 'user-1',
              isEditable: true,
              roleBindings: [],
            },
          },
          serviceAccounts: {},
          permissions: [
            {
              apiGroups: ['*'],
              resources: ['*'],
              resourceNames: [],
              verbs: ['*'],
            },
          ],
        },
      ],
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleList>);

    const searchInput = screen.getByPlaceholderText('Find role');
    fireEvent.change(searchInput, { target: { value: 'some-role' } });

    expect(screen.getByText('some-role')).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.getByText('some-other-role'));
  });

  it('displays a placeholder if searching for something returned no values', async () => {
    renderWithTheme(AccessControlRoleList, {
      activeRoleName: '',
      setActiveRoleName: jest.fn(),
      roles: [
        {
          name: 'some-role',
          managedBy: '',
          namespace: '',
          groups: {},
          users: {},
          serviceAccounts: {},
          permissions: [],
        },
        {
          name: 'some-other-role',
          managedBy: '',
          namespace: 'test-namespace',
          groups: {
            'group-1': {
              name: 'group-1',
              isEditable: true,
              roleBindings: [],
            },
          },
          users: {
            'user-1': {
              name: 'user-1',
              isEditable: true,
              roleBindings: [],
            },
          },
          serviceAccounts: {},
          permissions: [
            {
              apiGroups: ['*'],
              resources: ['*'],
              resourceNames: [],
              verbs: ['*'],
            },
          ],
        },
      ],
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleList>);

    const searchInput = screen.getByPlaceholderText('Find role');
    fireEvent.change(searchInput, { target: { value: 'randomjajaja' } });

    await waitForElementToBeRemoved(() => screen.getByText('some-role'));
    expect(screen.queryByText('some-other-role')).not.toBeInTheDocument();

    expect(
      screen.getByText('No roles found for your search')
    ).toBeInTheDocument();
  });

  it('displays a provided error', () => {
    renderWithTheme(AccessControlRoleList, {
      activeRoleName: '',
      setActiveRoleName: jest.fn(),
      roles: undefined,
      errorMessage: 'Oh no! There was an error.',
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleList>);

    expect(
      screen.getByText('Error loading roles: Oh no! There was an error.')
    ).toBeInTheDocument();
  });
});
