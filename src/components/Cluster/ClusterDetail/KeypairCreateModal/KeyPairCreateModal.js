import AddKeyPairTemplate from 'Cluster/ClusterDetail/KeypairCreateModal/AddKeyPairTemplate';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import useDebounce from 'lib/effects/useDebounce';
import { dedent, makeKubeConfigTextFile } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { Constants } from 'shared/constants';
import Button from 'UI/Button';

const KeyPairCreateModal = (props) => {
  const defaultDescription = (email) => {
    return `Added by user ${email} using Happa web interface`;
  };

  const [expireTTL, setExpireTTL] = useState(Constants.KEYPAIR_DEFAULT_TTL);
  const [description, setDescription] = useState(
    defaultDescription(props.user.email)
  );
  const [useInternalAPI, setUseInternalAPI] = useState(false);
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();
  const [kubeconfig, setKubeconfig] = useState(false);
  const [cnPrefix, setCNPrefix] = useState('');
  const [cnPrefixError, setCNPrefixError] = useState(null);
  const [certificateOrganizations, setCertificateOrganizations] = useState('');
  const [modal, setModal] = useState({
    visible: false,
    loading: false,
    template: 'addKeyPair',
  });

  const blob = () => {
    const kubeConfigBlob = new Blob([kubeconfig], {
      type: 'application/plain;charset=utf-8',
    });

    return kubeConfigBlob;
  };

  const copyKubeConfig = (e) => {
    e.preventDefault();

    const clipboardResetTime = 500;

    setClipboardContent(kubeconfig);
    setTimeout(() => {
      setClipboardContent(null);
    }, clipboardResetTime);
  };

  const confirmAddKeyPair = (e) => {
    e.preventDefault();

    if (modal.template !== 'addKeyPair') return;

    setModal({
      visible: true,
      loading: true,
      template: 'addKeyPair',
    });
    props.actions
      .clusterCreateKeyPair(props.cluster.id, {
        certificate_organizations: certificateOrganizations,
        cn_prefix: cnPrefix,
        description: description,
        ttl_hours: expireTTL,
      })
      .then((keypair) => {
        setKubeconfig(
          dedent(makeKubeConfigTextFile(props.cluster, keypair, useInternalAPI))
        );
        setModal({
          visible: true,
          loading: false,
          template: 'addKeyPairSuccess',
        });

        return props.actions.clusterLoadKeyPairs(props.cluster.id);
      })
      .catch((error) => {
        const modalChangeTimeout = 200;

        // eslint-disable-next-line no-console
        console.error(error);

        setTimeout(() => {
          setModal({
            visible: true,
            loading: false,
            template: 'addKeyPairFailure',
          });
        }, modalChangeTimeout);
      });
  };

  // eslint-disable-next-line react/no-multi-comp
  const downloadAsFileLink = () => {
    return (
      <a
        className='btn btn-default'
        download='giantswarm-kubeconfig'
        href={window.URL.createObjectURL(blob())}
      >
        Download
      </a>
    );
  };

  const close = () => {
    setExpireTTL(Constants.KEYPAIR_DEFAULT_TTL);
    setCNPrefix('');
    setCertificateOrganizations('');
    setDescription(defaultDescription(props.user.email));
    setModal({
      visible: false,
      loading: false,
      template: modal.template,
    });
  };

  const cnPrefixValidation = (value) => {
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

  const handleCNPrefixChange = (e) => {
    const inputValue = e.target.value;

    if (cnPrefixError) {
      setCNPrefix(inputValue);
      cnPrefixValidation(inputValue);
    } else {
      setCNPrefix(inputValue);
    }
  };

  const handleCertificateOrganizationsChange = (e) => {
    setCertificateOrganizations(e.target.value);
  };

  const handleTTLChange = (ttl) => {
    setExpireTTL(ttl);
  };

  const handleUseInternalAPIChange = (event) => {
    setUseInternalAPI(event.target.checked);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const show = () => {
    setModal({
      visible: true,
      loading: false,
      template: 'addKeyPair',
    });
  };

  let title = '';
  let closeButtonText = '';
  switch (modal.template) {
    case 'addKeyPairSuccess':
      title = 'Your key pair and kubeconfig has been created.';
      closeButtonText = 'Close';
      break;

    case 'addKeyPairFailure':
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
                case 'addKeyPair':
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

                case 'addKeyPairSuccess':
                  return (
                    <>
                      <p>
                        Copy the text below and save it to a text file named
                        kubeconfig on your local machine. Caution: You
                        won&apos;t see the key and certificate again!
                      </p>
                      <p>
                        <b>Important:</b> Make sure that only you have access to
                        this file, as it enables for complete administrative
                        access to your cluster.
                      </p>

                      <textarea readOnly value={kubeconfig} />

                      {hasContentInClipboard ? (
                        <Button bsStyle='default' onClick={copyKubeConfig}>
                          &nbsp;&nbsp;
                          <i aria-hidden='true' className='fa fa-done' />
                          &nbsp;&nbsp;
                        </Button>
                      ) : (
                        <Button bsStyle='default' onClick={copyKubeConfig}>
                          Copy
                        </Button>
                      )}

                      {downloadAsFileLink()}
                    </>
                  );

                case 'addKeyPairFailure':
                  return (
                    <>
                      <p>
                        Something went wrong while trying to create your key
                        pair.
                      </p>
                      <p>
                        Perhaps our servers are down, please try again later or
                        contact support: support@giantswarm.io
                      </p>
                    </>
                  );
              }

              return null;
            })()}
          </BootstrapModal.Body>
          <BootstrapModal.Footer data-testid='create-key-pair-modal-footer'>
            {modal.template === 'addKeyPair' && (
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
  user: PropTypes.object,
  actions: PropTypes.object,
  cluster: PropTypes.object,
  provider: PropTypes.string,
  show: PropTypes.func,
};

export default KeyPairCreateModal;
