import { push } from 'connected-react-router';
import { Box, Drop, Heading, Keyboard, Text } from 'grommet';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import Button from 'UI/Controls/Button';

import { getOrgNamespaceFromOrgName } from './utils';

interface IOrganizationDetailDeleteProps {
  organizationName: string;
  onDelete: () => Promise<void>;
}

const OrganizationDetailDelete: React.FC<IOrganizationDetailDeleteProps> = ({
  organizationName,
  onDelete,
}) => {
  const organizationNamespace = getOrgNamespaceFromOrgName(organizationName);
  const deleteButtonRef = useRef<HTMLElement>(null);

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const showConfirmation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    setConfirmationVisible(true);
  };

  const hideConfirmation = (
    e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => {
    e?.preventDefault();

    window.setTimeout(() => {
      setConfirmationVisible(false);
    });
  };

  const handleDelete = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setConfirmationVisible(false);

    try {
      await onDelete();

      new FlashMessage(
        `Organization <code>${organizationName}</code> deleted successfully.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );

      dispatch(push(OrganizationsRoutes.List));
    } catch (err: unknown) {
      const message = (err as Error).message;

      new FlashMessage(
        `Could not delete organization ${organizationName}:`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
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
        Delete Organization
      </Button>

      {confirmationVisible && deleteButtonRef.current && (
        <Keyboard onEsc={hideConfirmation}>
          <Drop
            align={{ bottom: 'top', left: 'left' }}
            target={deleteButtonRef.current}
            plain={true}
            trapFocus={true}
          >
            <Box
              background='background-front'
              pad='medium'
              round='small'
              width='large'
              direction='column'
              gap='small'
              border={{ color: 'text-xweak' }}
            >
              <Box>
                <Heading level={4} margin={{ top: 'none' }}>
                  Are you sure?
                </Heading>
                <Text>
                  Deleting <code>{organizationName}</code> implies deleting the{' '}
                  <code>{organizationNamespace}</code> namespace. This means
                  that all the resources in this namespace will be also deleted.
                </Text>
              </Box>
              <Box direction='row' margin={{ top: 'small' }}>
                <Button bsStyle='danger' onClick={handleDelete}>
                  Yes, delete it
                </Button>
                <Button bsStyle='link' onClick={hideConfirmation}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Drop>
        </Keyboard>
      )}
    </Box>
  );
};

OrganizationDetailDelete.propTypes = {
  organizationName: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default OrganizationDetailDelete;
