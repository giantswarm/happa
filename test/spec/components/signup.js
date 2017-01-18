'use strict';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { SignUp } from 'components/signup'
import { shallow } from 'enzyme';

import configureStore from 'stores/configureStore';
const store = configureStore();

function MyComponent() {
  return (
    <div>
      <span className="heading">Title</span>
      <h1>Test</h1>
    </div>
  );
}

describe('HappaApp', function () {
  it('should create a new instance of HappaApp', function () {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<SignUp store={store} />);
    const result = renderer.getRenderOutput();

    expect(result.type).toBe('div');
    expect(result.props.children).toContain(<h1>Create Your Giant Swarm Account</h1>);
  });
});
