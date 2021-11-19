import yaml from 'js-yaml';
import { formatYAMLError } from 'MAPI/apps/utils';
import React, { useRef, useState } from 'react';
import Button from 'UI/Controls/Button';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';

interface IYAMLFileUploadProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  buttonText: string;
  onInputChange: (values: string, done: () => void) => void;
}

const YAMLFileUpload: React.FC<IYAMLFileUploadProps> = ({
  buttonText,
  onInputChange,
  ...props
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
        const errorMessage = formatYAMLError(err);

        new FlashMessage(
          'Unable to parse valid YAML from this file. Please validate that it is a valid YAML file and try again.',
          messageType.ERROR,
          messageTTL.MEDIUM,
          errorMessage
        );

        setFileUploading(false);
      }
    };

    reader.readAsText(e.target.files[0]);
  };

  return (
    <>
      <Button {...props} loading={fileUploading} onClick={handleUploadClick}>
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

export default YAMLFileUpload;
