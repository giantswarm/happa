import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const PKILabel = styled.span`
  text-decoration: underline;
  font-weight: 700;
`;

interface IAddKeyPairServiceUnavailableErrorTemplateProps {}

const AddKeyPairServiceUnavailableError: React.FC<
  React.PropsWithChildren<IAddKeyPairServiceUnavailableErrorTemplateProps>
> = () => {
  return (
    <>
      <i className='fa fa-warning' />
      <span>Could not create the key pair. The </span>
      <TooltipContainer content={<Tooltip>Public Key Infrastructure</Tooltip>}>
        <PKILabel>PKI</PKILabel>
      </TooltipContainer>{' '}
      <span>backend is not yet available. Please try again in a moment.</span>
    </>
  );
};

export default AddKeyPairServiceUnavailableError;
