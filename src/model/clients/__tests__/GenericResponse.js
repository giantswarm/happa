import { GenericResponse } from '../GenericResponse';

describe('GenericResponse', () => {
  it('is constructed with a config', () => {
    // eslint-disable-next-line no-magic-numbers
    const res = new GenericResponse(200, {
      someKey: 'someValue',
    });

    // eslint-disable-next-line no-magic-numbers
    expect(res.status).toBe(200);
    expect(res.data).toStrictEqual({
      someKey: 'someValue',
    });
  });

  it('can be configured with various setters', () => {
    const res = new GenericResponse();

    res.status = 200;
    res.data = {
      someKey: 'someValue',
    };

    res.message = 'Success!';

    res.headers = {
      someHeader: 'someHeaderValue',
    };

    res.requestConfig = {
      url: '/v4/test',
    };

    res.setHeader('someOtherHeader');
    res.setHeader('someOtherHeader2', 'someOtherValue');

    // eslint-disable-next-line no-magic-numbers
    expect(res.status).toBe(200);
    expect(res.data).toStrictEqual({
      someKey: 'someValue',
    });
    expect(res.message).toBe('Success!');
    expect(res.headers).toStrictEqual({
      someHeader: 'someHeaderValue',
      someOtherHeader: '',
      someOtherHeader2: 'someOtherValue',
    });
    expect(res.requestConfig).toStrictEqual({
      url: '/v4/test',
    });
  });
});
