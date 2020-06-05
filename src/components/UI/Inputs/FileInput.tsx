import PropTypes from 'prop-types';
import React, { ChangeEvent, ElementRef, FC } from 'react';

import Input, { IInput, InputElement } from './Input';

const FileInput: FC<IInput<FileList>> = (props) => {
  const onChange = (e: ChangeEvent<ElementRef<'input'>>) => {
    // eslint-disable-next-line no-unused-expressions
    props.onChange?.(e.target.files);
  };

  return (
    <Input {...props}>
      <InputElement id={props.label} onChange={onChange} type='file' />
    </Input>
  );
};

/*
  PropTypes wierdness, redefining `value` which is already `any`
  again as `any`.
 */
FileInput.propTypes = { ...Input.propTypes, value: PropTypes.any };

export default FileInput;
