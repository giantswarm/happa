import React from 'react';

interface IAddKeyPairFailureTemplateProps {}

const AddKeyPairGenericError: React.FC<IAddKeyPairFailureTemplateProps> = () => {
  return (
    <>
      <p>
        <i className='fa fa-warning' />
        Something went wrong while trying to create your key pair.
      </p>
      <p>
        Perhaps our servers are down, please try again later or contact support:
        support@giantswarm.io
      </p>
    </>
  );
};

AddKeyPairGenericError.propTypes = {};

export default AddKeyPairGenericError;
