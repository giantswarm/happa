import React from 'react';
import styled from 'styled-components';

const Text = styled.p`
  margin: 0;
`;

interface IAddKeyPairFailureTemplateProps {}

const AddKeyPairGenericError: React.FC<
  React.PropsWithChildren<IAddKeyPairFailureTemplateProps>
> = () => {
  return (
    <>
      <Text>
        <i className='fa fa-warning' />
        <span>Something went wrong while trying to create your key pair.</span>
      </Text>
      <Text>
        Perhaps our servers are down, please try again later or contact support:
        support@giantswarm.io
      </Text>
    </>
  );
};

export default AddKeyPairGenericError;
