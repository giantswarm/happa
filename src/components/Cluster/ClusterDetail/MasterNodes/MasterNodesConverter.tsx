import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';

const Strong = styled.strong`
  font-weight: 700;
`;

const ButtonWrapper = styled.div`
  margin: 16px 0 8px;
`;

interface IMasterNodeConverterProps
  extends React.ComponentPropsWithoutRef<'div'> {
  onApply?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MasterNodeConverter: React.FC<IMasterNodeConverterProps> = ({
  onApply,
  onCancel,
  isLoading,
  ...rest
}) => {
  const handleEventListener = (
    callback?: () => void
  ): ((e: React.MouseEvent<HTMLButtonElement>) => void) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // eslint-disable-next-line no-unused-expressions
      callback?.();
    };
  };

  return (
    <div {...rest}>
      <p>
        <Strong>
          Do you want to convert this cluster to use three instead of one master
          nodes?
        </Strong>
      </p>
      <p>
        This will improve the cluster&rsquo;s resilience against data center
        failures and keep the Kubernetes API available during upgrades, and will
        also increase the resource cost.
      </p>
      <p>
        <Strong>Note:</Strong> there is no way to undo this switch.
      </p>
      <ButtonWrapper>
        <Button
          bsStyle='primary'
          loading={isLoading}
          loadingTimeout={0}
          onClick={handleEventListener(onApply)}
        >
          Switch to high availability
        </Button>
        <Button onClick={handleEventListener(onCancel)}>Cancel</Button>
      </ButtonWrapper>
    </div>
  );
};

MasterNodeConverter.propTypes = {
  onApply: PropTypes.func,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool,
};

MasterNodeConverter.defaultProps = {
  isLoading: false,
};

export default MasterNodeConverter;
