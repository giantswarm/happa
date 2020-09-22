import styled from '@emotion/styled';
import AddKeyPairGenericError from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairGenericError';
import AddKeyPairServiceUnavailableError from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairServiceUnavailableError';
import FlashMessage from 'FlashMessages/FlashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import SlideTransition from 'styles/transitions/SlideTransition';

const StyledFlashMessage = styled(FlashMessage)`
  i.fa + span {
    margin-left: 0.5em;
  }
`;

const getErrorMarkup = (
  code: PropertiesOf<typeof StatusCodes> | null
): React.ReactNode => {
  let markup: React.ReactNode = null;

  switch (code) {
    case StatusCodes.ServiceUnavailable:
      markup = <AddKeyPairServiceUnavailableError />;

      break;

    case null:
      markup = null;

      break;

    default:
      markup = <AddKeyPairGenericError />;
  }

  return markup;
};

interface IAddKeyPairErrorProps extends React.ComponentProps<'div'> {
  children?: number | null;
}

const AddKeyPairErrorTemplate: React.FC<IAddKeyPairErrorProps> = ({
  children,
  ...rest
}) => {
  return (
    <SlideTransition direction='down' in={children !== null}>
      <StyledFlashMessage type='danger' {...(rest as never)}>
        {getErrorMarkup(children as PropertiesOf<typeof StatusCodes>)}
      </StyledFlashMessage>
    </SlideTransition>
  );
};

AddKeyPairErrorTemplate.propTypes = {
  children: PropTypes.number,
};

AddKeyPairErrorTemplate.defaultProps = {
  children: null,
};

export default AddKeyPairErrorTemplate;
