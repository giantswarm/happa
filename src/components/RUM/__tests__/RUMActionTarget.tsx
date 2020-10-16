import { render } from '@testing-library/react';
import React from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';

describe('RUMActionTarget', () => {
  it('adds the correct properties to the nested component', () => {
    render(
      <RUMActionTarget name='EVENT_TARGET'>
        <div>Hello</div>
      </RUMActionTarget>
    );

    expect(
      document.querySelector(`[data-dd-action-name='EVENT_TARGET']`)
    ).toBeInTheDocument();
  });

  it('capitalizes action names', () => {
    render(
      <RUMActionTarget name='event_target'>
        <div>Hello</div>
      </RUMActionTarget>
    );

    expect(
      document.querySelector(`[data-dd-action-name='EVENT_TARGET']`)
    ).toBeInTheDocument();
  });
});
