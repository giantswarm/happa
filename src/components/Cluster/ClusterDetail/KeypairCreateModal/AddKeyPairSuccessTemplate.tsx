import DownloadKubeconfigButton from 'Cluster/ClusterDetail/KeypairCreateModal/DownloadKubeconfigButton';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';

const CLIPBOARD_RESET_TIME = 500;

interface IAddKeyPairSuccessTemplateProps {
  kubeconfig: string;
}

const AddKeyPairSuccessTemplate: React.FC<IAddKeyPairSuccessTemplateProps> = ({
  kubeconfig,
}) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const copyKubeconfig = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setClipboardContent(kubeconfig);
    setTimeout(() => {
      setClipboardContent(null);
    }, CLIPBOARD_RESET_TIME);
  };

  return (
    <>
      <p>
        Copy the text below and save it to a text file named kubeconfig on your
        local machine. Caution: You won&apos;t see the key and certificate
        again!
      </p>
      <p>
        <b>Important:</b> Make sure that only you have access to this file, as
        it enables for complete administrative access to your cluster.
      </p>

      <textarea readOnly value={kubeconfig} />

      {hasContentInClipboard ? (
        <Button bsStyle='default' onClick={copyKubeconfig}>
          &nbsp;&nbsp;
          <i aria-hidden='true' className='fa fa-done' />
          &nbsp;&nbsp;
        </Button>
      ) : (
        <Button bsStyle='default' onClick={copyKubeconfig}>
          Copy
        </Button>
      )}

      <DownloadKubeconfigButton content={kubeconfig} />
    </>
  );
};

AddKeyPairSuccessTemplate.propTypes = {
  kubeconfig: PropTypes.string.isRequired,
};

export default AddKeyPairSuccessTemplate;
