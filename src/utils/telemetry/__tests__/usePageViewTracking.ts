import { renderHook } from '@testing-library/react-hooks';

import { usePageViewTracking } from '../usePageViewTracking';

const mockTrackPageView = jest.fn();
let mockPathname = '/';
let mockUser: { email: string } | null = null;

jest.mock('../TelemetryService', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({ trackPageView: mockTrackPageView }),
  },
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({ pathname: mockPathname }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: () => mockUser,
}));

describe('usePageViewTracking', () => {
  beforeEach(() => {
    mockTrackPageView.mockClear();
    mockPathname = '/';
    mockUser = null;
  });

  it('does not track when there is no logged-in user', () => {
    mockUser = null;
    mockPathname = '/organizations/acme';

    renderHook(() => usePageViewTracking());

    expect(mockTrackPageView).not.toHaveBeenCalled();
  });

  it('does not track paths that do not map to a known route', () => {
    mockUser = { email: 'user@example.com' };
    mockPathname = '/horde/login.php';

    renderHook(() => usePageViewTracking());

    expect(mockTrackPageView).not.toHaveBeenCalled();
  });

  it('tracks the normalized route for an authenticated navigation', () => {
    mockUser = { email: 'user@example.com' };
    mockPathname = '/organizations/acme';

    renderHook(() => usePageViewTracking());

    expect(mockTrackPageView).toHaveBeenCalledTimes(1);
    expect(mockTrackPageView).toHaveBeenCalledWith(
      '/organizations/:orgId',
      'user@example.com'
    );
  });

  it('tracks again when the route changes', () => {
    mockUser = { email: 'user@example.com' };
    mockPathname = '/organizations/acme';

    const { rerender } = renderHook(() => usePageViewTracking());
    expect(mockTrackPageView).toHaveBeenCalledTimes(1);

    mockPathname = '/organizations/acme/clusters/abc123';
    rerender();

    expect(mockTrackPageView).toHaveBeenCalledTimes(2);
    expect(mockTrackPageView).toHaveBeenLastCalledWith(
      '/organizations/:orgId/clusters/:clusterId',
      'user@example.com'
    );
  });

  it('does not re-track when neither route nor user changes', () => {
    mockUser = { email: 'user@example.com' };
    mockPathname = '/organizations/acme';

    const { rerender } = renderHook(() => usePageViewTracking());
    rerender();

    expect(mockTrackPageView).toHaveBeenCalledTimes(1);
  });
});
