import PropTypes from 'prop-types';
import React from 'react';

interface IDownloadKubeconfigButtonProps {
  content?: string;
}

const getBlob = (fromText: string): Blob => {
  const blob = new Blob([fromText], {
    type: 'application/plain;charset=utf-8',
  });

  return blob;
};

const DownloadKubeconfigButton: React.FC<IDownloadKubeconfigButtonProps> = ({
  content,
}) => {
  return (
    <a
      className='btn btn-default'
      download='giantswarm-kubeconfig'
      // Safe because of defaultProps.
      href={window.URL.createObjectURL(getBlob(content as string))}
    >
      Download
    </a>
  );
};

DownloadKubeconfigButton.propTypes = {
  content: PropTypes.string,
};

DownloadKubeconfigButton.defaultProps = {
  content: '',
};

export default DownloadKubeconfigButton;
