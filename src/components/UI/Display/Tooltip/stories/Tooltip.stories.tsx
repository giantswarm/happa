import { Meta } from '@storybook/react';

import { TooltipContainer } from '..';
import { Tooltip } from '..';

export { Simple } from './Simple';

export default {
  title: 'Display/Tooltip',
  component: TooltipContainer,
  subcomponents: { Tooltip },
} as Meta;
