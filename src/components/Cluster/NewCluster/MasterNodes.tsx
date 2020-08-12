import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import StyledInput from 'UI/ClusterCreation/StyledInput';
import RadioInput from 'UI/Inputs/RadioInput';

const InputGroup = styled.fieldset`
  margin-bottom: 16px;
`;

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
    <StyledInput
      inputId='master-nodes'
      label='Master nodes'
      // "breaking space" hides the hint
      hint={<>&#32;</>}
    >
      <InputGroup>
        <RadioInput
          id='high-availability'
          label='High availability'
          checked={isHighAvailability}
          value='true'
          name='high-availability'
          onChange={handleChange(true)}
        />
        <InputSubtitle>
          Three master nodes, each placed in a separate availability zone,
          selected at random. Preferred for production clusters.
        </InputSubtitle>
      </InputGroup>
      <InputGroup>
        <RadioInput
          id='single-master'
          label='Single master'
          checked={!isHighAvailability}
          value='false'
          name='high-availability'
          onChange={handleChange(false)}
        />
        <InputSubtitle>
          One master node, placed in an availability zone selected at random.
        </InputSubtitle>
      </InputGroup>
    </StyledInput>
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
