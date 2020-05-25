import styled from '@emotion/styled';
import useValidatingInternalValue from 'hooks/useValidatingInternalValue';
import PropTypes from 'prop-types';
import React, { FC, KeyboardEventHandler, useRef, useState } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import EditValueTooltip from 'UI/ClusterLabels/EditValueTooltip';
import ValidationError from 'UI/ClusterLabels/ValidationError';
import ValidityStyledInputElement from 'UI/ClusterLabels/ValidityStyledInputElement';
import ValueLabel from 'UI/ClusterLabels/ValueLabel';
import { validateLabelKey, validateLabelValue } from 'utils/labelUtils';

interface ILabel {
  key: string;
  value: string;
}

interface IEditLabelTooltip {
  label: string;
  onOpen(isOpen: boolean): void;
  onSave(label: ILabel): void;
  value: string;

  allowInteraction?: boolean;
}

const TempLabelWrapper = styled.div`
  display: inline-block;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 0 5px;
`;

const KeyInput = styled(ValidityStyledInputElement)`
  margin-right: 2px;
`;

const ValueInput = styled(ValidityStyledInputElement)`
  margin: 0 10px 0 4px;
`;

const AddLabelButton = styled(Button)`
  padding: 6px 8px;
  font-size: 12px;
  line-height: 12px;
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
    onSave({ key: internalKeyValue, value: internalValueValue });
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
    } else if (
      keyIsValid === true &&
      valueIsValid === true &&
      key === 'Enter'
    ) {
      save();
    }
  };

  return (
    <TempLabelWrapper ref={divElement}>
      {label === '' ? (
        <AddLabelButton
          disabled={!allowInteraction || currentlyEditing}
          onClick={open}
        >
          Add
        </AddLabelButton>
      ) : (
        <ValueLabel
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
          <InputWrapper>
            <KeyInput
              type='text'
              onChange={({ target: { value: newRawValue } }) =>
                setInternalKeyValue(newRawValue)
              }
              value={internalKeyValue}
              isValid={keyIsValid}
              onKeyUp={keyHandler}
            />
            :
            <ValueInput
              type='text'
              onChange={({ target: { value: newRawValue } }) =>
                setInternalValueValue(newRawValue)
              }
              value={internalValueValue}
              isValid={valueIsValid}
              onKeyUp={keyHandler}
            />
            <Button
              bsStyle='success'
              disabled={!keyIsValid || !valueIsValid}
              onClick={save}
            >
              Save
            </Button>
            <Button bsStyle='link' onClick={onClose}>
              Cancel
            </Button>
          </InputWrapper>
          <ValidationError isValid={keyIsValid && valueIsValid}>
            {[keyValidationError, valueValidationError]
              .filter((err) => err)
              .join(',')}
          </ValidationError>
        </EditValueTooltip>
      </Overlay>
    </TempLabelWrapper>
  );
};

EditLabelTooltip.propTypes = {
  label: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,

  allowInteraction: PropTypes.bool,
};

export default EditLabelTooltip;
