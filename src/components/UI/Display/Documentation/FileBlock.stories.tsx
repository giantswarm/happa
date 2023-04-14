import { Meta, StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import FileBlock from './FileBlock';

export default {
  title: 'Display/Documentation/FileBlock',
  component: FileBlock,
  argTypes: {},
} as Meta;

const Template: StoryFn<ComponentPropsWithoutRef<typeof FileBlock>> = (
  args
) => (
  <FileBlock {...args}>
    {`
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.name }}
  namespace: {{ .Values.namespace }}
  labels:
    app: {{ .Values.name }}
spec:
  ports:
  - name: {{ .Values.name }}
    port: {{ .Values.port }}
    targetPort: {{ .Values.port }}
  selector:
    app: {{ .Values.name }} `}
  </FileBlock>
);

export const Basic = Template.bind({});
Basic.args = {
  fileName: 'service.yaml',
};
