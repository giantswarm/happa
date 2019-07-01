import { shallow } from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';

import CertificateOrgsLabel from '../certificate_orgs_label.js';

it('renders single label without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CertificateOrgsLabel value={'foobar'} />, div);
});

it('renders multiple labels without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CertificateOrgsLabel value={'foobar,foo,bar'} />, div);
});

it('renders empty label without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CertificateOrgsLabel value={''} />, div);
});

it('renders multiple labels in alphabetic order', () => {
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
