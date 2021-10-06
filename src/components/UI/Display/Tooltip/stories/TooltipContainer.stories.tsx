import { Meta } from '@storybook/react';

import { TooltipContainer } from '..';
import { Tooltip } from '..';

export { WithContainer } from './WithContainer';

export default {
  title: 'Display/TooltipContainer',
  component: TooltipContainer,
  subcomponents: { Tooltip },
} as Meta;
