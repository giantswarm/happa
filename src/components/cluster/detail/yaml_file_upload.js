import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import yaml from 'js-yaml';

// YAMLFileUpload is a component that renders a button and a hidden file
// input element. When you click the button the file dialog opens, and the
// user can pick a file. If the file the user picks is valid YAML, then
// "props.onInputChange" will be called with the parsed contents of that file.
const YAMLFileUpload = props => {
  const [fileUploading, setFileUploading] = useState(false);
  const [renderFileInputs, setRenderFileInputs] = useState(true);

  let fileInput = null;

  function handleUploadClick() {
    fileInput.click();
  }

  // resetFileInput is a hack to clear the file input. Since the only event
  // we really get from file inputs is when something has changed, there is a
  // state we can be in where the user tries to upload the same file twice,
  // but gets no more feedback. In order to fix this I have to unload the file
  // inputs in some cases.
  function refreshFileInputs() {
    setRenderFileInputs(false);
    setRenderFileInputs(true);
  }

  function fileInputOnChange(e) {
    setFileUploading(true);

    var reader = new FileReader();

    reader.onload = (function() {
      let parsedYAML;
      return function(e) {
        try {
          parsedYAML = yaml.safeLoad(e.target.result);
        } catch (err) {
          new FlashMessage(
            'Unable to parse valid YAML from this file. Please validate that it is a valid YAML file and try again.',
            messageType.ERROR,
            messageTTL.MEDIUM
          );
          setFileUploading(false);
          refreshFileInputs();
          return;
        }

        props.onInputChange(parsedYAML).then(() => {
          setFileUploading(false);
          refreshFileInputs();
        });
      };
    })(e.target.files[0]);

    reader.readAsText(e.target.files[0]);
  }

  return (
    <>
      <Button loading={fileUploading} onClick={handleUploadClick}>
        {props.buttonText}
      </Button>

      {renderFileInputs ? (
        <input
          accept='.yaml'
          onChange={fileInputOnChange}
          ref={i => (fileInput = i)}
          style={{ display: 'none' }}
          type='file'
        />
      ) : (
        undefined
      )}
    </>
  );
};

YAMLFileUpload.propTypes = {
  buttonText: PropTypes.string,
  onInputChange: PropTypes.func,
};

export default YAMLFileUpload;
