import { Box } from 'grommet';
import * as React from 'react';

import TextInput from '../TextInput';

interface ISearchInputProps
  extends React.ComponentPropsWithRef<typeof TextInput> {}

const SearchInput: React.FC<React.PropsWithChildren<ISearchInputProps>> =
  React.forwardRef<HTMLInputElement, ISearchInputProps>((props, ref) => {
    return (
      <Box
        pad={{ horizontal: 'xsmall', vertical: 'small' }}
        background='border'
      >
        <TextInput
          icon={<i className='fa fa-search' />}
          margin='none'
          size='small'
          {...props}
          ref={ref}
        />
      </Box>
    );
  });

export default SearchInput;
