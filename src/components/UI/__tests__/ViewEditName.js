import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import ViewEditName from 'UI/ViewEditName';

const defaultEntity = {
  name: 'Some value',
  type: 'test-type',
};

const renderComponent = (props = {}) => {
  const propsWithDefault = Object.assign(
    {},
    {
      entity: defaultEntity,
      entityType: defaultEntity.type,
    },
    props
  );

  return render(<ViewEditName {...propsWithDefault} />);
};

describe('ViewEditName', () => {
  it('renders without crashing', () => {
    renderComponent();
  });

  it('edits content on click', () => {
    const { getByText, getByDisplayValue } = renderComponent();

    let label = getByText(/some value/i);
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe('a');

    // Hover to see helping tooltip
    fireEvent.mouseOver(label);
    expect(getByText(/Click to edit test-type name/i)).toBeInTheDocument();

    // Click to edit
    fireEvent.click(label);
    const input = getByDisplayValue(/some value/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: 'some other value' },
    });

    const submitButton = getByText(/ok/i);
    fireEvent.click(submitButton);

    // Value was changed
    label = getByText(/some other value/i);
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe('a');
  });

  it('cancels edit on pressing cancel', () => {
    const { getByText, getByDisplayValue } = renderComponent();

    let label = getByText(/some value/i);

    // Click to edit
    fireEvent.click(label);
    const input = getByDisplayValue(/some value/i);
    fireEvent.change(input, {
      target: { value: 'some other value' },
    });

    // Press cancel
    const cancelButton = getByText(/cancel/i);
    fireEvent.click(cancelButton);

    // Value was not changed
    label = getByText(/some value/i);
    expect(label).toBeInTheDocument();
  });

  it(`can be saved by pressing the 'enter' key`, () => {
    const { getByText, getByDisplayValue } = renderComponent();

    let label = getByText(/some value/i);
    expect(label.tagName.toLowerCase()).toBe('a');

    // Click to edit
    fireEvent.click(label);
    const input = getByDisplayValue(/some value/i);
    fireEvent.change(input, {
      target: { value: 'some other value' },
    });

    // Press enter
    fireEvent.keyUp(input, {
      key: 'Enter',
    });

    // Value has been changed
    label = getByText(/some other value/i);
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe('a');
  });

  it(`cancels input by pressing the 'escape' key`, () => {
    const { getByText, getByDisplayValue } = renderComponent();

    let label = getByText(/some value/i);

    // Click to edit
    fireEvent.click(label);
    const input = getByDisplayValue(/some value/i);
    fireEvent.change(input, {
      target: { value: 'some other value' },
    });

    // Press escape
    fireEvent.keyUp(input, {
      key: 'Escape',
    });

    // Value was not changed
    label = getByText(/some value/i);
    expect(label).toBeInTheDocument();
  });

  it('validates input on submit', () => {
    const { getByText, getByDisplayValue } = renderComponent();

    const label = getByText(/some value/i);

    // Click to edit
    fireEvent.click(label);
    const input = getByDisplayValue(/some value/i);
    fireEvent.change(input, {
      target: { value: 'no' },
    });

    const submitButton = getByText(/ok/i);
    fireEvent.click(submitButton);

    // A warning is shown
    expect(
      getByText(/please use a name with at least 3 characters/i)
    ).toBeInTheDocument();

    // Input is still here, data not saved
    expect(input).toBeInTheDocument();
  });

  it('executes callbacks from props on submit', () => {
    const onSubmitMock = jest.fn();
    const onToggleEditingStateMock = jest.fn();

    const { getByText, getByDisplayValue } = renderComponent({
      onSubmit: onSubmitMock,
      toggleEditingState: onToggleEditingStateMock,
    });

    const label = getByText(/some value/i);

    // Click to edit
    fireEvent.click(label);
    expect(onToggleEditingStateMock).toBeCalledWith(true);
    const input = getByDisplayValue(/some value/i);
    fireEvent.change(input, {
      target: { value: 'some other value' },
    });

    const submitButton = getByText(/ok/i);
    fireEvent.click(submitButton);
    expect(onSubmitMock).toHaveBeenCalledWith('some other value');

    expect(onToggleEditingStateMock).toBeCalledWith(false);
  });

  it('executes callbacks from props on cancel', () => {
    const onSubmitMock = jest.fn();
    const onToggleEditingStateMock = jest.fn();

    const { getByText, getByDisplayValue } = renderComponent({
      onSubmit: onSubmitMock,
      toggleEditingState: onToggleEditingStateMock,
    });

    const label = getByText(/some value/i);

    // Click to edit
    fireEvent.click(label);
    expect(onToggleEditingStateMock).toBeCalledWith(true);
    const input = getByDisplayValue(/some value/i);
    fireEvent.change(input, {
      target: { value: 'some other value' },
    });

    const submitButton = getByText(/cancel/i);
    fireEvent.click(submitButton);
    expect(onSubmitMock).not.toBeCalled();

    expect(onToggleEditingStateMock).toBeCalledWith(false);
  });
});
