import React from 'react';

interface IAddKeyPairFailureTemplateProps {}

const AddKeyPairFailureTemplate: React.FC<IAddKeyPairFailureTemplateProps> = () => {
  return (
    <>
      <p>Something went wrong while trying to create your key pair.</p>
      <p>
        Perhaps our servers are down, please try again later or contact support:
        support@giantswarm.io
      </p>
    </>
  );
};

AddKeyPairFailureTemplate.propTypes = {};

export default AddKeyPairFailureTemplate;
