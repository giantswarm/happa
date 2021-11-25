import { Box, Keyboard, Text } from 'grommet';
import React, { FC, KeyboardEventHandler, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import AddClusterLabelButton from 'UI/Display/Cluster/ClusterLabels/AddClusterLabelButton';
import ClusterLabel from 'UI/Display/Cluster/ClusterLabels/ClusterLabel';
import ValidationError from 'UI/Display/Cluster/ClusterLabels/ValidationError';
import { Tooltip } from 'UI/Display/Tooltip';
import TextInput from 'UI/Inputs/TextInput';
import useValidatingInternalValue from 'utils/hooks/useValidatingInternalValue';
import { validateLabelKey, validateLabelValue } from 'utils/labelUtils';

import DeleteLabelButton from './DeleteLabelButton';

interface IEditLabelTooltip {
  label: string;
  onOpen(isOpen: boolean): void;
  onSave(change: ILabelChange): void;
  value: string;

  allowInteraction?: boolean;
  className?: string;
}

const EditLabelTooltipWrapper = styled.div`
  display: inline-block;
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
  cursor: ${({ allowInteraction }) =>
    allowInteraction ? 'pointer' : 'default'};
  opacity: ${({ allowInteraction }) => (allowInteraction ? '1' : '0.6')};
`;

const EditLabelTooltip: FC<IEditLabelTooltip> = ({
  label,
  onOpen,
  onSave,
  value,
  allowInteraction,
  className,
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
  ] = useValidatingInternalValue(label, validateLabelKey);
  const [
    {
      internalValue: internalValueValue,
      isValid: valueIsValid,
      validationError: valueValidationError,
    },
    setInternalValueValue,
  ] = useValidatingInternalValue(value, validateLabelValue);

  const onClose = () => {
    setCurrentlyEditing(false);
    onOpen(currentlyEditing);
  };

  const save = () => {
    const savePayload: ILabelChange = {
      key: internalKeyValue,
      value: internalValueValue,
    };
    if (internalKeyValue !== label) {
      savePayload.replaceLabelWithKey = label;
    }
    onSave(savePayload);
    onClose();
  };

  const open = () => {
    if (allowInteraction === true) {
      setInternalKeyValue(label);
      setInternalValueValue(value);
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
      {label === '' ? (
        <AddClusterLabelButton
          disabled={!allowInteraction || currentlyEditing}
          onClick={open}
          data-testid='add-label-button'
          icon={<i className='fa fa-add-circle' />}
        >
          Add
        </AddClusterLabelButton>
      ) : (
        <Keyboard onSpace={handleLabelKeyDown} onEnter={handleLabelKeyDown}>
          <ClusterLabel
            onClick={open}
            label={
              <Editable allowInteraction={allowInteraction}>{label}</Editable>
            }
            value={
              <Editable allowInteraction={allowInteraction}>{value}</Editable>
            }
            removeButton={
              <DeleteLabelButton
                allowInteraction={allowInteraction}
                onOpen={onOpen}
                onDelete={() => {
                  onSave({ key: label, value: null });
                }}
                role='button'
                aria-label={`Delete '${label}' label`}
              />
            }
          />
        </Keyboard>
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
