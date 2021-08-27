import { Configuration } from '../Configuration';

describe('Configuration', () => {
  it('can parse configuration values from a YAML string', () => {
    const input = `some:
  key:
    value: 'test'
    hello: test2
some-other-key:
  hello: true
some-other-other-key:
  number: 3
`;

    const config = new Configuration();
    config.parse(input);

    expect(config.getString('some.key.value')).toEqual('test');
    expect(config.getString('some.key.value.some-other-value')).toEqual('');
    expect(config.getString('some-value.some-other-value')).toEqual('');
    expect(config.getBoolean('some-other-key.hello')).toBeTruthy();
    expect(config.getBoolean('some-other-key.hi')).toBeFalsy();
    expect(config.getNumber('some-other-other-key.number')).toEqual(3);
    expect(config.getNumber('some-other-other-key.random')).toEqual(0);
  });

  it('can use an empty configuration file', () => {
    const input = '';

    const config = new Configuration();
    config.parse(input);

    expect(config.getString('some.key.value')).toEqual('');
    expect(config.getBoolean('some-other-key.hi')).toBeFalsy();
  });

  it('can set default values', () => {
    const input = '';

    const config = new Configuration();

    config.setDefault('some.key.value', 'hi friends');
    config.parse(input);

    expect(config.getString('some.key.value')).toEqual('hi friends');
    expect(config.getBoolean('some-other-key.hi')).toBeFalsy();

    config.parse(`some:
  key:
    value: 'test'
`);

    expect(config.getString('some.key.value')).toEqual('test');

    config.setDefault('some.key.value', 'hi friends');

    expect(config.getString('some.key.value')).toEqual('test');
  });

  it('can parse configuration values from environmental variables', () => {
    const initialEnv = process.env;
    process.env = {
      ...process.env,
      SOME_VALUE: 'test',
      SOME_NUMBER_VALUE: '3',
      SOME_BOOLE_VALUE: 'true',
    };

    const input = '';

    const config = new Configuration();
    config.useEnvVariables();
    config.parse(input);

    expect(config.getString('some.value')).toEqual('test');
    expect(config.getString('some.other.value')).toEqual('');
    expect(config.getNumber('some.number.value')).toEqual(3);
    expect(config.getNumber('some.number.value2')).toEqual(0);
    expect(config.getBoolean('some.boole.value')).toEqual(true);
    expect(config.getBoolean('some.boole.value2')).toEqual(false);

    process.env = initialEnv;
  });

  it('can override configuration values with environmental variables', () => {
    const initialEnv = process.env;
    process.env = {
      ...process.env,
      SOME_VALUE: 'not-a-test',
      SOME_NUMBER_VALUE: '3',
      SOME_BOOLE_VALUE: 'true',
    };

    const input = `some:
  value: 'test'
some-other-key:
  hello: true
some-other-other-key:
  number: 3
`;

    const config = new Configuration();
    config.useEnvVariables();
    config.parse(input);

    expect(config.getString('some.value')).toEqual('not-a-test');

    process.env = initialEnv;
  });

  it('can set a prefix for environmental variables', () => {
    const initialEnv = process.env;
    process.env = {
      ...process.env,
      PREFIX_SOME_VALUE: 'test',
      PREFIX_SOME_NUMBER_VALUE: '3',
      PREFIX_SOME_BOOLE_VALUE: 'true',
    };

    const input = '';

    const config = new Configuration();
    config.useEnvVariables();
    config.setEnvVariablePrefix('PREFIX');
    config.parse(input);

    expect(config.getString('some.value')).toEqual('test');
    expect(config.getString('prefix.some.value')).toEqual('');
    expect(config.getNumber('some.number.value')).toEqual(3);
    expect(config.getNumber('prefix.some.number.value')).toEqual(0);
    expect(config.getBoolean('some.boole.value')).toEqual(true);
    expect(config.getBoolean('prefix.some.boole.value')).toEqual(false);

    process.env = initialEnv;
  });
});
