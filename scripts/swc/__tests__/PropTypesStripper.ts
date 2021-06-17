import { parse, parseSync, transformSync } from '@swc/core';
import PropTypesStripper from '../PropTypesStripper';

describe('PropTypesStripper', () => {
  it('removes empty prop types if assigned as a property', () => {
    expect(transformCode(`TestComponent.propTypes = {};`)).toEqual(`void 0;`);
  });

  it('removes prop types if assigned as a property', () => {
    expect(
      transformCode(`TestComponent.propTypes = {
      value: PropTypes.string,
      otherStuff: PropTypes.oneOf('test1', 'test2'),
    };`)
    ).toEqual(`void 0;`);
  });

  it('removes prop types if assigned as a static class property', () => {
    expect(
      transformCode(`class Test {
      static propTypes = {
        value: PropTypes.string,
        otherStuff: PropTypes.oneOf('test1', 'test2'),
      };
      doSomething() {}
    }`)
    ).toEqual(`class Test {
    doSomething() {
    }
}`);
  });

  it('removes "prop-types" import', () => {
    expect(transformCode(`import PropTypes from 'prop-types';`)).toEqual(``);
  });
});

function transformCode(code: string): string {
  const instance = new PropTypesStripper();

  const parsed = parseSync(code);
  const out = transformSync(parsed, {
    jsc: {
      target: 'es2020',
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
    },
    plugin: (m) => instance.visitProgram(m),
  });

  // Strip end newline.
  return out.code.slice(0, -1);
}
