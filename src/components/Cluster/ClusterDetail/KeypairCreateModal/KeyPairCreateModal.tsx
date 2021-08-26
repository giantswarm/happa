import AddKeyPairErrorTemplate from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairErrorTemplate';
import AddKeyPairSuccessTemplate from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairSuccessTemplate';
import AddKeyPairTemplate from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairTemplate';
import {
  cnPrefixValidation,
  getDefaultDescription,
  getModalCloseButtonText,
  getModalTitle,
  getSubmitButtonText,
  KeypairCreateModalStatus,
  MODAL_CHANGE_TIMEOUT,
  VALIDATION_DEBOUNCE_RATE,
} from 'Cluster/ClusterDetail/KeypairCreateModal/Utils';
import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { makeKubeConfigTextFile } from 'lib/helpers';
import useDebounce from 'lib/hooks/useDebounce';
import React, { useEffect, useState } from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { Providers, StatusCodes } from 'shared/constants';
import { Constants } from 'shared/constants';
import { IKeyPair, PropertiesOf } from 'shared/types';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

const StyledModal = styled(BootstrapModal)`
  .modal-dialog {
    width: 95%;
    max-width: 700px;
  }
`;

interface IKeyPairCreateModalProps {
  user: IUser;
  actions: Record<string, (...args: unknown[]) => Promise<never>>;
  cluster: Cluster;
  provider: PropertiesOf<typeof Providers>;
}

const KeyPairCreateModal: React.FC<IKeyPairCreateModalProps> = (props) => {
  const [expireTTL, setExpireTTL] = useState(Constants.KEYPAIR_DEFAULT_TTL);
  const [description, setDescription] = useState(
    getDefaultDescription(props.user.email)
  );
  const [useInternalAPI, setUseInternalAPI] = useState(false);
  const [kubeconfig, setKubeconfig] = useState('');
  const [cnPrefix, setCNPrefix] = useState('');
  const [cnPrefixError, setCNPrefixError] = useState<string | null>(null);
  const [certificateOrganizations, setCertificateOrganizations] = useState('');
  const [modal, setModal] = useState<{
    visible: boolean;
    loading: boolean;
    errorCode: number | null;
    status: KeypairCreateModalStatus;
  }>({
    visible: false,
    loading: false,
    errorCode: null,
    status: KeypairCreateModalStatus.Adding,
  });

  const confirmAddKeyPair = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLElement>
  ): Promise<void> => {
    e.preventDefault();

    setModal({
      visible: true,
      loading: true,
      errorCode: null,
      status: KeypairCreateModalStatus.Adding,
    });
    try {
      const keypair: IKeyPair = await props.actions.clusterCreateKeyPair(
        props.cluster.id,
        {
          certificate_organizations: certificateOrganizations,
          cn_prefix: cnPrefix,
          description: description,
          ttl_hours: expireTTL,
        }
      );
      setKubeconfig(
        makeKubeConfigTextFile(props.cluster, keypair, useInternalAPI)
      );
      setModal({
        visible: true,
        loading: false,
        errorCode: null,
        status: KeypairCreateModalStatus.Success,
      });

      await props.actions.clusterLoadKeyPairs(props.cluster.id);
    } catch (err) {
      setTimeout(() => {
        setModal({
          visible: true,
          loading: false,
          errorCode: err.status ?? StatusCodes.InternalServerError,
          status: KeypairCreateModalStatus.Adding,
        });
      }, MODAL_CHANGE_TIMEOUT);

      ErrorReporter.getInstance().notify(err);
    }
  };

  const close = () => {
    setExpireTTL(Constants.KEYPAIR_DEFAULT_TTL);
    setCNPrefix('');
    setCertificateOrganizations('');
    setDescription(getDefaultDescription(props.user.email));
    setModal({
      visible: false,
      loading: false,
      errorCode: modal.errorCode,
      status: modal.status,
    });
  };

  const cnPrefixDebounced = useDebounce(cnPrefix, VALIDATION_DEBOUNCE_RATE);
  useEffect(
    () => {
      // Make sure we have a value (user has entered something in input)
      if (cnPrefixDebounced) {
        const error = cnPrefixValidation(cnPrefixDebounced);
        setCNPrefixError(error);
      }
    },
    // This is the useEffect input array
    // Our useEffect function will only execute if this value changes.
    // and thanks to our hook (useDebounce) it will only change if the original
    // value (cnPrefixValidation) hasn't changed for more than 500ms.
    [cnPrefixDebounced]
  );

  const handleCNPrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (cnPrefixError) {
      setCNPrefix(inputValue);
      const error = cnPrefixValidation(inputValue);
      setCNPrefixError(error);
    } else {
      setCNPrefix(inputValue);
    }
  };

  const handleCertificateOrganizationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCertificateOrganizations(e.target.value);
  };

  const handleTTLChange = (ttl: number) => {
    setExpireTTL(ttl);
  };

  const handleUseInternalAPIChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUseInternalAPI(e.target.checked);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const show = () => {
    setModal({
      visible: true,
      loading: false,
      errorCode: null,
      status: KeypairCreateModalStatus.Adding,
    });
  };

  const title = getModalTitle(modal.status);
  const closeButtonText = getModalCloseButtonText(modal.status);
  const submitButtonText = getSubmitButtonText(
    modal.loading,
    modal.errorCode !== null
  );

  return (
    <>
      <Button onClick={show} icon={<i className='fa fa-add-circle' />}>
        Create key pair and kubeconfig
      </Button>
      <StyledModal
        data-testid='create-key-pair-modal'
        onHide={close}
        show={modal.visible}
      >
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>{title}</BootstrapModal.Title>
        </BootstrapModal.Header>
        <form onSubmit={confirmAddKeyPair}>
          <BootstrapModal.Body>
            {modal.status === KeypairCreateModalStatus.Success ? (
              <AddKeyPairSuccessTemplate kubeconfig={kubeconfig} />
            ) : (
              <AddKeyPairTemplate
                email={props.user.email}
                provider={props.provider}
                cnPrefix={cnPrefix}
                cnPrefixError={cnPrefixError}
                handleCNPrefixChange={handleCNPrefixChange}
                certificateOrganizations={certificateOrganizations}
                handleCertificateOrganizationsChange={
                  handleCertificateOrganizationsChange
                }
                description={description}
                handleDescriptionChange={handleDescriptionChange}
                expireTTL={expireTTL}
                handleTTLChange={handleTTLChange}
                useInternalAPI={useInternalAPI}
                handleUseInternalAPIChange={handleUseInternalAPIChange}
                ingressBaseDomain={window.config.ingressBaseDomain}
              />
            )}

            <AddKeyPairErrorTemplate>{modal.errorCode}</AddKeyPairErrorTemplate>
          </BootstrapModal.Body>
          <BootstrapModal.Footer data-testid='create-key-pair-modal-footer'>
            <Box direction='row' gap='small' justify='end'>
              {modal.status !== KeypairCreateModalStatus.Success && (
                <Button
                  primary={true}
                  disabled={cnPrefixError !== null}
                  loading={modal.loading}
                  onClick={confirmAddKeyPair}
                  type='submit'
                  loadingTimeout={0}
                >
                  {submitButtonText}
                </Button>
              )}

              {!modal.loading && (
                <Button link={true} onClick={close}>
                  {closeButtonText}
                </Button>
              )}
            </Box>
          </BootstrapModal.Footer>
        </form>
      </StyledModal>
    </>
  );
};

export default KeyPairCreateModal;
