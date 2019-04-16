import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';

import CertificateOrgsLabel from './certificate_orgs_label.js';

// Component only checks for props.value === '' and does not check undefined so it will crash without value
/*
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CertificateOrgsLabel />, div);
});
*/

it('renders single label without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CertificateOrgsLabel value={'foobar'} />, div);
});

it('renders multiply labels without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CertificateOrgsLabel value={'foobar,foo,bar'} />, div);
});

it('renders empty label without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CertificateOrgsLabel value={''} />, div);
});

it('renders multiply labels in alphabetic order', () => {
  const label = shallow(
    <CertificateOrgsLabel value={'Exa,Mega,Atto,Zepto,Yokto'} />
  );
  expect(
    label
      .find('span')
      .at(0)
      .props().children
  ).toEqual('Atto');
  expect(
    label
      .find('span')
      .at(1)
      .props().children
  ).toEqual('Exa');
  expect(
    label
      .find('span')
      .at(2)
      .props().children
  ).toEqual('Mega');
  expect(
    label
      .find('span')
      .at(3)
      .props().children
  ).toEqual('Yokto');
  expect(
    label
      .find('span')
      .at(4)
      .props().children
  ).toEqual('Zepto');
});

it('system:masters has a special isadmin class', () => {
  const label = shallow(<CertificateOrgsLabel value={'system:masters'} />);
  expect(label.text()).toEqual('system:masters');
  expect(label.hasClass('orglabel')).toBe(true);
  expect(label.hasClass('isadmin')).toBe(true);
});

it('system:user does not get special isadmin class', () => {
  const label = shallow(<CertificateOrgsLabel value={'system:user'} />);
  expect(label.text()).toEqual('system:user');
  expect(label.hasClass('orglabel')).toBe(true);
  expect(label.hasClass('isadmin')).toBe(false);
});
