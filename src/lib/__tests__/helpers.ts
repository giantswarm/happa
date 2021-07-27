import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import {
  clustersForOrg,
  compareDates,
  dedent,
  formatDate,
  hasAppropriateLength,
  humanFileSize,
  IHumanFileSizeValue,
  isJwtExpired,
  makeKubeConfigTextFile,
  relativeDate,
  toTitleCase,
  truncate,
  validateOrRaise,
} from 'lib/helpers';
import { IKeyPair } from 'shared/types';

describe('helpers', () => {
  describe('dedent', () => {
    it('formats code in a user-friendly way', () => {
      const input = `somecommand execute \\
      go-home \\
      cool    `;
      const result = dedent(input);

      expect(result).toEqual(`somecommand execute \\
go-home \\
cool`);
    });
  });

  describe('humanFileSize', () => {
    it('formats various numbers of bytes in their correct user-friendly representations, using the SI notation', () => {
      /* eslint-disable no-magic-numbers */

      const attempts = [
        {
          size: 0,
          result: { unit: 'B', value: '0.0' },
        },
        {
          size: 500,
          result: { unit: 'B', value: '500.0' },
        },
        {
          size: 10 ** 3,
          result: { unit: 'kB', value: '1.0' },
        },
        {
          size: 42.3 * 10 ** 3,
          result: { unit: 'kB', value: '42.3' },
        },
        {
          size: 10 ** 6,
          result: { unit: 'MB', value: '1.0' },
        },
        {
          size: 503.9 * 10 ** 6,
          result: { unit: 'MB', value: '503.9' },
        },
        {
          size: 10 ** 9,
          result: { unit: 'GB', value: '1.0' },
        },
        {
          size: 213.33 * 10 ** 9,
          result: { unit: 'GB', value: '213.3' },
        },
        {
          size: 10 ** 12,
          result: { unit: 'TB', value: '1.0' },
        },
        {
          size: 983.912 * 10 ** 12,
          result: { unit: 'TB', value: '983.9' },
        },
        {
          size: 10 ** 15,
          result: { unit: 'PB', value: '1.0' },
        },
        {
          size: 150.01239 * 10 ** 15,
          result: { unit: 'PB', value: '150.0' },
        },
        {
          size: 10 ** 18,
          result: { unit: 'EB', value: '1.0' },
        },
        {
          size: 13.9 * 10 ** 18,
          result: { unit: 'EB', value: '13.9' },
        },
        {
          size: 10 ** 21,
          result: { unit: 'ZB', value: '1.0' },
        },
        {
          size: 33 * 10 ** 21,
          result: { unit: 'ZB', value: '33.0' },
        },
        {
          size: 10 ** 24,
          result: { unit: 'YB', value: '1.0' },
        },
        {
          size: 341.3 * 10 ** 24,
          result: { unit: 'YB', value: '341.3' },
        },
      ];

      for (const attempt of attempts) {
        expect(humanFileSize(attempt.size)).toStrictEqual(
          attempt.result as IHumanFileSizeValue<true>
        );
      }

      /* eslint-enable no-magic-numbers */
    });

    it('formats various numbers of bytes in their correct user-friendly representations, using a non-SI notation', () => {
      /* eslint-disable no-magic-numbers */

      const attempts = [
        {
          size: 0,
          result: { unit: 'B', value: '0.0' },
        },
        {
          size: 500,
          result: { unit: 'B', value: '500.0' },
        },
        {
          size: 1024,
          result: { unit: 'KiB', value: '1.0' },
        },
        {
          size: 42.3 * 1024,
          result: { unit: 'KiB', value: '42.3' },
        },
        {
          size: 1024 ** 2,
          result: { unit: 'MiB', value: '1.0' },
        },
        {
          size: 503.9 * 1024 ** 2,
          result: { unit: 'MiB', value: '503.9' },
        },
        {
          size: 1024 ** 3,
          result: { unit: 'GiB', value: '1.0' },
        },
        {
          size: 213.33 * 1024 ** 3,
          result: { unit: 'GiB', value: '213.3' },
        },
        {
          size: 1024 ** 4,
          result: { unit: 'TiB', value: '1.0' },
        },
        {
          size: 983.912 * 1024 ** 4,
          result: { unit: 'TiB', value: '983.9' },
        },
        {
          size: 1024 ** 5,
          result: { unit: 'PiB', value: '1.0' },
        },
        {
          size: 150.01239 * 1024 ** 5,
          result: { unit: 'PiB', value: '150.0' },
        },
        {
          size: 1024 ** 6,
          result: { unit: 'EiB', value: '1.0' },
        },
        {
          size: 13.9 * 1024 ** 6,
          result: { unit: 'EiB', value: '13.9' },
        },
        {
          size: 1024 ** 7,
          result: { unit: 'ZiB', value: '1.0' },
        },
        {
          size: 33 * 1024 ** 7,
          result: { unit: 'ZiB', value: '33.0' },
        },
        {
          size: 1024 ** 8,
          result: { unit: 'YiB', value: '1.0' },
        },
        {
          size: 341.3 * 1024 ** 8,
          result: { unit: 'YiB', value: '341.3' },
        },
      ];

      for (const attempt of attempts) {
        expect(humanFileSize(attempt.size, false)).toStrictEqual(
          attempt.result as IHumanFileSizeValue<false>
        );
      }

      /* eslint-enable no-magic-numbers */
    });

    it('rounds resulting units to the number of decimals that is requested', () => {
      /* eslint-disable no-magic-numbers */

      const bytes = 35.192301 * 10 ** 16;
      let result = humanFileSize<boolean>(bytes, true, 3);
      expect(result).toStrictEqual({ unit: 'PB', value: '351.923' });

      result = humanFileSize(bytes, false, 3);
      expect(result).toStrictEqual({ unit: 'PiB', value: '312.570' });

      /* eslint-enable no-magic-numbers */
    });
  });

  describe('validateOrRaise', () => {
    it('validates a certain object, with validate.js constraints', () => {
      const obj: { email: string; token?: string } = {
        email: '@@google.com',
      };

      const constraints = {
        email: {
          presence: true,
          email: true,
          length: {
            minimum: 15,
          },
        },
        token: { presence: true },
      };

      expect(() => {
        validateOrRaise(obj, constraints);
      }).toThrowError(
        new Error(`email: is not a valid email, is too short (minimum is 15 characters)
token: can't be blank`)
      );

      obj.email = 'test@someemail.com';
      obj.token = 'some-token';

      validateOrRaise(obj, constraints);
    });
  });

  describe('formatDate', () => {
    it('formats the date in a user-friendly way', () => {
      const date = new Date('05 January 1973 15:34 GMT+5').toISOString();
      expect(formatDate(date)).toEqual('5 Jan 1973, 10:34 UTC');
    });
  });

  describe('relativeDate', () => {
    it('renders a placeholder if the date is empty', () => {
      render(relativeDate());

      expect(screen.getByText(/n\/a/)).toBeInTheDocument();
    });

    it('renders a date relative from now', async () => {
      // eslint-disable-next-line no-magic-numbers
      const date = new Date(Date.now() - 50000).toISOString();
      render(relativeDate(date));

      const label = screen.getByText(/1 minute ago/i);
      expect(label).toBeInTheDocument();

      const formattedDate = formatDate(date);
      fireEvent.mouseEnter(label);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
      fireEvent.mouseLeave(label);
      await waitForElementToBeRemoved(() => screen.getByText(formattedDate));
    });
  });

  describe('toTitleCase', () => {
    it('capitalizes every word in a sentence', () => {
      const input = 'A wild frog jumps over the lazy dog.';
      expect(toTitleCase(input)).toEqual(
        'A Wild Frog Jumps Over The Lazy Dog.'
      );
    });
  });

  describe('truncate', () => {
    it('leaves string untouched if it is too short to be replaced', () => {
      const initial = 'someString';
      // eslint-disable-next-line no-magic-numbers
      const result = truncate(initial, '...', 15, 5);

      expect(result).toBe(initial);
    });

    it('accepts zero values', () => {
      const initial = 'someString';
      const result = truncate(initial, '...', 0, 0);

      expect(result).toBe(initial);
    });

    it('truncates string', () => {
      const initial = 'someReallyLongStringThatIWouldLikeToTruncate';
      // eslint-disable-next-line no-magic-numbers
      const result = truncate(initial, '...', 10, 8);

      expect(result).toBe('someReally...Truncate');
    });

    it('accepts different replacers', () => {
      const initial = 'someReallyLongStringThatIWouldLikeToTruncate';
      // eslint-disable-next-line no-magic-numbers
      const result = truncate(initial, 'NotReallyHelpful', 10, 8);

      expect(result).toBe('someReallyNotReallyHelpfulTruncate');
    });
  });

  describe('makeKubeConfigTextFile', () => {
    const cluster: V5.ICluster = {
      id: '1sa1s',
      api_endpoint: 'https://api.somek8s.bestk8s.io',
      create_date: null,
      owner: 'giantswarm',
      name: 'My amazing cluster',
      release_version: '5.0.0',
      delete_date: null,
      labels: {},
      master: {
        availability_zone: '',
      },
      master_nodes: null,
    };

    const keyPair: IKeyPair = {
      certificate_organizations: '',
      cn_prefix: '',
      description: '',
      ttl_hours: 1,
      certificate_authority_data: 'somecert',
      client_certificate_data: 'someothercert',
      client_key_data: 'somekey',
    };

    it('generates a kubectl configuration file using the given input', () => {
      const expectedResult = `
    apiVersion: v1
    kind: Config
    clusters:
    - cluster:
        certificate-authority-data: ${btoa(keyPair.certificate_authority_data)}
        server: https://api.somek8s.bestk8s.io
      name: giantswarm-1sa1s
    contexts:
    - context:
        cluster: giantswarm-1sa1s
        user: giantswarm-1sa1s-user
      name: giantswarm-1sa1s-context
    current-context: giantswarm-1sa1s-context
    users:
    - name: giantswarm-1sa1s-user
      user:
        client-certificate-data: ${btoa(keyPair.client_certificate_data)}
        client-key-data: ${btoa(keyPair.client_key_data)}
    `;

      expect(makeKubeConfigTextFile(cluster, keyPair, false)).toEqual(
        expectedResult
      );
    });

    it('generates a kubectl configuration file using the given input, if using the internal api is desired', () => {
      const expectedResult = `
    apiVersion: v1
    kind: Config
    clusters:
    - cluster:
        certificate-authority-data: ${btoa(keyPair.certificate_authority_data)}
        server: https://internal-api.somek8s.bestk8s.io
      name: giantswarm-1sa1s
    contexts:
    - context:
        cluster: giantswarm-1sa1s
        user: giantswarm-1sa1s-user
      name: giantswarm-1sa1s-context
    current-context: giantswarm-1sa1s-context
    users:
    - name: giantswarm-1sa1s-user
      user:
        client-certificate-data: ${btoa(keyPair.client_certificate_data)}
        client-key-data: ${btoa(keyPair.client_key_data)}
    `;

      expect(makeKubeConfigTextFile(cluster, keyPair, true)).toEqual(
        expectedResult
      );
    });
  });

  describe('clustersForOrg', () => {
    const organizations: IOrganization[] = [
      { id: 'giantswarm' },
      { id: 'smallswarm' },
      { id: 'mediumswarm' },
    ];

    it('filters all clusters for a given organization', () => {
      const clusters: IClusterMap = {
        '1sa1s': {
          id: '1sa1s',
          api_endpoint: 'https://api.somek8s.bestk8s.io',
          create_date: null,
          owner: 'giantswarm',
          name: 'My amazing cluster',
          release_version: '5.0.0',
          delete_date: null,
          labels: {},
          master: {
            availability_zone: '',
          },
          master_nodes: null,
        },
        v2sad: {
          id: 'v2sad',
          api_endpoint: 'https://api.somek8s.bestk8s.io',
          create_date: null,
          owner: 'giantswarm',
          name: 'My amazing cluster',
          release_version: '5.0.0',
          delete_date: null,
          labels: {},
          master: {
            availability_zone: '',
          },
          master_nodes: null,
        },
        v5as0: {
          id: 'v5as0',
          api_endpoint: 'https://api.somek8s.bestk8s.io',
          create_date: null,
          owner: 'smallswarm',
          name: 'My amazing cluster',
          release_version: '5.0.0',
          delete_date: null,
          labels: {},
          master: {
            availability_zone: '',
          },
          master_nodes: null,
        },
        sd01s: {
          id: 'sd01s',
          api_endpoint: 'https://api.somek8s.bestk8s.io',
          create_date: null,
          owner: 'giantswarm',
          name: 'My amazing cluster',
          release_version: '5.0.0',
          credential_id: 'some-credential',
        },
        fas2q: {
          id: 'fas2q',
          api_endpoint: 'https://api.somek8s.bestk8s.io',
          create_date: null,
          owner: 'mediumswarm',
          name: 'My amazing cluster',
          release_version: '5.0.0',
          credential_id: 'some-credential',
        },
      };
      expect(
        clustersForOrg('giantswarm', organizations, clusters)
      ).toHaveLength(3);
      expect(
        clustersForOrg('mediumswarm', organizations, clusters)
      ).toHaveLength(1);
      expect(
        clustersForOrg('smallswarm', organizations, clusters)
      ).toHaveLength(1);
      expect(clustersForOrg('random', organizations, clusters)).toHaveLength(0);
    });

    it('returns an empty list of clusters, if there are no clusters provided', () => {
      expect(clustersForOrg('giantswarm', organizations)).toHaveLength(0);
    });
  });

  describe('isJwtExpired', () => {
    it('checks if a token is expired or not', () => {
      let jwt = makeJWT({
        sub: '1231234',
        // eslint-disable-next-line no-magic-numbers
        exp: Date.now() / 1000 + 30,
        name: 'John Doe',
        email: 'someone@somewhere.com',
      });
      expect(isJwtExpired(jwt)).toBeFalsy();

      jwt = makeJWT({
        sub: '1231234',
        // eslint-disable-next-line no-magic-numbers
        exp: Date.now() / 1000 - 1000,
        name: 'John Doe',
        email: 'someone@somewhere.com',
      });
      expect(isJwtExpired(jwt)).toBeTruthy();
    });

    it('returns false if a token is invalid', () => {
      expect(isJwtExpired('not a token')).toBeTruthy();
    });

    function makeJWT(payload: Record<string, unknown>): string {
      const header = {
        alg: 'HS256',
        typ: 'JWT',
      };
      const encodedHeader = btoa(JSON.stringify(header));
      const encodedPayload = btoa(JSON.stringify(payload));

      const encodedJWT = `${encodedHeader}.${encodedPayload}`
        .replace('/', '_')
        .replace('+', '-');

      return encodedJWT;
    }
  });

  describe('hasAppropriateLength', () => {
    it('validates if a string has the length within the given constraints', () => {
      expect(hasAppropriateLength('', 3, 5)).toStrictEqual({
        isValid: false,
        message: 'Name must not be empty',
      });

      expect(hasAppropriateLength('hi', 3, 5)).toStrictEqual({
        isValid: false,
        message: 'Name must not contain less than 3 characters',
      });

      expect(
        hasAppropriateLength('Hello sir, welcome to the club!', 3, 5)
      ).toStrictEqual({
        isValid: false,
        message: 'Name must not contain more than 5 characters',
      });

      expect(hasAppropriateLength('dogs', 3, 5)).toStrictEqual({
        isValid: true,
        message: '',
      });
    });

    it('returns a custom message with the string`s label, if provided', () => {
      expect(hasAppropriateLength('', 3, 5, 'Description')).toStrictEqual({
        isValid: false,
        message: 'Description must not be empty',
      });
    });
  });

  describe('compareDates', () => {
    it('compares dates with various formats', () => {
      const randomDate = new Date();
      // eslint-disable-next-line no-magic-numbers
      randomDate.setTime(90821343701982);

      let dates = [
        '1930-02-30',
        '2020-02-21T16:50:20.589772+00:00',
        '1996-09-10',
        // eslint-disable-next-line no-magic-numbers
        12341231312,
        '2999-12-18',
        randomDate,
      ];

      dates = dates.sort(compareDates);
      expect(dates).toStrictEqual([
        '1930-02-30',
        // eslint-disable-next-line no-magic-numbers
        12341231312,
        '1996-09-10',
        '2020-02-21T16:50:20.589772+00:00',
        '2999-12-18',
        randomDate,
      ]);
    });
  });
});
