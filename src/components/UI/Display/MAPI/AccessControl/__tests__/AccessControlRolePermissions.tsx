import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { renderWithTheme } from 'testUtils/renderUtils';

import AccessControlRolePermissions from '../AccessControlRolePermissions';
import { IAccessControlRoleItemPermission } from '../types';

describe('AccessControlRolePermissions', () => {
  it('renders without crashing', () => {
    renderWithTheme(AccessControlRolePermissions, {
      permissions: [],
    } as React.ComponentPropsWithoutRef<typeof AccessControlRolePermissions>);
  });

  it('renders various permission combinations correctly', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    const testCases: {
      permission: IAccessControlRoleItemPermission;
      cellContents: {
        content?: string;
        tooltipContent?: string;
        labelContent?: string;
      }[];
    }[] = [
      {
        permission: {
          apiGroups: ['apps.domain.io'],
          resources: ['test1', 'test2', 'test3'],
          resourceNames: [],
          verbs: ['get', 'list'],
        },
        cellContents: [
          { content: 'apps.domain.io' },
          {
            content: 'test1, tes...test3',
            tooltipContent: 'test1, test2, test3',
          },
          { content: 'All' },
          {
            tooltipContent: 'get, list',
            labelContent: 'Supported verbs: get, list',
          },
        ],
      },
      {
        permission: {
          apiGroups: [''],
          resources: ['nodes'],
          resourceNames: [],
          verbs: ['get', 'list'],
        },
        cellContents: [
          {},
          {
            content: 'nodes',
          },
          { content: 'All' },
          {
            tooltipContent: 'get, list',
            labelContent: 'Supported verbs: get, list',
          },
        ],
      },
      {
        permission: {
          apiGroups: [],
          resources: ['pods'],
          resourceNames: [],
          verbs: ['*'],
        },
        cellContents: [
          {},
          {
            content: 'pods',
          },
          { content: 'All' },
          { tooltipContent: 'All', labelContent: 'Supported verbs: All' },
        ],
      },
      {
        permission: {
          apiGroups: ['*'],
          resources: ['pods'],
          resourceNames: ['pod-1', 'pod-2'],
          verbs: ['get'],
        },
        cellContents: [
          {
            content: 'All',
          },
          {
            content: 'pods',
          },
          { content: 'pod-1, pod-2' },
          { tooltipContent: 'get', labelContent: 'Supported verbs: get' },
        ],
      },
      {
        permission: {
          apiGroups: ['test.domain.com'],
          resources: ['apps'],
          resourceNames: ['app-1', 'app-2'],
          verbs: ['get'],
        },
        cellContents: [
          {
            content: 'test.domain.com',
          },
          {
            content: 'apps',
          },
          { content: 'app-1, app-2' },
          { tooltipContent: 'get', labelContent: 'Supported verbs: get' },
        ],
      },
      {
        permission: {
          apiGroups: ['test2.domain.com', 'test3.domain.com'],
          resources: ['dogs'],
          resourceNames: [],
          verbs: ['banana'],
        },
        cellContents: [
          {
            content: 'test2.doma...n.com',
            tooltipContent: 'test2.domain.com, test3.domain.com',
          },
          {
            content: 'dogs',
          },
          { content: 'All' },
          { tooltipContent: 'banana', labelContent: 'Supported verbs: banana' },
        ],
      },
      {
        permission: {
          apiGroups: ['test4.domain.com', 'test5.domain.com'],
          resources: ['dogs'],
          resourceNames: [],
          verbs: [
            'get',
            'watch',
            'list',
            'create',
            'update',
            'patch',
            'delete',
          ],
        },
        cellContents: [
          {
            content: 'test4.doma...n.com',
            tooltipContent: 'test4.domain.com, test5.domain.com',
          },
          {
            content: 'dogs',
          },
          { content: 'All' },
          {
            tooltipContent: 'get, watch, list, create, update, patch, delete',
            labelContent:
              'Supported verbs: get, watch, list, create, update, patch, delete',
          },
        ],
      },
      {
        permission: {
          apiGroups: ['test6.domain.com'],
          resources: ['dogs'],
          resourceNames: [],
          verbs: [
            'get',
            'watch',
            'list',
            'create',
            'update',
            'patch',
            'delete',
            'banana',
          ],
        },
        cellContents: [
          {
            content: 'test6.domain.com',
          },
          {
            content: 'dogs',
          },
          { content: 'All' },
          {
            tooltipContent:
              'get, watch, list, create, update, patch, delete, banana',
            labelContent:
              'Supported verbs: get, watch, list, create, update, patch, delete, banana',
          },
        ],
      },
      {
        permission: {
          apiGroups: ['test7.domain.com'],
          resources: ['*'],
          resourceNames: [],
          verbs: ['*'],
        },
        cellContents: [
          {
            content: 'test7.domain.com',
          },
          {
            content: 'All',
          },
          { content: 'All' },
          {
            tooltipContent: 'All',
            labelContent: 'Supported verbs: All',
          },
        ],
      },
    ];

    renderWithTheme(AccessControlRolePermissions, {
      permissions: testCases.map((tc) => tc.permission),
    } as React.ComponentPropsWithoutRef<typeof AccessControlRolePermissions>);

    const rows = within(screen.getByRole('table')).getAllByRole('row');

    // Table header.
    let testCase = null;
    let row = rows[0];
    let cells = within(row).getAllByRole('cell');

    let cellContent = within(cells[0]).getByText('API Groups');
    expect(cellContent).toBeInTheDocument();

    cellContent = within(cells[1]).getByText('Resources');
    expect(cellContent).toBeInTheDocument();

    cellContent = within(cells[2]).getByText('Resource Names');
    expect(cellContent).toBeInTheDocument();

    cellContent = within(cells[3]).getByText('Verbs');
    expect(cellContent).toBeInTheDocument();

    // Table rows.
    for (let i = 0; i < testCases.length; i++) {
      testCase = testCases[i];
      row = rows[i + 1];
      cells = within(row).getAllByRole('cell');

      for (let j = 0; j < cells.length; j++) {
        const { content, labelContent, tooltipContent } = testCase.cellContents[
          j
        ];
        if (content) {
          cellContent = within(cells[j]).getByText(content);
          expect(cellContent).toBeInTheDocument();
        } else if (labelContent) {
          cellContent = within(cells[j]).getByLabelText(labelContent);
          expect(cellContent).toBeInTheDocument();
        }

        if (tooltipContent) {
          fireEvent.mouseEnter(cellContent);
          expect(
            screen.getByRole('tooltip', { name: tooltipContent })
          ).toBeInTheDocument();
          fireEvent.mouseLeave(cellContent);
          await waitForElementToBeRemoved(() =>
            screen.queryByRole('tooltip', { name: tooltipContent })
          );
        }
      }
    }
  });
});
