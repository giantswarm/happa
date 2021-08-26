import { Box, Button } from 'grommet';
import * as React from 'react';

import CheckBoxInput from '../CheckBoxInput';
import Select from '../Select';
import OptionPill from './OptionPill';

function getIDFromOption(option: string): string {
  return option.toLowerCase().replace(/\s/, '-');
}

interface IMultiSelectProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Select>,
    'multiple' | 'value' | 'selected'
  > {
  /**
   * The values that can be chosen from the dropdown.
   */
  options: string[];
  /**
   * The maximum number of selected values that can
   * be seen in the top view.
   */
  maxVisibleValues?: number;
  /**
   * The function that gets called when a value
   * is deleted.
   */
  onRemoveValue?: (option: string) => void;
  /**
   * The options that are currently selected.
   */
  selected?: string[];
  /**
   * Whether the input should be disabled or not.
   */
  disabled?: boolean;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, IMultiSelectProps>(
  (
    {
      placeholder,
      onRemoveValue,
      selected,
      options,
      maxVisibleValues,
      disabled,
      ...props
    },
    ref
  ) => {
    const visibleSelections = selected?.slice(0, maxVisibleValues) ?? [];
    const extraSelectionsLength = (selected?.length ?? 0) - maxVisibleValues!;

    const selectedOptionsIdx = React.useMemo(() => {
      return options.reduce<number[]>((acc, curr, idx) => {
        if (selected?.includes(curr)) {
          acc.push(idx);
        }

        return acc;
      }, []);
    }, [selected, options]);

    return (
      <Select
        multiple={true}
        closeOnChange={false}
        placeholder={placeholder}
        selected={selectedOptionsIdx}
        options={options}
        disabled={disabled}
        value={
          visibleSelections.length > 0 ? (
            <Box wrap={true} direction='row'>
              {visibleSelections.map((option) => (
                <Button
                  key={`button_${option}`}
                  href='#'
                  disabled={disabled}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (disabled) return;

                    onRemoveValue?.(option);
                  }}
                  onFocus={(e) => e.stopPropagation()}
                >
                  <OptionPill option={option} editable={!disabled} />
                </Button>
              ))}

              {extraSelectionsLength > 0 && (
                <OptionPill
                  option={`+${extraSelectionsLength} more`}
                  editable={false}
                />
              )}
            </Box>
          ) : undefined
        }
        {...props}
        ref={ref}
      >
        {(option, _idx, _options, state) => {
          return (
            <CheckBoxInput
              key={option}
              id={getIDFromOption(option)}
              name={getIDFromOption(option)}
              tabIndex={-1}
              checked={state.selected}
              disabled={state.disabled}
              label={option}
              margin='none'
              contentProps={{
                pad: 'small',
              }}
            />
          );
        }}
      </Select>
    );
  }
);

MultiSelect.defaultProps = {
  maxVisibleValues: 4,
};

export default MultiSelect;
