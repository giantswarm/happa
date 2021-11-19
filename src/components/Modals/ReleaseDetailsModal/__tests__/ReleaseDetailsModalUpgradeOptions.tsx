import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from 'test/renderUtils';

import ReleaseDetailsModalUpgradeOptions from '../ReleaseDetailsModalUpgradeOptions';

describe('ReleaseDetailsModalUpgradeOptions', () => {
  const availableReleases: IReleases = {
    '8.0.0': createRelease('8.0.0', true),
    '8.0.1': createRelease('8.0.1', false),
    '9.0.0': createRelease('9.0.0', false),
    '9.0.1': createRelease('9.0.1', false),
    '9.0.2': createRelease('9.0.2', false),
    '9.0.3': createRelease('9.0.3', true),
    '9.1.0': createRelease('9.1.0', true),
    '9.1.3-alpha.1': createRelease('9.1.3-alpha.1', true),
    '9.1.5': createRelease('9.1.5', true),
    '9.2.3': createRelease('9.2.3', true),
    '9.2.4-beta3': createRelease('9.2.4-beta3', true),
    '9.2.4-beta4': createRelease('9.2.4-beta4', true),
    '9.3.0': createRelease('9.3.0', true),
    '10.0.0': createRelease('10.0.0', false),
    '10.0.23': createRelease('10.0.23', true),
    '10.1.0': createRelease('10.1.0', true),
  };

  it('renders without crashing', () => {
    renderWithTheme(ReleaseDetailsModalUpgradeOptions, {
      isAdmin: false,
      releases: {},
      provider: 'aws',
      currentVersion: '12.0.0',
      showUpgradeModal: jest.fn(),
      setUpgradeVersion: jest.fn(),
      closeModal: jest.fn(),
    });
  });

  it('renders the correct markup for being able to upgrade to a single production-ready release', () => {
    const showUpgradeModalMockFn = jest.fn();
    const setUpgradeVersionMockFn = jest.fn();
    const closeModalMockFn = jest.fn();

    renderWithTheme(ReleaseDetailsModalUpgradeOptions, {
      isAdmin: false,
      releases: availableReleases,
      provider: 'aws',
      currentVersion: '10.0.23',
      showUpgradeModal: showUpgradeModalMockFn,
      setUpgradeVersion: setUpgradeVersionMockFn,
      closeModal: closeModalMockFn,
    });

    expect(
      screen.getByText(/This cluster can be upgraded to/)
    ).toBeInTheDocument();
    const releaseButton = screen.getByRole('button', { name: 'v10.1.0' });
    expect(releaseButton).toBeInTheDocument();

    fireEvent.click(releaseButton);
    expect(showUpgradeModalMockFn).toHaveBeenCalled();
    expect(setUpgradeVersionMockFn).toHaveBeenCalledWith('10.1.0');
    expect(closeModalMockFn).toHaveBeenCalled();

    expect(
      screen.queryByText(
        'Beta releases are not recommended for production use. Upgrading to newer beta and non-beta releases is possible.'
      )
    ).not.toBeInTheDocument();
  });

  it('renders the correct markup for being able to upgrade to a single beta release', () => {
    const showUpgradeModalMockFn = jest.fn();
    const setUpgradeVersionMockFn = jest.fn();
    const closeModalMockFn = jest.fn();

    renderWithTheme(ReleaseDetailsModalUpgradeOptions, {
      isAdmin: false,
      releases: availableReleases,
      provider: 'aws',
      currentVersion: '9.2.4-beta3',
      showUpgradeModal: showUpgradeModalMockFn,
      setUpgradeVersion: setUpgradeVersionMockFn,
      closeModal: closeModalMockFn,
    });

    expect(
      screen.getByText(/This cluster can be upgraded to/)
    ).toBeInTheDocument();
    const releaseButton = screen.getByRole('button', {
      name: 'v9.2.4-beta4 (BETA)',
    });
    expect(releaseButton).toBeInTheDocument();

    fireEvent.click(releaseButton);
    expect(showUpgradeModalMockFn).toHaveBeenCalled();
    expect(setUpgradeVersionMockFn).toHaveBeenCalledWith('9.2.4-beta4');
    expect(closeModalMockFn).toHaveBeenCalled();

    expect(
      screen.getByText(
        'Beta releases are not recommended for production use. Upgrading to newer beta and non-beta releases is possible.'
      )
    ).toBeInTheDocument();
  });

  it('renders the correct markup for being able to upgrade to a multiple production releases', () => {
    const showUpgradeModalMockFn = jest.fn();
    const setUpgradeVersionMockFn = jest.fn();
    const closeModalMockFn = jest.fn();

    renderWithTheme(ReleaseDetailsModalUpgradeOptions, {
      isAdmin: false,
      releases: availableReleases,
      provider: 'azure',
      currentVersion: '9.3.0',
      showUpgradeModal: showUpgradeModalMockFn,
      setUpgradeVersion: setUpgradeVersionMockFn,
      closeModal: closeModalMockFn,
    });

    expect(
      screen.getByText(/This cluster can be upgraded to these releases\:/)
    ).toBeInTheDocument();

    const versions = ['10.0.23', '10.1.0'];
    for (const version of versions) {
      const releaseButton = screen.getByRole('button', { name: `v${version}` });
      expect(releaseButton).toBeInTheDocument();

      fireEvent.click(releaseButton);
      expect(showUpgradeModalMockFn).toHaveBeenCalled();
      expect(setUpgradeVersionMockFn).toHaveBeenCalledWith(version);
      expect(closeModalMockFn).toHaveBeenCalled();
    }

    expect(
      screen.queryByText(
        'Beta releases are not recommended for production use. Upgrading to newer beta and non-beta releases is possible.'
      )
    ).not.toBeInTheDocument();
  });

  it('renders the correct markup for being able to upgrade to a multiple beta releases', () => {
    const showUpgradeModalMockFn = jest.fn();
    const setUpgradeVersionMockFn = jest.fn();
    const closeModalMockFn = jest.fn();

    renderWithTheme(ReleaseDetailsModalUpgradeOptions, {
      isAdmin: false,
      releases: availableReleases,
      provider: 'aws',
      currentVersion: '9.2.3',
      showUpgradeModal: showUpgradeModalMockFn,
      setUpgradeVersion: setUpgradeVersionMockFn,
      closeModal: closeModalMockFn,
    });

    expect(
      screen.getByText(/This cluster can be upgraded to these releases\:/)
    ).toBeInTheDocument();

    const versions = ['9.2.4-beta3', '9.2.4-beta4', '9.3.0'];
    for (const version of versions) {
      let label = `v${version}`;
      if (version.includes('beta')) {
        label += ' (BETA)';
      }
      const releaseButton = screen.getByRole('button', {
        name: label,
      });
      expect(releaseButton).toBeInTheDocument();

      fireEvent.click(releaseButton);
      expect(showUpgradeModalMockFn).toHaveBeenCalled();
      expect(setUpgradeVersionMockFn).toHaveBeenCalledWith(version);
      expect(closeModalMockFn).toHaveBeenCalled();
    }

    expect(
      screen.getByText(
        'Beta releases are not recommended for production use. Upgrading to newer beta and non-beta releases is possible.'
      )
    ).toBeInTheDocument();
  });

  it('does not render anything if not able to upgrade to any version', () => {
    const showUpgradeModalMockFn = jest.fn();
    const setUpgradeVersionMockFn = jest.fn();
    const closeModalMockFn = jest.fn();

    renderWithTheme(ReleaseDetailsModalUpgradeOptions, {
      isAdmin: false,
      releases: availableReleases,
      provider: 'aws',
      currentVersion: '10.1.0',
      showUpgradeModal: showUpgradeModalMockFn,
      setUpgradeVersion: setUpgradeVersionMockFn,
      closeModal: closeModalMockFn,
    });

    expect(
      screen.queryByText(/This cluster can be upgraded/)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        'Beta releases are not recommended for production use. Upgrading to newer beta and non-beta releases is possible.'
      )
    ).not.toBeInTheDocument();
  });
});

function createRelease(version: string, active: boolean): IRelease {
  return {
    version,
    active,
    timestamp: '2020-06-11T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.16.3' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
    kubernetesVersion: '1.16.3',
    releaseNotesURL: 'dummy',
  } as IRelease;
}
