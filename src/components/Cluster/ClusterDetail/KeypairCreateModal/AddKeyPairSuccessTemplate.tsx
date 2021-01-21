import DownloadKubeconfigButton from 'Cluster/ClusterDetail/KeypairCreateModal/DownloadKubeconfigButton';
import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

const CLIPBOARD_RESET_TIME = 500;

const StyledTextBox = styled.textarea`
  height: 300px;
  font-family: 'Inconsolata';
  background-color: #333333;
  padding: 9px 13px;
  border-radius: 10px;
  position: relative;
  transition: background-color 0.02s linear;
  border: none;
  line-height: initial;
  padding-right: 55px;
  overflow: visible;
`;

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

      <StyledTextBox readOnly value={kubeconfig} title='kubeconfig' />

      {hasContentInClipboard ? (
        <Button bsStyle='default' onClick={copyKubeconfig}>
          &nbsp;&nbsp;
          <i
            aria-hidden='true'
            className='fa fa-done'
            title='Content copied to clipboard'
          />
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
