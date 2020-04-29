import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Button from 'UI/Button';
import EditableValueLabel from 'UI/EditableValueLabel';

interface IAddClusterLabelProps {
  onSave({ label, value }: { label: string; value: string | null }): void;
}

const AddClusterLabel = ({ onSave }: IAddClusterLabelProps) => {
  const [isAdding, setIsAdding] = useState(false);

  if (!isAdding) {
    return <Button onClick={() => setIsAdding(true)}>Add label</Button>;
  }

  return (
    <EditableValueLabel
      isNew={true}
      label=''
      value=''
      onSave={(l) => {
        onSave(l);
        setIsAdding(false);
      }}
      onCancel={() => setIsAdding(false)}
    />
  );
};

AddClusterLabel.propTypes = {
  onSave: PropTypes.func,
};

AddClusterLabel.defaultProps = {
  onSave: () => {},
};

export default AddClusterLabel;
