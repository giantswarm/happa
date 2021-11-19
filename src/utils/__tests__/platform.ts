import 'platform';

describe('platform', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('maps linux-based platforms to a general Linux type', async () => {
    jest.mock('platform', () => ({
      os: { family: 'Fedora' },
    }));
    const gsPlatform = await import('utils/platform');
    expect(gsPlatform.default).toBe('Linux');
  });

  it('maps mac-based platforms to a general Mac type', async () => {
    jest.mock('platform', () => ({
      os: { family: 'OS X' },
    }));
    const gsPlatform = await import('utils/platform');
    expect(gsPlatform.default).toBe('Mac');
  });

  it('maps windows-based platforms to a general Windows type', async () => {
    jest.mock('platform', () => ({
      os: { family: 'Windows' },
    }));
    const gsPlatform = await import('utils/platform');
    expect(gsPlatform.default).toBe('Windows');
  });

  it('returns unknown for an empty os family', async () => {
    jest.mock('platform', () => ({
      os: { family: null },
    }));
    const gsPlatform = await import('utils/platform');
    expect(gsPlatform.default).toBe('Unknown');
  });
});
