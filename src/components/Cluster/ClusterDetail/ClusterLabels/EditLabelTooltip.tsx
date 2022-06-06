import { Box, Keyboard, Text } from 'grommet';
import {
  canClusterLabelBeDeleted,
  canClusterLabelBeEdited,
  canClusterLabelKeyBeEdited,
} from 'MAPI/clusters/ClusterDetail/utils';
import React, { FC, KeyboardEventHandler, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ValidationError from 'UI/Display/Cluster/ClusterLabels/ValidationError';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import ValueLabel, { KeyWrapper, ValueWrapper } from 'UI/Display/ValueLabel';
import TextInput from 'UI/Inputs/TextInput';
import useValidatingInternalValue from 'utils/hooks/useValidatingInternalValue';
import { validateLabelKey, validateLabelValue } from 'utils/labelUtils';

import DeleteLabelButton from './DeleteLabelButton';

interface IEditLabelTooltip {
  label?: IClusterLabelWithDisplayInfo;
  onOpen(isOpen: boolean): void;
  onSave(change: ILabelChange): void;

  allowInteraction?: boolean;
  className?: string;
  unauthorized?: boolean;
  displayRawLabels?: boolean;
}

const EditLabelTooltipWrapper = styled.div`
  display: inline-block;
`;

const StyledValueLabel = styled(ValueLabel)<{
  allowInteraction?: boolean;
  unauthorized?: boolean;
  canBeEdited?: boolean;
}>`
  margin-bottom: 0;
  line-height: 24px;
  height: 24px;
  font-size: 13px;

  cursor: ${({ allowInteraction, unauthorized, canBeEdited }) => {
    switch (true) {
      case unauthorized:
      case !canBeEdited:
        return 'not-allowed';
      case allowInteraction:
        return 'pointer';
      default:
        return 'default';
    }
  }};

  :hover {
    ${KeyWrapper}, ${ValueWrapper} {
      text-decoration: ${({ allowInteraction, canBeEdited }) =>
        allowInteraction && canBeEdited ? 'underline' : 'none'};
      text-decoration-style: dotted;
    }
  }
`;

const FormWrapper = styled.div`
  display: grid;
  margin: 5px 0 0 5px;
  grid-template: 'keyinput separator valueinput buttons';
  grid-template-columns: 1fr 0.05fr 1fr 1fr;
  grid-gap: 0 8px;
`;

const GridCell = styled.div`
  display: flex;
  align-items: flex-end;
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacingPx}px;
`;

const KeyInputWrapper = styled(GridCell)`
  grid-area: keyinput;
`;

const ValueInputWrapper = styled(GridCell)`
  grid-area: valueinput;
`;

const Separator = styled.div`
  grid-area: separator;
  display: flex;
  align-items: flex-end;
  padding-bottom: 14px;
`;

const Buttons = styled(GridCell)`
  grid-area: buttons;
  padding-bottom: 2px;
`;

const Editable = styled.span<{ allowInteraction?: boolean }>`
  opacity: ${({ allowInteraction }) => (allowInteraction ? '1' : '0.6')};
`;

// This is to make the "Click to edit label" tooltip not appear above the label editing tooltip
const StyledTooltip = styled(Tooltip)`
  z-index: 1069 !important;
`;

const LabelWrapper = styled(Box)<{
  allowInteraction?: boolean;
}>`
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.colors.darkBlue};
  overflow: hidden;

  :hover {
    pointer-events: ${({ allowInteraction }) =>
      allowInteraction ? 'auto' : 'none'};
  }
`;

const EditLabelTooltip: FC<React.PropsWithChildren<IEditLabelTooltip>> = ({
  label,
  onOpen,
  onSave,
  allowInteraction,
  className,
  unauthorized,
  displayRawLabels,
}) => {
  const [currentlyEditing, setCurrentlyEditing] = useState(false);

  const divElement = useRef<HTMLDivElement>(null);

  const [
    {
      internalValue: internalKeyValue,
      isValid: keyIsValid,
      validationError: keyValidationError,
    },
    setInternalKeyValue,
  ] = useValidatingInternalValue(label ? label.key : '', validateLabelKey);
  const [
    {
      internalValue: internalValueValue,
      isValid: valueIsValid,
      validationError: valueValidationError,
    },
    setInternalValueValue,
  ] = useValidatingInternalValue(label ? label.value : '', validateLabelValue);

  const onClose = () => {
    setCurrentlyEditing(false);
    onOpen(currentlyEditing);
  };

  const save = () => {
    const savePayload: ILabelChange = {
      key: internalKeyValue,
      value: internalValueValue,
    };
    if (label && label.key !== internalKeyValue) {
      savePayload.replaceLabelWithKey = label.key;
    }
    onSave(savePayload);
    onClose();
  };

  const open = () => {
    if (
      allowInteraction === true &&
      (label ? canClusterLabelBeEdited(label.key) : true) &&
      !unauthorized
    ) {
      setInternalKeyValue(label ? label.key : '');
      setInternalValueValue(label ? label.value : '');
      setCurrentlyEditing(true);
      onOpen(currentlyEditing);
    }
  };

  const keyHandler: KeyboardEventHandler<HTMLElement> = (
    e: React.KeyboardEvent<HTMLElement>
  ) => {
    e.preventDefault();

    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && keyIsValid && valueIsValid) {
      save();
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    open();
  };

  return (
    <EditLabelTooltipWrapper ref={divElement} className={className}>
      {typeof label === 'undefined' ? (
        <Button
          disabled={!allowInteraction || currentlyEditing}
          onClick={open}
          data-testid='add-label-button'
          icon={<i className='fa fa-add-circle' />}
          size='small'
        >
          Add label
        </Button>
      ) : (
        <LabelWrapper
          direction='row'
          align='center'
          allowInteraction={allowInteraction}
        >
          <Keyboard onSpace={handleLabelKeyDown} onEnter={handleLabelKeyDown}>
            <TooltipContainer
              target={divElement}
              content={
                <StyledTooltip>
                  {unauthorized
                    ? 'For editing labels, you need additional permissions.'
                    : canClusterLabelBeEdited(label.key)
                    ? 'Click to edit label'
                    : 'This label cannot be edited'}
                </StyledTooltip>
              }
            >
              <StyledValueLabel
                onClick={open}
                label={
                  <Editable allowInteraction={allowInteraction}>
                    {displayRawLabels ? label.key : label.displayKey}
                  </Editable>
                }
                value={
                  <Editable allowInteraction={allowInteraction}>
                    {displayRawLabels ? label.value : label.displayValue}
                  </Editable>
                }
                valueBackgroundColor={label.backgroundColor}
                valueTextColor={label.textColor}
                tabIndex={allowInteraction ? 0 : -1}
                role='button'
                aria-label={`Label ${label.key} with value ${label.value}`}
                aria-disabled={!allowInteraction || currentlyEditing}
                allowInteraction={allowInteraction}
                unauthorized={unauthorized}
                canBeEdited={canClusterLabelBeEdited(label.key)}
                outline={false}
                rounded={false}
              />
            </TooltipContainer>
          </Keyboard>
          {!unauthorized && canClusterLabelBeDeleted(label.key) && (
            <DeleteLabelButton
              allowInteraction={allowInteraction}
              onOpen={onOpen}
              onDelete={() => {
                onSave({ key: label.key, value: null });
              }}
              role='button'
              backgroundColor={label.backgroundColor}
              color={label.textColor}
              aria-label={`Delete '${label.key}' label`}
              aria-disabled={!allowInteraction || currentlyEditing}
            />
          )}
        </LabelWrapper>
      )}
      {currentlyEditing && (
        <Tooltip
          id='add-label-tooltip'
          target={divElement.current ?? undefined}
          background='background-weak'
        >
          <Keyboard onEsc={keyHandler} onEnter={keyHandler}>
            <FormWrapper>
              <KeyInputWrapper>
                <TextInput
                  label={<Text size='small'>Label key</Text>}
                  onChange={({ target: { value: newRawValue } }) =>
                    setInternalKeyValue(newRawValue)
                  }
                  value={internalKeyValue}
                  id='label-key-input'
                  size='xsmall'
                  formFieldProps={{
                    margin: { bottom: 'none' },
                  }}
                  autoFocus={
                    internalKeyValue.length > 0 ||
                    internalValueValue.length >= 0
                  }
                  disabled={label && !canClusterLabelKeyBeEdited(label.key)}
                />
              </KeyInputWrapper>
              <Separator>:</Separator>
              <ValueInputWrapper>
                <TextInput
                  label={<Text size='small'>Label value</Text>}
                  onChange={({ target: { value: newRawValue } }) =>
                    setInternalValueValue(newRawValue)
                  }
                  value={internalValueValue}
                  id='label-value-input'
                  size='xsmall'
                  formFieldProps={{
                    margin: { bottom: 'none' },
                  }}
                  autoFocus={internalValueValue.length > 0}
                />
              </ValueInputWrapper>
              <Buttons>
                <Box gap='small' direction='row'>
                  <Button
                    primary={true}
                    disabled={!keyIsValid || !valueIsValid}
                    onClick={save}
                  >
                    Save
                  </Button>
                  <Button link={true} onClick={onClose}>
                    Cancel
                  </Button>
                </Box>
              </Buttons>
            </FormWrapper>
          </Keyboard>
          <ValidationError isValid={keyIsValid && valueIsValid}>
            <Text size='small'>
              {[keyValidationError, valueValidationError]
                .filter((err) => err)
                .join(', ')}
            </Text>
          </ValidationError>
        </Tooltip>
      )}
    </EditLabelTooltipWrapper>
  );
};

export default EditLabelTooltip;
