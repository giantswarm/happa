import { fireEvent, within } from '@testing-library/react';
import * as AllConstants from 'model/constants';
import { getConfiguration } from 'model/services/metadata/configuration';
import { act } from 'react-dom/test-utils';
import { mockAPIResponse } from 'test/mockHttpCalls';
import { renderWithStore } from 'test/renderUtils';

import Footer from '../Footer';

// Mock timers
jest.mock('model/constants');
const initialConstants = AllConstants.Constants;
const setConstants = (value: Partial<typeof AllConstants.Constants>) => {
  // @ts-ignore
  // eslint-disable-next-line no-import-assign
  AllConstants.Constants = Object.assign({}, initialConstants, value);
};

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
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    setConstants(initialConstants);
    jest.useRealTimers();
  });

  afterEach(() => {
    setConstants(mockConstants);
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

  it('displays the version correctly if it is a pre-release', async () => {
    mockGetConfiguration('0.0.1-asd123djas123asdasdu98cnas9d81723asd98asy9812');
    const { findByText } = renderWithStore(Footer);

    const versionWrapper: HTMLElement = await findByText(/0.0.1-asd12/i);
    expect(versionWrapper).toBeInTheDocument();

    // Expect to be redirected to the github release page
    const releaseNotesButton: HTMLElement = await findByText(/release notes/i);
    fireEvent.click(releaseNotesButton);
  });

  it('displays a warning if there is an update available', async () => {
    setConstants({
      // eslint-disable-next-line no-magic-numbers
      DEFAULT_METADATA_CHECK_PERIOD: 150,
    });

    mockGetConfiguration('0.0.1');
    mockGetConfiguration('0.0.2');
    const { findByText, findAllByText, getByText } = renderWithStore(Footer);

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    await findByText(/0.0.1/i);
    await findAllByText(/update the web interface now/i);
    // Check for the flash message
    expect(
      getByText(/There's a new version of the web interface available/i)
    ).toBeInTheDocument();

    const versionWrapper = getByText(/0.0.1/i);
    fireEvent.mouseOver(versionWrapper);
    expect(getByText(/update available!/i)).toBeInTheDocument();
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

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    expect(getByText(/release notes/i)).toBeInTheDocument();
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

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    await findAllByText(/update the web interface now/i);
    expect(
      getByText(/There's a new version of the web interface available/i)
    ).toBeInTheDocument();

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    expect(
      getByText(/There's a new version of the web interface available/i)
    ).toBeInTheDocument();
  });

  it('toggles on update if clicking on the update button', async () => {
    const originalLocation = window.location;
    // @ts-expect-error
    delete window.location;
    window.location = {
      reload: jest.fn(),
    } as unknown as Location;

    setConstants({
      // eslint-disable-next-line no-magic-numbers
      DEFAULT_METADATA_CHECK_PERIOD: 50,
      // eslint-disable-next-line no-magic-numbers
      DEFAULT_METADATA_UPDATE_TIMEOUT: 5,
    });

    mockGetConfiguration('0.0.1');
    mockGetConfiguration('0.0.2');

    const { findAllByText, getByText } = renderWithStore(Footer);

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    await findAllByText(/update the web interface now/i);

    const updateButton = within(
      document.querySelector('footer') as HTMLElement
    ).getByText(/update the web interface now/i);
    fireEvent.click(updateButton);

    expect(getByText(/updating.../i)).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(window.location.reload).toBeCalled();

    window.location = originalLocation;
  });
});
