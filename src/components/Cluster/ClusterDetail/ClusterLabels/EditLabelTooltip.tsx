import { Text } from 'grommet';
import useValidatingInternalValue from 'lib/hooks/useValidatingInternalValue';
import PropTypes from 'prop-types';
import React, { FC, KeyboardEventHandler, useRef, useState } from 'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import EditValueTooltip from 'UI/Display/Cluster/ClusterLabels/EditValueTooltip';
import ValidationError from 'UI/Display/Cluster/ClusterLabels/ValidationError';
import ValueLabel from 'UI/Display/ValueLabel';
import TextInput from 'UI/Inputs/TextInput';
import { validateLabelKey, validateLabelValue } from 'utils/labelUtils';

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

const StyledValueLabel = styled(ValueLabel)`
  margin-bottom: 0;
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

const AddLabelButton = styled(Button)`
  padding: 6px 8px;
  font-size: 12px;
  line-height: 12px;
  text-transform: uppercase;
`;

const Editable = styled.span<{ allowInteraction?: boolean }>`
  text-decoration: ${({ allowInteraction }) =>
    allowInteraction ? 'underline' : 'none'};
  text-decoration-style: dotted;
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

  const keyHandler: KeyboardEventHandler<HTMLInputElement> = ({ key }) => {
    if (key === 'Escape') {
      onClose();
    } else if (keyIsValid && valueIsValid && key === 'Enter') {
      save();
    }
  };

  return (
    <EditLabelTooltipWrapper ref={divElement} className={className}>
      {label === '' ? (
        <AddLabelButton
          disabled={!allowInteraction || currentlyEditing}
          onClick={open}
          data-testid='add-label-button'
        >
          <i className='fa fa-add-circle' /> Add label
        </AddLabelButton>
      ) : (
        <StyledValueLabel
          onClick={open}
          label={
            <Editable allowInteraction={allowInteraction}>{label}</Editable>
          }
          value={
            <Editable allowInteraction={allowInteraction}>{value}</Editable>
          }
        />
      )}
      <Overlay
        target={divElement.current as HTMLDivElement}
        placement='top'
        show={currentlyEditing}
        shouldUpdatePosition={false}
        animation={false}
      >
        <EditValueTooltip id='add-label-tooltip'>
          <FormWrapper>
            <KeyInputWrapper>
              <TextInput
                label={<Text size='small'>Label key</Text>}
                onChange={({ target: { value: newRawValue } }) =>
                  setInternalKeyValue(newRawValue)
                }
                value={internalKeyValue}
                onKeyUp={keyHandler}
                id='label-key-input'
                size='xsmall'
                formFieldProps={{
                  margin: { bottom: 'none' },
                }}
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
                onKeyUp={keyHandler}
                id='label-value-input'
                size='xsmall'
                formFieldProps={{
                  margin: { bottom: 'none' },
                }}
              />
            </ValueInputWrapper>
            <Buttons>
              <Button
                bsStyle='primary'
                disabled={!keyIsValid || !valueIsValid}
                onClick={save}
              >
                Save
              </Button>
              <Button bsStyle='link' onClick={onClose}>
                Cancel
              </Button>
            </Buttons>
          </FormWrapper>
          <ValidationError isValid={keyIsValid && valueIsValid}>
            {[keyValidationError, valueValidationError]
              .filter((err) => err)
              .join(',')}
          </ValidationError>
        </EditValueTooltip>
      </Overlay>
    </EditLabelTooltipWrapper>
  );
};

EditLabelTooltip.propTypes = {
  label: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,

  allowInteraction: PropTypes.bool,
  className: PropTypes.string,
};

export default EditLabelTooltip;
