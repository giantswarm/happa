import { Box, Text } from 'grommet';
import * as React from 'react';

interface IOptionPillProps extends React.ComponentPropsWithoutRef<typeof Box> {
  option: string;
  editable?: boolean;
}

const OptionPill: React.FC<React.PropsWithChildren<IOptionPillProps>> = ({
  option,
  editable,
  ...rest
}) => {
  return (
    <Box
      align='center'
      direction='row'
      gap='xsmall'
      pad={{ vertical: 'xsmall', horizontal: 'small' }}
      margin='xsmall'
      background='text-xweak'
      round='large'
      {...rest}
    >
      <Text size='small' color='text-strong'>
        {option}
      </Text>
      {editable && (
        <Box>
          <i className='fa fa-close' />
        </Box>
      )}
    </Box>
  );
};

OptionPill.defaultProps = {
  editable: false,
};

export default OptionPill;
