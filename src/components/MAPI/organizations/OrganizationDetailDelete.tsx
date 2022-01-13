import { push } from 'connected-react-router';
import { Box, Text } from 'grommet';
import { extractErrorMessage } from 'MAPI/utils';
import { OrganizationsRoutes } from 'model/constants/routes';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';

interface IOrganizationDetailDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  organizationName: string;
  organizationNamespace: string;
  onDelete: () => Promise<void>;
  canDeleteOrganizations?: boolean;
  clusterCount?: number;
}

const OrganizationDetailDelete: React.FC<IOrganizationDetailDeleteProps> = ({
  organizationName,
  organizationNamespace,
  onDelete,
  canDeleteOrganizations,
  clusterCount,
  ...props
}) => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

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
    } catch (err) {
      const message = extractErrorMessage(err);

      setIsLoading(false);

      new FlashMessage(
        `Could not delete organization ${organizationName}:`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );

      ErrorReporter.getInstance().notify(err as Error);
    }
  };

  const canDelete = typeof clusterCount === 'undefined' || clusterCount < 1;

  return (
    <Box direction='row' pad={{ top: 'medium' }} {...props}>
      <Box direction='column' gap='medium'>
        <Text weight='bold' size='large' margin='none'>
          Delete this organization
        </Text>
        <Box width={canDeleteOrganizations ? 'large' : 'x-large'}>
          {typeof canDeleteOrganizations !== 'undefined' &&
            !canDeleteOrganizations && (
              <Text>
                For deleting this organization, you need additional permissions.
                Please talk to your administrator.
              </Text>
            )}

          {canDeleteOrganizations && typeof clusterCount === 'undefined' && (
            <Text key='org-deletion-disclaimer'>
              <i
                className='fa fa-warning'
                aria-hidden={true}
                role='presentation'
              />{' '}
              In case there are any clusters associated with this organization,
              please delete them first. Otherwise, you will lose them when
              deleting the organization.
            </Text>
          )}

          {canDeleteOrganizations &&
            typeof clusterCount !== 'undefined' &&
            clusterCount > 0 && (
              <Text key='org-deletion-disclaimer'>
                To delete this organization, there must not be any clusters
                associated with it. Please delete the clusters first.
              </Text>
            )}

          {canDeleteOrganizations &&
            typeof clusterCount !== 'undefined' &&
            clusterCount < 1 && (
              <Text key='org-deletion-disclaimer'>
                The <code>{organizationName}</code> Organization CR and the
                namespace <code>{organizationNamespace}</code> with all the
                resources in it will be deleted from the management cluster.
                There is no way to undo this action.
              </Text>
            )}
        </Box>
        <Box>
          <ConfirmationPrompt
            open={confirmationVisible}
            onConfirm={handleDelete}
            onCancel={hideConfirmation}
            confirmButton={
              <Button danger={true} onClick={handleDelete}>
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
                danger={true}
                onClick={showConfirmation}
                loading={isLoading}
                unauthorized={
                  typeof canDeleteOrganizations !== 'undefined' &&
                  !canDeleteOrganizations
                }
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

export default OrganizationDetailDelete;
