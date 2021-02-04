import { fireEvent, render, screen } from '@testing-library/react';
import NodeCountSelector from 'shared/NodeCountSelector';
import { getComponentWithTheme } from 'testUtils/renderUtils';

const getComponent = (props) => getComponentWithTheme(NodeCountSelector, props);
const renderWithProps = (props) => render(getComponent(props));

const labelTestID = 'node-count-selector-picker';

describe('NodeCountSelector', () => {
  it('renders without crashing', () => {
    renderWithProps({});
  });

  it('shows 1 picker with autoscale off', () => {
    const { getAllByTestId } = renderWithProps({ autoscalingEnabled: false });

    expect(getAllByTestId(labelTestID).length).toBe(1);
  });

  it('shows 2 pickers with autoscale on', () => {
    const { getAllByTestId } = renderWithProps({ autoscalingEnabled: true });

    expect(getAllByTestId(labelTestID).length).toBe(2);
  });

  it('shows disabled inputs in read-only mode, with autoscale off', () => {
    const { getByTestId } = renderWithProps({
      autoscalingEnabled: false,
      readOnly: true,
    });
    const input = getByTestId(labelTestID).querySelector('input');

    expect(input.disabled).toBe(true);
  });

  it('shows disabled inputs in read-only mode, with autoscale on', () => {
    const { getAllByTestId } = renderWithProps({
      autoscalingEnabled: true,
      readOnly: true,
    });
    const inputs = getAllByTestId(labelTestID).map((label) =>
      label.querySelector('input')
    );

    const areAllInputsDisabled = inputs.every((input) => input.disabled);

    expect(areAllInputsDisabled).toBe(true);
  });

  it('respects value constraints, with autoscale off', () => {
    const minValue = 5;
    const maxValue = 5;

    const { getByTestId, getByRole } = renderWithProps({
      autoscalingEnabled: false,
      minValue,
      maxValue,
    });
    const input = getByTestId(labelTestID).querySelector('input');

    const decrementButton = getByRole('button', {
      name: 'Decrement',
    });
    const incrementButton = getByRole('button', {
      name: 'Increment',
    });

    for (let i = 0; i < 9; i++) {
      fireEvent.click(decrementButton);
    }
    expect(input.value).toBe(`${minValue}`);

    for (let i = 0; i < 9; i++) {
      fireEvent.click(incrementButton);
    }
    expect(input.value).toBe(`${maxValue}`);
  });

  it('respects value constraints, with autoscale on', () => {
    const minValue = 5;
    const maxValue = 8;

    const { getAllByTestId, getAllByRole } = renderWithProps({
      autoscalingEnabled: true,
      minValue,
      maxValue,
    });
    const inputs = getAllByTestId(labelTestID).map((label) =>
      label.querySelector('input')
    );
    const decrementButtons = getAllByRole('button', {
      name: 'Decrement',
    });
    const incrementButtons = getAllByRole('button', {
      name: 'Increment',
    });

    for (let i = 0; i < 9; i++) {
      fireEvent.click(decrementButtons[0]);
      fireEvent.click(incrementButtons[1]);
    }

    expect(inputs[0].value).toBe(`${minValue}`);
    expect(inputs[1].value).toBe(`${maxValue}`);
  });

  it('dispatches current changed value outside component, with autoscale off', () => {
    const targetValue = 5;

    const onChangeCallback = jest.fn();
    const { getByTestId } = renderWithProps({
      autoscalingEnabled: false,
      onChange: onChangeCallback,
    });

    const input = getByTestId(labelTestID).querySelector('input');

    fireEvent.change(input, {
      target: {
        value: `${targetValue}`,
      },
    });

    expect(onChangeCallback).toBeCalledWith({
      scaling: {
        min: targetValue,
        minValid: true,
        max: targetValue,
        maxValid: true,
      },
    });
  });

  it('dispatches current changed value outside component, with autoscale on', () => {
    const targetMinValue = 5;
    const targetMaxValue = 10;

    const onChangeCallback = jest.fn();
    const { getAllByTestId } = renderWithProps({
      autoscalingEnabled: true,
      onChange: onChangeCallback,
    });

    const inputs = getAllByTestId(labelTestID).map((label) =>
      label.querySelector('input')
    );

    fireEvent.change(inputs[0], {
      target: {
        value: `${targetMinValue}`,
      },
    });

    expect(onChangeCallback).toBeCalledWith({
      scaling: {
        min: targetMinValue,
        minValid: true,
        max: 999,
        maxValid: true,
      },
    });

    fireEvent.change(inputs[1], {
      target: {
        value: `${targetMaxValue}`,
      },
    });

    expect(onChangeCallback).toBeCalledWith({
      scaling: {
        min: 0,
        minValid: true,
        max: targetMaxValue,
        maxValid: true,
      },
    });
  });

  it('hides labels, with autoscaling off', () => {
    const minLabel = 'Min value';
    const maxLabel = 'Max value';

    const { getAllByText } = renderWithProps({
      autoscalingEnabled: false,
      label: {
        min: minLabel,
        max: maxLabel,
      },
    });

    let areLabelsFound = true;

    try {
      expect(getAllByText(minLabel).length).toBe(0);
      expect(getAllByText(maxLabel).length).toBe(0);
    } catch {
      areLabelsFound = false;
    }

    expect(areLabelsFound).toBe(false);
  });

  it('displays labels, with autoscaling on', () => {
    const minLabel = 'Min value';
    const maxLabel = 'Max value';

    const { getAllByText } = renderWithProps({
      autoscalingEnabled: true,
      label: {
        min: minLabel,
        max: maxLabel,
      },
    });

    expect(getAllByText(minLabel).length).toBe(1);
    expect(getAllByText(maxLabel).length).toBe(1);
  });

  it('disables default form behaviour, with autoscaling off', () => {
    const { getByTestId } = renderWithProps({
      autoscalingEnabled: false,
    });
    const input = getByTestId(labelTestID).querySelector('input');
    const initialValue = input.value;

    fireEvent.keyPress(input, {
      key: 'Enter',
    });

    expect(input.value).toBe(initialValue);
  });

  it('disables default form behaviour, with autoscaling on', () => {
    const { getAllByTestId } = renderWithProps({
      autoscalingEnabled: true,
    });
    const inputs = getAllByTestId(labelTestID).map((label) =>
      label.querySelector('input')
    );
    const initialValues = inputs.map((input) => input.value);

    fireEvent.keyPress(inputs[0], {
      key: 'Enter',
    });

    expect(inputs[0].value).toBe(initialValues[0]);

    fireEvent.keyPress(inputs[1], {
      key: 'Enter',
    });

    expect(inputs[1].value).toBe(initialValues[1]);
  });

  it('shows correct autoscale suggestion labels, with autoscaling on', () => {
    const autoScalingLabelTestID = 'node-count-selector-autoscaling-label';
    const targetValue = 5;

    const baseProps = {
      autoscalingEnabled: true,
    };

    const { getByTestId, rerender } = renderWithProps({
      ...baseProps,
      scaling: {
        min: targetValue,
        minValid: true,
        max: targetValue,
        maxValid: true,
      },
    });

    expect(getByTestId(autoScalingLabelTestID).textContent).toBe(
      'To enable autoscaling, set minimum and maximum to different values.'
    );

    rerender(
      getComponent({
        ...baseProps,
        scaling: {
          min: targetValue,
          minValid: true,
          max: targetValue * 2,
          maxValid: true,
        },
      })
    );

    expect(getByTestId(autoScalingLabelTestID).textContent).toBe(
      'To disable autoscaling, set both numbers to the same value.'
    );
  });

  it('allows setting the autoscaling values in any order', () => {
    const onChangeMockFn = jest.fn();
    const baseProps = {
      autoscalingEnabled: true,
      minValue: 1,
      maxValue: 99,
      onChange: onChangeMockFn,
    };

    const scaling = {
      min: 3,
      minValid: true,
      max: 10,
      maxValid: true,
    };

    const { rerender } = renderWithProps({
      ...baseProps,
      scaling,
    });

    const minInputElement = screen.getByTitle('Minimum');
    const maxInputElement = screen.getByTitle('Maximum');

    fireEvent.change(maxInputElement, { target: { value: 2 } });
    scaling.max = 2;
    scaling.maxValid = false;
    scaling.minValid = false;
    rerender(
      getComponent({
        ...baseProps,
        scaling,
      })
    );
    expect(onChangeMockFn).toHaveBeenLastCalledWith({ scaling });

    fireEvent.change(minInputElement, { target: { value: 2 } });
    scaling.min = 2;
    scaling.maxValid = true;
    scaling.minValid = true;
    rerender(
      getComponent({
        ...baseProps,
        scaling,
      })
    );
    expect(onChangeMockFn).toHaveBeenLastCalledWith({ scaling });

    fireEvent.change(minInputElement, { target: { value: 5 } });
    scaling.min = 5;
    scaling.maxValid = false;
    scaling.minValid = false;
    rerender(
      getComponent({
        ...baseProps,
        scaling,
      })
    );
    expect(onChangeMockFn).toHaveBeenLastCalledWith({ scaling });

    fireEvent.change(maxInputElement, { target: { value: 8 } });
    scaling.max = 8;
    scaling.maxValid = true;
    scaling.minValid = true;
    rerender(
      getComponent({
        ...baseProps,
        scaling,
      })
    );
    expect(onChangeMockFn).toHaveBeenLastCalledWith({ scaling });
  });
});
