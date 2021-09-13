import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';

const PKILabel = styled.span`
  text-decoration: underline;
  font-weight: 700;
`;

interface IAddKeyPairServiceUnavailableErrorTemplateProps {}

const AddKeyPairServiceUnavailableError: React.FC<IAddKeyPairServiceUnavailableErrorTemplateProps> =
  () => {
    return (
      <>
        <i className='fa fa-warning' />
        <span>Could not create the key pair. The </span>
        <OverlayTrigger
          overlay={<Tooltip id='tooltip'>Public Key Infrastructure</Tooltip>}
          placement='top'
        >
          <PKILabel>PKI</PKILabel>
        </OverlayTrigger>{' '}
        <span>backend is not yet available. Please try again in a moment.</span>
      </>
    );
  };

export default AddKeyPairServiceUnavailableError;
