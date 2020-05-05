import styled from '@emotion/styled';
import React from 'react';

const Text = styled.p`
  margin: 0;
`;

interface IAddKeyPairFailureTemplateProps {}

const AddKeyPairGenericError: React.FC<IAddKeyPairFailureTemplateProps> = () => {
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

AddKeyPairGenericError.propTypes = {};

export default AddKeyPairGenericError;
