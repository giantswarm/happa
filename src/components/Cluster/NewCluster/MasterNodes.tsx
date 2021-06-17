import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import InputGroup from 'UI/Inputs/InputGroup';
import RadioInput from 'UI/Inputs/RadioInput';

const InputSubtitle = styled.small`
  font-size: 0.74rem;
  padding-left: 29px;
`;

interface IMasterNodesProps {
  isHighAvailability?: boolean;
  onChange?: (isHA: boolean) => void;
}

const MasterNodes: React.FC<IMasterNodesProps> = ({
  isHighAvailability,
  onChange,
}) => {
  const handleChange = (isHA: boolean) => () => {
    onChange?.(isHA);
  };

  return (
    <InputGroup
      label='Control plane nodes'
      contentProps={{
        gap: 'medium',
      }}
      margin={{
        bottom: 'small',
      }}
    >
      <fieldset>
        <RadioInput
          id='high-availability'
          label='High availability'
          checked={isHighAvailability}
          value='true'
          name='high-availability'
          onChange={handleChange(true)}
          formFieldProps={{ margin: { bottom: 'none' } }}
        />
        <InputSubtitle>
          Three control plane nodes, each placed in a separate availability
          zone, selected at random. Preferred for production clusters.
        </InputSubtitle>
      </fieldset>
      <fieldset>
        <RadioInput
          id='single-master'
          label='Single control plane node'
          checked={!isHighAvailability}
          value='false'
          name='high-availability'
          onChange={handleChange(false)}
          formFieldProps={{ margin: { bottom: 'none' } }}
        />
        <InputSubtitle>
          One control plane node, placed in an availability zone selected at
          random.
        </InputSubtitle>
      </fieldset>
    </InputGroup>
  );
};

MasterNodes.propTypes = {
  isHighAvailability: PropTypes.bool,
  onChange: PropTypes.func,
};

MasterNodes.defaultProps = {
  isHighAvailability: false,
};

export default MasterNodes;
