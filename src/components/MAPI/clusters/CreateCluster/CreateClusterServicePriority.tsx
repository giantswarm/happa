import { Box } from 'grommet';
import { getClusterServicePriority } from 'MAPI/utils';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';
import Select from 'UI/Inputs/Select';
import { toTitleCase } from 'utils/helpers';

import { IClusterPropertyProps, withClusterServicePriority } from './patches';

interface ICreateClusterServicePriorityProps
  extends IClusterPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof InputGroup>,
      'onChange' | 'id'
    > {}

const CreateClusterServicePriority: React.FC<
  React.PropsWithChildren<ICreateClusterServicePriorityProps>
> = ({
  id,
  cluster,
  providerCluster,
  onChange,
  readOnly,
  disabled,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      isValid: true,
      patch: withClusterServicePriority(e.target.value),
    });
  };

  const value = getClusterServicePriority(cluster);

  return (
    <InputGroup
      htmlFor={id}
      label='Service priority'
      help="Specifies the cluster's priority, relative to other clusters."
      {...props}
    >
      <Box width='200px'>
        <Select
          value={value}
          id={id}
          onChange={handleChange}
          options={['highest', 'medium', 'lowest']}
          labelKey={toTitleCase}
          readOnly={readOnly}
          disabled={disabled}
        />
      </Box>
    </InputGroup>
  );
};

export default CreateClusterServicePriority;
