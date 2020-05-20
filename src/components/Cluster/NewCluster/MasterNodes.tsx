import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import RadioInput from 'UI/Inputs/RadioInput';

const InputGroup = styled.fieldset`
  margin-bottom: 16px;
`;

const InputSubtitle = styled.small`
  font-size: 0.74rem;
  padding-left: 29px;
`;

// TODO: Remove 'skip-format' and other external class names once possible, to make this extendable.

interface IMasterNodesProps {
  highAvailability?: boolean;
  onChange?: (isHA: boolean) => void;
}

const MasterNodes: React.FC<IMasterNodesProps> = ({
  highAvailability,
  onChange,
}) => {
  const handleChange = (isHA: boolean) => () => {
    // eslint-disable-next-line no-unused-expressions
    onChange?.(isHA);
  };

  return (
    <>
      <span className='label-span'>Master nodes</span>
      <div>
        <InputGroup>
          <RadioInput
            id='high-availability'
            label='High availability'
            rootProps={{ className: 'skip-format' }}
            className='skip-format'
            checked={highAvailability}
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
            rootProps={{ className: 'skip-format' }}
            className='skip-format'
            checked={!highAvailability}
            value='false'
            name='high-availability'
            onChange={handleChange(false)}
          />
          <InputSubtitle>
            One master node, placed in an availability zone selected at random.
          </InputSubtitle>
        </InputGroup>
      </div>
    </>
  );
};

MasterNodes.propTypes = {
  highAvailability: PropTypes.bool,
  onChange: PropTypes.func,
};

MasterNodes.defaultProps = {
  highAvailability: false,
};

export default MasterNodes;
