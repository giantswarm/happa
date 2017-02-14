'use strict';
import React from 'react';
import { SignUp } from 'components/signup';
import { mount } from 'enzyme';

import configureStore from 'stores/configureStore';
const store = configureStore();

describe('HappaApp', function () {
  it('should create a new instance of HappaApp', function () {
    const wrapper = mount(<SignUp store={store} params={{contactId: "123456"}} />);

    var text = wrapper.ref('title').text();

    expect(text).toEqual('Create Your Giant Swarm Account');
  });
});
