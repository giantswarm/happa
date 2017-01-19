'use strict';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { SignUp } from 'components/signup'
import { shallow, mount } from 'enzyme';

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
    const wrapper = mount(<SignUp store={store} params={{contactId: "123456"}} />);

    var text = wrapper.ref('title').text();

    expect(text).toEqual('Create Your Giant Swarm Account');
  });
});
