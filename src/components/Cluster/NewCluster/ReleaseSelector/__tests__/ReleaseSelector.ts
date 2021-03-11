import { fireEvent, screen, within } from '@testing-library/react';
import ReleaseSelector from 'Cluster/NewCluster/ReleaseSelector/ReleaseSelector';
import { getComponentWithStore, renderWithStore } from 'testUtils/renderUtils';

const mockReleases: IReleases = {
  '1001.0.0-alpha': {
    version: '1001.0.0-alpha',
    timestamp: '2020-07-11T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.16.3' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
    active: true,
    kubernetesVersion: '1.16.3',
    releaseNotesURL: 'dummy',
  },
  '1000.0.0': {
    version: '1000.0.0',
    timestamp: '2020-06-11T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.16.3' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
    active: true,
    kubernetesVersion: '1.16.3',
    releaseNotesURL: 'dummy',
  },
  '999.0.0': {
    version: '999.0.0',
    timestamp: '2020-05-05T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.15.10' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
    active: false,
    kubernetesVersion: '1.15.10',
    releaseNotesURL: 'dummy',
  },
  '888.0.0': {
    version: '888.0.0',
    timestamp: '2020-01-05T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.15.2' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
    active: true,
    kubernetesVersion: '1.15.2',
    releaseNotesURL: 'dummy',
  },
};

const mockSortedReleaseVersions = Object.keys(mockReleases);

const defaultProps = {
  selectRelease: () => {},
  selectedRelease: mockSortedReleaseVersions[1],
};

const defaultStoreState = {
  entities: {
    releases: {
      isFetching: false,
      items: mockReleases,
      sortedVersions: mockSortedReleaseVersions,
    },
  },
};

