import yaml from 'js-yaml';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import Button from 'UI/Controls/Button';

interface IYAMLFileUploadProps {
  buttonText: string;
  onInputChange: (values: string, done: () => void) => void;
}

const YAMLFileUpload: React.FC<IYAMLFileUploadProps> = ({
  buttonText,
  onInputChange,
}) => {
  const [fileUploading, setFileUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInput.current !== null) {
      fileInput.current.click();
    }
  };

  const fileInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length < 0) return;

    setFileUploading(true);

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const input = (event.target?.result as string) ?? '';
        const parsedYAML = yaml.load(input) as string;

        onInputChange(parsedYAML, () => {
          setFileUploading(false);
        });
      } catch (err) {
        new FlashMessage(
          'Unable to parse valid YAML from this file. Please validate that it is a valid YAML file and try again.',
          messageType.ERROR,
          messageTTL.MEDIUM
        );

        setFileUploading(false);

        ErrorReporter.getInstance().notify(err);
      }
    };

    reader.readAsText(e.target.files[0]);
  };

  return (
    <>
      <Button loading={fileUploading} onClick={handleUploadClick}>
        {buttonText}
      </Button>

      <input
        accept='.yaml'
        onChange={fileInputOnChange}
        ref={fileInput}
        style={{ display: 'none' }}
        type='file'
      />
    </>
  );
};

YAMLFileUpload.propTypes = {
  buttonText: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default YAMLFileUpload;
