import React from 'react';
import Button from 'UI/Controls/Button';

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
      download='giantswarm-kubeconfig'
      // Safe because of defaultProps.
      href={window.URL.createObjectURL(getBlob(content as string))}
    >
      <Button>Download</Button>
    </a>
  );
};

DownloadKubeconfigButton.defaultProps = {
  content: '',
};

export default DownloadKubeconfigButton;