describe('ReleaseSelector', () => {
  it('renders without crashing', () => {
    renderWithStore(
      ReleaseSelector,
      { ...defaultProps },
      { ...defaultStoreState }
    );
  });

  it('renders an empty state', () => {
    renderWithStore(
      ReleaseSelector,
      {
        ...defaultProps,
      },
      {
        ...defaultStoreState,
        ...{
          entities: {
            releases: { isFetching: false, items: {}, sortedVersions: [] },
          },
        },
      }
    );

    expect(
      screen.getByText(
        /There is no active release currently available for this platform./i
      )
    ).toBeInTheDocument();
  });

  it('renders the currently selected version & k8s version', () => {
    renderWithStore(
      ReleaseSelector,
      { ...defaultProps },
      { ...defaultStoreState }
    );

    expect(screen.getByText(mockSortedReleaseVersions[1])).toBeInTheDocument();
    expect(screen.getByText(/This release contains:/i)).toBeInTheDocument();
    expect(screen.getByText(/kubernetes/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        mockReleases[mockReleases[mockSortedReleaseVersions[1]].version]
          .kubernetesVersion as string
      )
    ).toBeInTheDocument();
  });

  const tableHeadings = [/Version/i, /Released/i, /Components/i, /Notes/i];

  it('renders initial state collapsed', () => {
    renderWithStore(
      ReleaseSelector,
      { ...defaultProps },
      { ...defaultStoreState }
    );

    expect(screen.getByText(/Available releases/i)).toBeInTheDocument();
    // Table headings
    for (const heading of tableHeadings) {
      expect(screen.queryByText(heading)).not.toBeInTheDocument();
    }
  });

  it('renders expanded once clicked', () => {
    const { container } = renderWithStore(
      ReleaseSelector,
      { ...defaultProps },
      { ...defaultStoreState }
    );

    const clickTarget = screen.getByText(/Available releases/i);
    expect(clickTarget).toBeInTheDocument();
    // Table headings
    for (const heading of tableHeadings) {
      expect(screen.queryByText(heading)).not.toBeInTheDocument();
    }

    fireEvent.click(clickTarget);

    for (const heading of tableHeadings) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }

    const table = container.querySelector('table');

    for (const release of mockSortedReleaseVersions) {
      expect(
        within(table as HTMLTableElement).getByText(release)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`show-components-${release}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`open-changelog-${release}`)
      ).toBeInTheDocument();
    }
  });

  it('renders expanded components once clicked', () => {
    renderWithStore(
      ReleaseSelector,
      { ...defaultProps },
      { ...defaultStoreState }
    );

    fireEvent.click(screen.getByText(/Available releases/i));

    expect(
      screen.queryByTestId(`components-${defaultProps.selectedRelease}`)
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId(`show-components-${defaultProps.selectedRelease}`)
    );
    expect(
      screen.getByTestId(`components-${defaultProps.selectedRelease}`)
    ).toBeInTheDocument();
  });

  it('allows to select a release', () => {
    const selectReleaseCallbackMock = jest.fn();

    const { rerender } = renderWithStore(
      ReleaseSelector,
      { ...defaultProps, selectRelease: selectReleaseCallbackMock },
      { ...defaultStoreState }
    );

    fireEvent.click(screen.getByText(/Available releases/i));

    const versionToSelect = mockSortedReleaseVersions[1];
    fireEvent.click(
      screen.getByTitle(new RegExp(`Select release ${versionToSelect}`, 'i'))
    );

    expect(selectReleaseCallbackMock).toBeCalledWith(versionToSelect);

    rerender(
      getComponentWithStore(
        ReleaseSelector,
        {
          ...defaultProps,
          selectRelease: selectReleaseCallbackMock,
          selectedRelease: versionToSelect,
        },
        { ...defaultStoreState }
      )
    );

    // Collapse
    fireEvent.click(screen.getByText(/Available releases/i));

    expect(screen.getByText(versionToSelect)).toBeInTheDocument();
    expect(screen.getByText(/This release contains:/i)).toBeInTheDocument();
    expect(screen.getByText(/kubernetes/i)).toBeInTheDocument();
    expect(
      screen.getByText(mockReleases[versionToSelect].components[0].version)
    ).toBeInTheDocument();
  });

  it('shows a notice to admin users indicating inactive versions', () => {
    renderWithStore(
      ReleaseSelector,
      { ...defaultProps },
      {
        ...defaultStoreState,
        ...{ main: { loggedInUser: { isAdmin: true } } },
      }
    );

    fireEvent.click(screen.getByText(/Available releases/i));

    expect(
      screen.getByText(
        /Light font color indicates an inactive or wip release only available to Giant Swarm staff/i
      )
    ).toBeInTheDocument();
  });

  it('has a caret icon if the selector is collapsible', () => {
    const { rerender } = renderWithStore(
      ReleaseSelector,
      { ...defaultProps, collapsible: true },
      { ...defaultStoreState }
    );
    expect(screen.getByLabelText(/toggle/i)).toBeInTheDocument();

    rerender(
      getComponentWithStore(
        ReleaseSelector,
        { ...defaultProps, collapsible: false },
        { ...defaultStoreState }
      )
    );
    expect(screen.queryByLabelText(/toggle/i)).not.toBeInTheDocument();
  });

  it('can filter releases based on a provided filter function', () => {
    const filterFn = jest.fn((currentRelease) => {
      return currentRelease === mockSortedReleaseVersions[1];
    });

    renderWithStore(
      ReleaseSelector,
      { ...defaultProps, versionFilter: filterFn, collapsible: false },
      { ...defaultStoreState }
    );

    expect(filterFn).toBeCalled();

    // Skip the first 2 versions.
    for (let i = 2; i < mockSortedReleaseVersions.length; i++) {
      expect(
        screen.queryByText(mockSortedReleaseVersions[i])
      ).not.toBeInTheDocument();
    }
  });

  it('automatically selects the newest active version when automatic selection is enabled', () => {
    const mockSelectReleaseFn = jest.fn();

    renderWithStore(
      ReleaseSelector,
      {
        ...defaultProps,
        collapsible: false,
        autoSelectLatest: true,
        selectedRelease: '',
        selectRelease: mockSelectReleaseFn,
      },
      { ...defaultStoreState }
    );

    expect(mockSelectReleaseFn).toHaveBeenCalledWith(
      mockSortedReleaseVersions[1]
    );
  });
});
