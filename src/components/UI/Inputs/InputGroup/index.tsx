import { FormField, Text } from 'grommet';
import * as React from 'react';

interface IInputGroupProps
  extends React.ComponentPropsWithoutRef<typeof FormField> {}

const InputGroup = React.forwardRef<HTMLDivElement, IInputGroupProps>(
  ({ label, contentProps, ...props }, ref) => {
    let labelComponent: React.ReactNode = label;
    if (typeof label === 'string') {
      labelComponent = <Text size='large'>{label}</Text>;
    }

    return (
      <FormField
        label={labelComponent}
        margin={{ bottom: 'none' }}
        {...props}
        contentProps={{
          border: false,
          ...contentProps,
        }}
        ref={ref}
      />
    );
  }
);

export default InputGroup;
