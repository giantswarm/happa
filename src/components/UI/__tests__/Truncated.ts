import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from 'test/renderUtils';
import Truncated from 'UI/Util/Truncated';

describe('Truncated', () => {
  it('renders without crashing', () => {
    renderWithTheme(Truncated, {
      children: 'Test',
    });
  });

  it('renders base text if the text is too short to be truncated', () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'Test',
    });

    expect(getByText('Test')).toBeInTheDocument();
  });

  it('renders truncated text if the text is long', () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'ATextThatIsTooLongToBeDisplayed',
    });

    expect(getByText('ATextThatIsTooL…layed')).toBeInTheDocument();
  });

  it('accepts zero values', () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'ATextThatIsTooLongToBeDisplayed',
      numStart: 0,
      numEnd: 0,
    });

    expect(getByText('ATextThatIsTooLongToBeDisplayed')).toBeInTheDocument();
  });

  it('accepts different replacers', () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'ATextThatIsTooLongToBeDisplayed',
      replacer: 'NotHelpful',
    });

    expect(getByText('ATextThatIsTooLNotHelpfullayed')).toBeInTheDocument();
  });

  it('can be rendered as a different element', () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'Test',
      as: 'div',
    });

    const rootEl: HTMLDivElement = getByText('Test')
      .parentNode as HTMLDivElement;
    expect(rootEl.tagName).toBe('DIV');
  });

  it('displays a tooltip while hovering on the label', () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'ATextThatIsTooLongToBeDisplayed',
    });

    const label: HTMLSpanElement = getByText('ATextThatIsTooL…layed');
    fireEvent.mouseOver(label);
    expect(getByText('ATextThatIsTooLongToBeDisplayed')).toBeInTheDocument();
  });

  it(`doesn't display a tooltip for text that wasn't truncated`, () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'short',
    });

    const label: HTMLSpanElement = getByText('short');
    fireEvent.mouseOver(label);
    expect(label).not.toHaveAttribute('aria-describedby');
  });

  it('can have props passed to the root component', () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'Test',
      className: 'test-class',
    });

    const rootEl: HTMLSpanElement = getByText('Test')
      .parentNode as HTMLSpanElement;
    expect(rootEl.matches('.test-class')).toBe(true);
  });

  it('can have props passed to the label component', () => {
    const { getByText } = renderWithTheme(Truncated, {
      children: 'Test',
      labelProps: {
        className: 'test-class',
      },
    });

    const label: HTMLSpanElement = getByText('Test');
    expect(label.matches('.test-class')).toBe(true);
  });
});
