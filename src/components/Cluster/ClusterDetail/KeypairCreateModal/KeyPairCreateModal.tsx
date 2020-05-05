import AddKeyPairFailureTemplate from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairFailureTemplate';
import AddKeyPairSuccessTemplate from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairSuccessTemplate';
import AddKeyPairTemplate from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairTemplate';
import useDebounce from 'lib/effects/useDebounce';
import { dedent, makeKubeConfigTextFile } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { Providers } from 'shared';
import { Constants } from 'shared/constants';
import { IKeyPair, PropertiesOf } from 'shared/types';
import Button from 'UI/Button';

const getDefaultDescription = (email: string): string => {
  return `Added by user ${email} using Happa web interface`;
};

enum KeypairCreateModalTemplates {
  Add,
  Success,
  Failure,
}

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
    template: KeypairCreateModalTemplates;
  }>({
    visible: false,
    loading: false,
    template: KeypairCreateModalTemplates.Add,
  });

  const confirmAddKeyPair = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (modal.template !== KeypairCreateModalTemplates.Add) return;

    setModal({
      visible: true,
      loading: true,
      template: KeypairCreateModalTemplates.Add,
    });
    props.actions
      .clusterCreateKeyPair(props.cluster.id, {
        certificate_organizations: certificateOrganizations,
        cn_prefix: cnPrefix,
        description: description,
        ttl_hours: expireTTL,
      } as never)
      .then((keypair: IKeyPair) => {
        setKubeconfig(
          dedent(makeKubeConfigTextFile(props.cluster, keypair, useInternalAPI))
        );
        setModal({
          visible: true,
          loading: false,
          template: KeypairCreateModalTemplates.Success,
        });

        return props.actions.clusterLoadKeyPairs(props.cluster.id);
      })
      .catch((error: Error) => {
        const modalChangeTimeout = 200;

        // eslint-disable-next-line no-console
        console.error(error);

        setTimeout(() => {
          setModal({
            visible: true,
            loading: false,
            template: KeypairCreateModalTemplates.Failure,
          });
        }, modalChangeTimeout);
      });
  };

  const close = () => {
    setExpireTTL(Constants.KEYPAIR_DEFAULT_TTL);
    setCNPrefix('');
    setCertificateOrganizations('');
    setDescription(getDefaultDescription(props.user.email));
    setModal({
      visible: false,
      loading: false,
      template: modal.template,
    });
  };

  const cnPrefixValidation = (value: string) => {
    let error = null;
    if (value !== '') {
      const endRegex = /[a-zA-Z0-9]$/g;
      const regex = /^[a-zA-Z0-9][a-zA-Z0-9@.-]*$/g;
      if (!endRegex.test(value)) {
        error = 'The CN prefix must end with a-z, A-Z, 0-9';
      } else if (!regex.test(value)) {
        error = 'The CN prefix must contain only a-z, A-Z, 0-9 or -';
      }
    }

    setCNPrefixError(error);
  };

  const debounceRateTime = 1000;
  const cnPrefixDebounced = useDebounce(cnPrefix, debounceRateTime);
  useEffect(
    () => {
      // Make sure we have a value (user has entered something in input)
      if (cnPrefixDebounced) {
        cnPrefixValidation(cnPrefixDebounced);
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
      cnPrefixValidation(inputValue);
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
      template: KeypairCreateModalTemplates.Add,
    });
  };

  let title = '';
  let closeButtonText = '';
  switch (modal.template) {
    case KeypairCreateModalTemplates.Success:
      title = 'Your key pair and kubeconfig has been created.';
      closeButtonText = 'Close';
      break;

    case KeypairCreateModalTemplates.Failure:
      title = 'Could not create key pair.';
      closeButtonText = 'Close';
      break;

    default:
      title = 'Create New Key Pair and Kubeconfig';
      closeButtonText = 'Cancel';
  }

  return (
    <>
      <Button bsStyle='default' className='small' onClick={show}>
        <i className='fa fa-add-circle' /> Create Key Pair and Kubeconfig
      </Button>
      <BootstrapModal
        data-testid='create-key-pair-modal'
        className='create-key-pair-modal'
        onHide={close}
        show={modal.visible}
      >
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>{title}</BootstrapModal.Title>
        </BootstrapModal.Header>
        <form onSubmit={confirmAddKeyPair}>
          <BootstrapModal.Body>
            {(() => {
              switch (modal.template) {
                case KeypairCreateModalTemplates.Add:
                  return (
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
                  );

                case KeypairCreateModalTemplates.Success:
                  return <AddKeyPairSuccessTemplate kubeconfig={kubeconfig} />;

                case KeypairCreateModalTemplates.Failure:
                  return <AddKeyPairFailureTemplate />;
              }

              return null;
            })()}
          </BootstrapModal.Body>
          <BootstrapModal.Footer data-testid='create-key-pair-modal-footer'>
            {modal.template === KeypairCreateModalTemplates.Add && (
              <Button
                bsStyle='primary'
                disabled={cnPrefixError !== null}
                loading={modal.loading}
                onClick={confirmAddKeyPair}
                type='submit'
              >
                {modal.loading ? 'Creating Key Pair' : 'Create Key Pair'}
              </Button>
            )}

            {!modal.loading && (
              <Button bsStyle='link' onClick={close}>
                {closeButtonText}
              </Button>
            )}
          </BootstrapModal.Footer>
        </form>
      </BootstrapModal>
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
