import { normalizePath } from '../normalizePath';

describe('normalizePath', () => {
  it('maps the home route', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('maps a static route', () => {
    expect(normalizePath('/organizations')).toBe('/organizations');
  });

  it('strips the org ID from the organization detail route', () => {
    expect(normalizePath('/organizations/acme')).toBe('/organizations/:orgId');
  });

  it('strips concrete IDs from the cluster detail route', () => {
    expect(normalizePath('/organizations/acme/clusters/abc123')).toBe(
      '/organizations/:orgId/clusters/:clusterId'
    );
  });

  it('maps deep cluster detail sub-routes', () => {
    expect(
      normalizePath('/organizations/acme/clusters/abc123/worker-nodes')
    ).toBe('/organizations/:orgId/clusters/:clusterId/worker-nodes');
  });

  it('maps the app detail route', () => {
    expect(normalizePath('/apps/giantswarm/my-app/1.2.3')).toBe(
      '/apps/:catalogName/:app/:version'
    );
  });

  it('prefers the static cluster-creation route over the param variants', () => {
    expect(normalizePath('/organizations/acme/clusters/new')).toBe(
      '/organizations/:orgId/clusters/new'
    );
  });

  it('returns null for unknown / probing paths', () => {
    expect(normalizePath('/horde/login.php')).toBeNull();
    expect(normalizePath('/wp-admin')).toBeNull();
    expect(normalizePath('/organizations/acme/unknown-subpage')).toBeNull();
  });
});
