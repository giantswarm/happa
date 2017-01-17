'use strict';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

function MyComponent() {
  return (
    <div>
      <span className="heading">Title</span>
      <Subcomponent foo="bar" />
    </div>
  );
}

describe('HappaApp', function () {
  it('should create a new instance of HappaApp', function () {

    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<MyComponent />);
    const result = renderer.getRenderOutput();

    expect(result.type).toBe('div');
    expect(result.props.children).toEqual([
      <span className="heading">Title</span>,
      <Subcomponent foo="bar" />
    ]);

  });
});
