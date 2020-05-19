import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, {
  KeyboardEventHandler,
  Reducer,
  useReducer,
  useRef,
  useState,
} from 'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import Button from 'UI/Button';
import { InputElement } from 'UI/Input';
import { IValidation, IValidationFunction } from 'utils/labelUtils';

interface IEditableValueLabel {
  allowEdit: boolean;
  isNew: boolean;
  onCancel(): void;
  onEdit(): void;
  onSave(value: string): void;
  validationFunc: IValidationFunction;
  value: string;
}

interface IReducerState extends IValidation {
  internalValue: string;
}

const EditModeWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 10px 5px;
`;

const ValueInput = styled(InputElement)`
  margin-right: 10px;
`;

const EditValueTooltip = styled(Tooltip)`
  &.in {
    opacity: 1;
  }
  .tooltip-inner {
    background-color: ${({ theme }) => theme.colors.darkBlueLighter3};
  }
  &.top .tooltip-arrow {
    border-top-color: ${({ theme }) => theme.colors.darkBlueLighter3};
  }
`;

const ValidationErrorTooltip = styled(Tooltip)`
  &.in {
    opacity: 1;
  }
  .tooltip-inner {
    background-color: ${({ theme }) => theme.colors.error};
    color: black;
  }
  &.top .tooltip-arrow {
    border-top-color: ${({ theme }) => theme.colors.error};
  }
`;

const Editable = styled.span<{ allowEdit: boolean }>`
  text-decoration: ${({ allowEdit }) => (allowEdit ? 'underline' : 'none')};
  text-decoration-style: dotted;
  cursor: ${({ allowEdit }) => (allowEdit ? 'pointer' : 'default')};
  opacity: ${({ allowEdit }) => (allowEdit ? '1' : '0.6')};
`;

const EditableValueLabel = ({
  allowEdit,
  isNew,
  onCancel,
  onEdit,
  onSave,
  validationFunc,
  value,
}: IEditableValueLabel) => {
  const valueElement = useRef<HTMLSpanElement>(null);
  const inputElement = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(isNew);
  const [
    { internalValue, isValid, validationError },
    setInternalValue,
  ] = useReducer<Reducer<IReducerState, string>>(
    (_, newInternalValue) => ({
      internalValue: newInternalValue,
      ...validationFunc(newInternalValue),
    }),
    {
      internalValue: value,
      ...validationFunc(value),
    }
  );

  const keyHandler: KeyboardEventHandler<HTMLInputElement> = ({ key }) => {
    if (key === 'Escape') {
      setInternalValue(value);
      onCancel();
      setEditing(false);
    } else if (isValid === true && key === 'Enter') {
      onSave(internalValue);
      setEditing(false);
    }
  };

  return (
    <Editable
      allowEdit={allowEdit}
      ref={valueElement}
      onClick={() => {
        if (allowEdit) {
          onEdit();
          setEditing(true);
        }
      }}
    >
      {value}
      <Overlay
        // @ts-ignore
        target={valueElement.current}
        placement='top'
        show={editing}
        shouldUpdatePosition={true}
        animation={false}
      >
        <EditValueTooltip id={`edit-${value}`}>
          <EditModeWrapper>
            <ValueInput
              ref={inputElement}
              type='text'
              onChange={({ target: { value: newRawValue } }) =>
                setInternalValue(newRawValue)
              }
              value={internalValue}
              onKeyUp={keyHandler}
            />
            <Overlay
              // @ts-ignore
              target={inputElement.current}
              placement='top'
              show={!isValid}
              shouldUpdatePosition={true}
              animation={false}
            >
              <ValidationErrorTooltip id={`edit-${value}-error`}>
                {validationError}
              </ValidationErrorTooltip>
            </Overlay>
            <Button
              bsStyle='success'
              disabled={!isValid}
              onClick={() => {
                onSave(internalValue);
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              bsStyle='link'
              onClick={() => {
                setInternalValue(value);
                onCancel();
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </EditModeWrapper>
        </EditValueTooltip>
      </Overlay>
    </Editable>
  );
};

EditableValueLabel.propTypes = {
  allowEdit: PropTypes.bool,
  isNew: PropTypes.bool,
  onCancel: PropTypes.func,
  onEdit: PropTypes.func,
  onSave: PropTypes.func,
  validationFunc: PropTypes.func,
  value: PropTypes.string.isRequired,
};

EditableValueLabel.defaultProps = {
  allowEdit: true,
  isNew: false,
  onCancel: () => {},
  onEdit: () => {},
  onSave: () => {},
  validationFunc: () => ({ isValid: true, validationError: '' }),
};

export default EditableValueLabel;
