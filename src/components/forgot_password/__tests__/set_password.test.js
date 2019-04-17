
import { mount } from 'enzyme';
import React from 'react';
import SetPassword from '../set_password';

import ComponentWrapper from '../../../../test/component_wrapper';

describe('Set Password Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

   it('Test auto login', () => {
      const wrapper = mount(
        <ComponentWrapper router={{ location: { pathname: '/forgot_password', search: '', hash: '', state: undefined }, action: 'POP' }}>
          <SetPassword match={{'params': {'token': 'sads434534rewdsdgt'}}} />
        </ComponentWrapper>
      );

      // validate email

      const email = wrapper.find('#email');

      expect(email).toHaveLength(1);

      email.instance().value = 'test@test.com';
      email.simulate('change');

      expect(wrapper.find('#email').get(0).props.value).toBe('test@test.com');

      const button = wrapper.find('button[type="submit"]');
      button.simulate('click');

      Promise.runAll(); // required to run all mocked new Promise() - requests
      wrapper.update(); // required to force re-render of the component

      expect(wrapper.find('.progress_button--container')).toHaveLength(1);

      // set new password

      const pass1 = wrapper.find('input[type="password"]').at(0);

      pass1.simulate('focus');
      pass1.instance().value = 'SomeH@rdPassword1';
      pass1.simulate('blur');

      const pass2 = wrapper.find('input[type="password"]').at(1);

      pass2.simulate('focus');
      pass2.instance().value = 'SomeH@rdPassword1';
      pass2.simulate('blur');

      const buttonPassword = wrapper.find('button[type="submit"]');

      buttonPassword.simulate('click');

      Promise.runAll();
      wrapper.update();

      // final check

      expect(wrapper.find('.signup--status-text').text()).toBe('Logging in...');
    });

   it('Test localStorage', () => {
     localStorage.setItem('user.email', 'test@test.com');

     const wrapper = mount(
       <ComponentWrapper router={{ location: { pathname: '/forgot_password', search: '', hash: '', state: undefined }, action: 'POP' }}>
         <SetPassword match={{'params': {'token': 'sads434534rewdsdgt'}}} />
       </ComponentWrapper>
     );

     Promise.runAll();
     wrapper.update();

     expect(wrapper.find('.signup--status-text').text()).toBe('Please enter your desired password');
   });
});
