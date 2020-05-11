import styled from '@emotion/styled';
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
import useDebounce from 'lib/effects/useDebounce';
import { dedent, makeKubeConfigTextFile } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { Providers, StatusCodes } from 'shared';
import { Constants } from 'shared/constants';
import { IKeyPair, PropertiesOf } from 'shared/types';
import Button from 'UI/Button';

const StyledModal = styled(BootstrapModal)`
  .modal-dialog {
    width: 95%;
    max-width: 700px;
  }

  .checkbox-label {
    display: inline;
    margin-left: 10px;
  }
`;

interface IKeyPairCreateModalProps {
  user: Record<string, never>;
  actions: Record<string, (...args: never[]) => Promise<never>>;
  cluster: Record<string, never>;
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
    e: React.FormEvent<HTMLFormElement>
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
        } as never
      );
      setKubeconfig(
        dedent(makeKubeConfigTextFile(props.cluster, keypair, useInternalAPI))
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
      <Button bsStyle='default' className='small' onClick={show}>
        <i className='fa fa-add-circle' /> Create Key Pair and Kubeconfig
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
            {modal.status !== KeypairCreateModalStatus.Success && (
              <Button
                bsStyle='primary'
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
              <Button bsStyle='link' onClick={close}>
                {closeButtonText}
              </Button>
            )}
          </BootstrapModal.Footer>
        </form>
      </StyledModal>
    </>
  );
};

KeyPairCreateModal.propTypes = {
  // @ts-ignore
  user: PropTypes.object.isRequired,
  // @ts-ignore
  actions: PropTypes.object.isRequired,
  // @ts-ignore
  cluster: PropTypes.object.isRequired,
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
};

export default KeyPairCreateModal;
