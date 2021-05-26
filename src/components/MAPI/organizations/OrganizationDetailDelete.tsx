import { push } from 'connected-react-router';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';

interface IOrganizationDetailDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  organizationName: string;
  organizationNamespace: string;
  onDelete: () => Promise<void>;
  clusterCount?: number;
}

const OrganizationDetailDelete: React.FC<IOrganizationDetailDeleteProps> = ({
  organizationName,
  organizationNamespace,
  onDelete,
  clusterCount,
  ...props
}) => {
  const deleteButtonRef = useRef<HTMLElement>(null);

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const showConfirmation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    setConfirmationVisible(true);
  };

  const hideConfirmation = () => {
    window.setTimeout(() => {
      setConfirmationVisible(false);
    });
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setConfirmationVisible(false);

    try {
      await onDelete();

      setIsLoading(false);

      new FlashMessage(
        `Organization ${organizationName} deleted successfully.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );

      dispatch(push(OrganizationsRoutes.List));
    } catch (err: unknown) {
      const message = (err as Error).message;

      setIsLoading(false);

      new FlashMessage(
        `Could not delete organization ${organizationName}:`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );

      ErrorReporter.getInstance().notify(err as never);
    }
  };

  const canDelete = typeof clusterCount === 'undefined' || clusterCount < 1;

  return (
    <Box direction='row' pad={{ top: 'medium' }} {...props}>
      <Box direction='column' gap='medium'>
        <Text weight='bold' size='large' margin='none'>
          Delete this organization
        </Text>
        <Box width='large'>
          {typeof clusterCount === 'undefined' && (
            <Text key='org-deletion-disclaimer'>
              <i
                className='fa fa-warning'
                aria-hidden={true}
                role='presentation'
              />{' '}
              In case there are any clusters owned by this organization, please
              delete them first. Otherwise, you will lose them when deleting the
              organization.
            </Text>
          )}

          {typeof clusterCount !== 'undefined' && clusterCount > 0 && (
            <Text key='org-deletion-disclaimer'>
              To delete this organization, there must not be any clusters owned
              by it. Please delete the clusters first.
            </Text>
          )}

          {typeof clusterCount !== 'undefined' && clusterCount < 1 && (
            <Text key='org-deletion-disclaimer'>
              The <code>{organizationName}</code> Organization CR and the
              namespace <code>{organizationNamespace}</code> with all the
              resources in it will be deleted from the management cluster. There
              is no way to undo this action.
            </Text>
          )}
        </Box>
        <Box>
          <ConfirmationPrompt
            open={confirmationVisible}
            onConfirm={handleDelete}
            onCancel={hideConfirmation}
            confirmButton={
              <Button bsStyle='danger' onClick={handleDelete}>
                <i
                  className='fa fa-delete'
                  role='presentation'
                  aria-hidden={true}
                  aria-label='Delete'
                />{' '}
                Delete {organizationName}
              </Button>
            }
            title={`Do you really want to delete organization ${organizationName}?`}
          >
            <Text>
              As you might have read in the text above, this means that there is
              no way back.
            </Text>
          </ConfirmationPrompt>

          {canDelete && !confirmationVisible && (
            <Box animation={{ type: 'fadeIn', duration: 300 }}>
              <Button
                ref={deleteButtonRef}
                bsStyle='danger'
                onClick={showConfirmation}
                loading={isLoading}
              >
                <i
                  className='fa fa-delete'
                  role='presentation'
                  aria-hidden={true}
                  aria-label='Delete'
                />{' '}
                Delete organization
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

OrganizationDetailDelete.propTypes = {
  organizationName: PropTypes.string.isRequired,
  organizationNamespace: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  clusterCount: PropTypes.number,
};

export default OrganizationDetailDelete;
