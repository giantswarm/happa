// @ts-ignore
import { fireEvent, waitFor, within } from '@testing-library/react';
import { getConfiguration } from 'model/services/metadata';
import * as AllConstants from 'shared/constants';
import { mockAPIResponse } from 'testUtils/mockHttpCalls';
import { renderWithStore } from 'testUtils/renderUtils';

import Footer from '../Footer';

const setConstants = (value: Partial<typeof AllConstants.Constants>) => {
  // @ts-ignore
  // eslint-disable-next-line no-import-assign
  AllConstants.Constants = value;
};

// Mock timers
jest.mock('shared/constants');
const initialConstants = AllConstants.Constants;
const mockConstants = {
  // eslint-disable-next-line no-magic-numbers
  DEFAULT_METADATA_CHECK_PERIOD: 20 * 1000,
};
setConstants(mockConstants);

const mockGetConfiguration = (version: string) => {
  // Casting because the configuration file is mocked in modelMocks
  return (getConfiguration as jest.Mock).mockResolvedValueOnce(
    mockAPIResponse({ version })
  );
};

describe('Footer', () => {
  afterEach(() => {
    setConstants(mockConstants);
  });

  afterAll(() => {
    setConstants(initialConstants);
  });

  it('renders without crashing', () => {
    mockGetConfiguration('0.0.1');
    renderWithStore(Footer);
  });

  it('displays the version retrieved from metadata', async () => {
    mockGetConfiguration('0.0.1');
    const { findByText, getByText } = renderWithStore(Footer);

    const versionWrapper: HTMLElement = await findByText(/0.0.1/i);
    expect(versionWrapper).toBeInTheDocument();
    expect(getByText(/release notes/i)).toBeInTheDocument();

    // Check if the tooltip is there and if it has the right content
    fireEvent.mouseOver(versionWrapper);
    expect(getByText(/Using latest version./i)).toBeInTheDocument();
  });

  it('displays a warning if there is an update available', async () => {
    setConstants({
      // eslint-disable-next-line no-magic-numbers
      DEFAULT_METADATA_CHECK_PERIOD: 150,
    });

    mockGetConfiguration('0.0.1');
    mockGetConfiguration('0.0.2');
    const { findByText, findAllByText, getByText } = renderWithStore(Footer);

    await findByText(/0.0.1/i);
    await findAllByText(/update now!/i);
    // Check for the flash message
    expect(
      getByText(/There's a new version of happa available/i)
    ).toBeInTheDocument();

    const versionWrapper = getByText(/0.0.1/i);
    fireEvent.mouseOver(versionWrapper);
    expect(getByText(/Update available!/i)).toBeInTheDocument();
  });

  it(`only displays an update warning if there's a new version available`, async () => {
    setConstants({
      // eslint-disable-next-line no-magic-numbers
      DEFAULT_METADATA_CHECK_PERIOD: 150,
    });

    mockGetConfiguration('0.0.1');
    mockGetConfiguration('0.0.1');
    const { findByText, getByText } = renderWithStore(Footer);

    await findByText(/release notes/i);

    await waitFor(
      () => {
        expect(getByText(/release notes/i)).toBeInTheDocument();
      },
      { timeout: 100 }
    );
  });

  it('only displays a single warning if there were multiple updates', async () => {
    setConstants({
      // eslint-disable-next-line no-magic-numbers
      DEFAULT_METADATA_CHECK_PERIOD: 150,
    });

    mockGetConfiguration('0.0.1');
    mockGetConfiguration('0.0.2');
    mockGetConfiguration('0.0.3');
    const { findAllByText, getByText } = renderWithStore(Footer);

    await findAllByText(/update now!/i);
    expect(
      getByText(/There's a new version of happa available/i)
    ).toBeInTheDocument();

    // Wait for the next check to happen
    await waitFor(
      () => {
        expect(
          getByText(/There's a new version of happa available/i)
        ).toBeInTheDocument();
      },
      { timeout: 100 }
    );
  });

  it('toggles on update if clicking on the update button', async () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = ({
      reload: jest.fn(),
    } as unknown) as Location;

    setConstants({
      // eslint-disable-next-line no-magic-numbers
      DEFAULT_METADATA_CHECK_PERIOD: 50,
      // eslint-disable-next-line no-magic-numbers
      DEFAULT_METADATA_UPDATE_TIMEOUT: 5,
    });

    mockGetConfiguration('0.0.1');
    mockGetConfiguration('0.0.2');

    const { findAllByText } = renderWithStore(Footer);

    await waitFor(() => {}, { timeout: 50 });
    await findAllByText(/update now!/i);

    const updateButton = within(
      document.querySelector('footer') as HTMLElement
    ).getByText(/update now!/i);
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(window.location.reload).toBeCalled();
    });

    window.location = originalLocation;
  });
});
