import { Box } from 'grommet';
import * as React from 'react';

import TextInput from '../TextInput';

interface ISearchInputProps
  extends React.ComponentPropsWithoutRef<typeof TextInput> {}

const SearchInput: React.FC<ISearchInputProps> = (props) => {
  return (
    <Box pad={{ horizontal: 'xsmall', vertical: 'small' }} background='border'>
      <TextInput
        {...props}
        icon={<i className='fa fa-search' />}
        margin='none'
        size='small'
      />
    </Box>
  );
};

export default SearchInput;
