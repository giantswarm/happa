import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { Reducer, useReducer, useState } from 'react';
import { Input } from 'styles';
import Button from 'UI/Button';

import ValueLabel from './ValueLabel';

interface IEditableValueLabel {
  label: string;
  value: string;
  onSave({ label, value }: { label: string; value: string | null }): void;
  onCancel(): void;
  isNew: boolean;
}
interface IValidation {
  isValid: boolean;
  validationError: string;
}

interface IValidateLabel {
  (label: string): IValidation;
}

interface IState extends IValidation {
  rawLabel: string;
}

const validateLabel: IValidateLabel = (label: string) => {
  const [key, value, ...rest] = label.trim().split('=');

  if (!key || !value || rest.length !== 0) {
    return {
      isValid: false,
      validationError:
        'Valid labels consist of a key and value separated by a single equal sign (=)',
    };
  }

  return {
    isValid: true,
    validationError: '',
  };
};

const EditableWrapper = styled.div`
  display: flex;
  ${Input}
`;

const DeletedValueLabel = styled(ValueLabel)`
  text-decoration: line-through;
  opacity: 0.5;
`;

const EditableValueLabel = ({
  label,
  value,
  onSave,
  isNew,
  onCancel,
}: IEditableValueLabel) => {
  const [editable, setEditable] = useState(isNew);
  const [isDeleted, setDeleted] = useState(false);
  const [deletedValueTemp, setDeletedValueTemp] = useState('');
  const [{ rawLabel, isValid, validationError }, setRawLabel] = useReducer<
    Reducer<IState, string>
  >(
    (_, newRawLabel) => ({
      rawLabel: newRawLabel,
      ...validateLabel(newRawLabel),
    }),
    {
      rawLabel: `${label}=${value}`,
      ...validateLabel(`${label}=${value}`),
    }
  );

  if (editable) {
    return (
      // @ts-ignore
      <EditableWrapper>
        <input
          type='text'
          onChange={({ target: { value: newRawLabel } }) =>
            setRawLabel(newRawLabel)
          }
          value={rawLabel}
        />
        {!isValid && validationError}
        <Button
          bsStyle='success'
          disabled={!isValid}
          onClick={() => {
            setEditable(false);
            const labelValue = rawLabel.split('=');
            onSave({ label: labelValue[0], value: labelValue[1] });
          }}
        >
          Save
        </Button>
        <Button
          bsStyle='link'
          onClick={() => {
            setEditable(false);
            setRawLabel(`${label}=${value}`);
            onCancel();
          }}
        >
          Cancel
        </Button>
      </EditableWrapper>
    );
  }

  return (
    // @ts-ignore
    <EditableWrapper>
      {isDeleted ? (
        <>
          <DeletedValueLabel label={label} value={deletedValueTemp} />
          <Button
            bsStyle='link'
            onClick={() => {
              setRawLabel(`${label}=${deletedValueTemp}`);
              onSave({ label, value: deletedValueTemp });
              setDeletedValueTemp('');
              setDeleted(false);
            }}
          >
            Restore
          </Button>
        </>
      ) : (
        <>
          <ValueLabel label={label} value={value} />
          <Button bsStyle='link' onClick={() => setEditable(true)}>
            Edit
          </Button>
          <Button
            bsStyle='link'
            onClick={() => {
              setDeleted(true);
              setDeletedValueTemp(value);
              onSave({ label, value: null });
            }}
          >
            Remove
          </Button>
        </>
      )}
    </EditableWrapper>
  );
};

EditableValueLabel.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  isNew: PropTypes.bool,
};

EditableValueLabel.defaultProps = {
  isNew: false,
  value: '',
  onSave: () => {},
  onCancel: () => {},
};

export default EditableValueLabel;
