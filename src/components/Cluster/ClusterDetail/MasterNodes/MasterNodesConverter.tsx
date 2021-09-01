import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

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

      callback?.();
    };
  };

  return (
    <div {...rest}>
      <p>
        <Strong>
          Do you want to convert this cluster to use three control plane nodes
          instead of one?
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
          primary={true}
          loading={isLoading}
          loadingTimeout={0}
          onClick={handleEventListener(onApply)}
        >
          Switch to high availability
        </Button>

        {!isLoading && (
          <Button onClick={handleEventListener(onCancel)}>Cancel</Button>
        )}
      </ButtonWrapper>
    </div>
  );
};

MasterNodeConverter.defaultProps = {
  isLoading: false,
};

export default MasterNodeConverter;
