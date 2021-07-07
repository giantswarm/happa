import { Cluster } from 'MAPI/types';
import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';
import TextInput from 'UI/Inputs/TextInput';

import { IClusterPropertyProps } from './patches';

interface ICreateClusterNameProps
  extends IClusterPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof InputGroup>,
      'onChange' | 'id'
    > {}

const CreateClusterName: React.FC<ICreateClusterNameProps> = ({
  id,
  cluster,
  onChange,
  readOnly,
  disabled,
  ...props
}) => {
  return (
    <InputGroup htmlFor={id} label='Name' {...props}>
      <TextInput
        value={cluster.metadata.name}
        id={id}
        readOnly={readOnly}
        disabled={disabled}
      />
    </InputGroup>
  );
};

CreateClusterName.propTypes = {
  id: PropTypes.string.isRequired,
  cluster: (PropTypes.object as PropTypes.Requireable<Cluster>).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CreateClusterName;
