import AddKeyPairGenericError from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairGenericError';
import AddKeyPairServiceUnavailableError from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairServiceUnavailableError';
import { StatusCodes } from 'model/constants';
import React from 'react';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import SlideTransition from 'styles/transitions/SlideTransition';
import FlashMessage from 'UI/Display/FlashMessage';

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

const AddKeyPairErrorTemplate: React.FC<
  React.PropsWithChildren<IAddKeyPairErrorProps>
> = ({ children, ...rest }) => {
  return (
    <SlideTransition direction='down' in={children !== null}>
      <StyledFlashMessage type={FlashMessageType.Danger} {...rest}>
        {getErrorMarkup(children as PropertiesOf<typeof StatusCodes>)}
      </StyledFlashMessage>
    </SlideTransition>
  );
};

AddKeyPairErrorTemplate.defaultProps = {
  children: null,
};

export default AddKeyPairErrorTemplate;
