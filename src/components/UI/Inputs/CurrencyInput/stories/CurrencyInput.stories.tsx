import { Meta } from '@storybook/react';

import CurrencyInput from '..';

export { Simple } from './Simple';
export { FloatValues } from './FloatValues';
export { Constraints } from './Constraints';
export { Currencies } from './Currencies';
export { Label } from './Label';
export { ValidationError } from './ValidationError';

export default {
  title: 'Inputs/CurrencyInput',
  component: CurrencyInput,
} as Meta;
