import * as errors from '../';

describe('Error', () => {
  it('works', () => {
    const error = new errors.Error('some-type', 'Some shit blew up');

    const json = JSON.stringify(error);
    console.log(json);
  });
});
