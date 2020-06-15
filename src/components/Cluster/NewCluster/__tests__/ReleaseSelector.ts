import { fireEvent, screen, within } from '@testing-library/react';
import ReleaseSelector from 'Cluster/NewCluster/ReleaseSelector/ReleaseSelector';
import {
  getComponentWithStore,
  renderWithStore,
  renderWithTheme,
} from 'testUtils/renderUtils';

const mockSelectableReleases = [
  {
    version: '1000.0.0',
    timestamp: '2020-06-11T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.16.3' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
  },
  {
    version: '999.0.0',
    timestamp: '2020-05-05T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.15.10' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
  },
];

const defaultProps = {
  releases: {
    [mockSelectableReleases[0].version]: mockSelectableReleases[0],
    [mockSelectableReleases[1].version]: mockSelectableReleases[1],
  },
  selectRelease: () => {},
  selectableReleases: mockSelectableReleases,
  selectedRelease: mockSelectableReleases[0].version,
};

describe('ReleaseSelector', () => {
  it('renders without crashing', () => {
    renderWithTheme(ReleaseSelector, { ...defaultProps });
  });

  it('renders an empty state', () => {
    renderWithTheme(ReleaseSelector, {
      ...defaultProps,
      releases: {},
      selectedRelease: '',
    });

    expect(
      screen.getByText(
        /There is no active release currently available for this platform./i
      )
    ).toBeInTheDocument();
  });

  it('renders the currently selected version & k8s version', () => {
    renderWithTheme(ReleaseSelector, { ...defaultProps });

    expect(screen.getByText(defaultProps.selectedRelease)).toBeInTheDocument();
    expect(screen.getByText(/This release contains:/i)).toBeInTheDocument();
    expect(screen.getByText(/kubernetes/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        defaultProps.releases[defaultProps.selectedRelease].components[0]
          .version
      )
    ).toBeInTheDocument();
  });

  const tableHeadings = [/Version/i, /Released/i, /Components/i, /Notes/i];

  it('renders initial state collapsed', () => {
    renderWithTheme(ReleaseSelector, { ...defaultProps });

    expect(screen.getByText(/Available releases/i)).toBeInTheDocument();
    // Table headings
    for (const heading of tableHeadings) {
      expect(screen.queryByText(heading)).not.toBeInTheDocument();
    }
  });

  it('renders expanded once clicked', () => {
    const { container } = renderWithStore(
      ReleaseSelector,
      // @ts-ignore
      { ...defaultProps },
      { main: { info: { general: { provider: 'aws' } } } }
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

    for (const release of mockSelectableReleases) {
      expect(
        within(table as HTMLTableElement).getByText(release.version)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`show-components-${release.version}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`open-changelog-${release.version}`)
      ).toBeInTheDocument();
    }
  });

  it('renders expanded components once clicked', () => {
    renderWithStore(
      ReleaseSelector,
      // @ts-ignore
      { ...defaultProps },
      { main: { info: { general: { provider: 'aws' } } } }
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
      // @ts-ignore
      { ...defaultProps, selectRelease: selectReleaseCallbackMock },
      { main: { info: { general: { provider: 'aws' } } } }
    );

    fireEvent.click(screen.getByText(/Available releases/i));

    const versionToSelect = defaultProps.selectableReleases[1].version;
    fireEvent.click(
      screen.getByTitle(new RegExp(`Select release ${versionToSelect}`, 'i'))
    );

    expect(selectReleaseCallbackMock).toBeCalledWith(versionToSelect);

    rerender(
      getComponentWithStore(ReleaseSelector, {
        ...defaultProps,
        selectRelease: selectReleaseCallbackMock,
        selectedRelease: versionToSelect,
      })
    );

    // Collapse
    fireEvent.click(screen.getByText(/Available releases/i));

    expect(screen.getByText(versionToSelect)).toBeInTheDocument();
    expect(screen.getByText(/This release contains:/i)).toBeInTheDocument();
    expect(screen.getByText(/kubernetes/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        defaultProps.releases[versionToSelect].components[0].version
      )
    ).toBeInTheDocument();
  });
});
