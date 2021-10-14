import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Collapsible, Heading, Keyboard, Text } from 'grommet';
import * as docs from 'lib/docs';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import useDebounce from 'lib/hooks/useDebounce';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { extractErrorMessage } from 'MAPI/utils';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { organizationsLoadMAPI } from 'stores/organization/actions';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';

import {
  OrganizationNameStatusMessage,
  validateOrganizationName,
} from './utils';

const VALIDATION_ERROR_DEBOUNCE_RATE = 500;

interface IOrganizationListCreateOrgProps
  extends React.ComponentPropsWithoutRef<typeof Collapsible> {
  onSubmit?: () => void;
  onCancel?: () => void;
}

const OrganizationListCreateOrg: React.FC<IOrganizationListCreateOrgProps> = ({
  onSubmit,
  onCancel,
  open,
  ...props
}) => {
  const [orgName, setOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [hasTyped, setHasTyped] = useState(false);

  const validationMessage = useMemo(() => {
    if (!hasTyped) return OrganizationNameStatusMessage.Ok;

    return validateOrganizationName(orgName).statusMessage;
  }, [hasTyped, orgName]);

  const debouncedValidationMessage = useDebounce(
    validationMessage,
    VALIDATION_ERROR_DEBOUNCE_RATE
  );
  const isValid = validationMessage.length < 1;

  const resetForm = () => {
    setHasTyped(false);
    setIsCreating(false);
    setOrgName('');
  };

  const onChangeOrgName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasTyped) {
      setHasTyped(true);
    }

    setOrgName(e.target.value);
  };

  const handleCancel = () => {
    onCancel?.();

    setTimeout(() => {
      resetForm();
      // eslint-disable-next-line no-magic-numbers
    }, 200);
  };

  const client = useHttpClient();
  const auth = useAuthProvider();

  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    if (!isValid) return;

    setIsCreating(true);

    try {
      await securityv1alpha1.createOrganization(client, auth, orgName);
      dispatch(organizationsLoadMAPI(auth));

      onSubmit?.();

      new FlashMessage(
        (
          <>
            Organization <code>{orgName}</code> created successfully
          </>
        ),
        messageType.SUCCESS,
        messageTTL.SHORT
      );

      setTimeout(() => {
        resetForm();
        // eslint-disable-next-line no-magic-numbers
      }, 200);
    } catch (err) {
      onCancel?.();

      new FlashMessage(
        (
          <>
            Unable to create organization <code>{orgName}</code>
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(err)
      );

      ErrorReporter.getInstance().notify(err as Error);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  return (
    <Collapsible open={open} {...props}>
      <Keyboard onEsc={handleCancel}>
        <Box background='background-back' pad='large' round='xsmall'>
          <Box margin={{ bottom: 'medium' }}>
            <Heading level={2} margin={{ top: 'none' }}>
              Create an organization
            </Heading>
            <Text color='text-weak'>
              This will create a new Organization CR and a namespace in the
              management cluster. Some{' '}
              <a
                href={docs.organizationsNamingConventionsURL}
                rel='noopener noreferrer'
                target='_blank'
              >
                name conventions{' '}
                <i
                  className='fa fa-open-in-new'
                  aria-hidden={true}
                  role='presentation'
                  aria-label='Opens in a new tab'
                />
              </a>{' '}
              apply.
            </Text>
          </Box>
          <Box as='form' width={{ max: 'large' }} onSubmit={handleSubmit}>
            <Box
              margin={{
                bottom: !debouncedValidationMessage ? '28px' : undefined,
              }}
            >
              <TextInput
                ref={inputRef}
                label='Name'
                onChange={onChangeOrgName}
                value={orgName}
                error={debouncedValidationMessage}
                aria-label='Name'
              />
            </Box>
            <Box direction='row' margin={{ top: 'small' }} gap='small'>
              <Button
                primary={true}
                type='submit'
                loading={isCreating}
                disabled={!hasTyped || !isValid}
              >
                Create organization
              </Button>

              {!isCreating && <Button onClick={handleCancel}>Cancel</Button>}
            </Box>
          </Box>
        </Box>
      </Keyboard>
    </Collapsible>
  );
};

export default OrganizationListCreateOrg;
