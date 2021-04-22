import { readmeBaseURL, urlFor } from '../utils';

describe('readmeBaseURL', () => {
  it('returns an empty string if given an empty string', () => {
    const url = '';
    const result = readmeBaseURL(url);
    const expected = '';

    expect(result).toEqual(expected);
  });

  it('takes a URL to a github Readme and returns a base url', () => {
    const url = 'https://github.com/giantswarm/efk-stack-app/v0.3.2/README.md';

    const result = readmeBaseURL(url);
    const expected = 'https://github.com/giantswarm/efk-stack-app/blob/v0.3.2/';

    expect(result).toEqual(expected);
  });
});

describe('urlFor', () => {
  const baseURL = 'https://github.com/giantswarm/efk-stack-app/blob/v0.3.2/';

  it('leaves page anchor links alone', () => {
    const url = '#page-anchor';
    const result = urlFor(url, baseURL);
    const expected = '#page-anchor';

    expect(result).toEqual(expected);
  });

  it('leaves absolute links alone', () => {
    const url = 'https://google.com';
    const result = urlFor(url, baseURL);
    const expected = 'https://google.com';

    expect(result).toEqual(expected);
  });

  it('prepends the baseURL to relative links #1', () => {
    const url = '/relative-link';
    const result = urlFor(url, baseURL);
    const expected =
      'https://github.com/giantswarm/efk-stack-app/blob/v0.3.2//relative-link';

    expect(result).toEqual(expected);
  });

  it('prepends the baseURL to relative links #2', () => {
    const url = './relative-link';
    const result = urlFor(url, baseURL);
    const expected =
      'https://github.com/giantswarm/efk-stack-app/blob/v0.3.2/./relative-link';

    expect(result).toEqual(expected);
  });

  it('prepends the baseURL to relative links #3', () => {
    const url = 'relative-link';
    const result = urlFor(url, baseURL);
    const expected =
      'https://github.com/giantswarm/efk-stack-app/blob/v0.3.2/relative-link';

    expect(result).toEqual(expected);
  });
});
