import { Text, TextExtendedProps } from 'grommet';
import React from 'react';

import { getArrayItemIndex, isFieldArrayItem } from '../utils';

interface FieldLabelProps {
  label: string;
  id: string;
  idSeparator: string;
  required?: boolean;
  textProps?: TextExtendedProps;
}

const nameIndexRegExp = /(-\d+)$/;

function formatArrayItemLabel(label: string, id: string, idSeparator: string) {
  const index = getArrayItemIndex(id, idSeparator);

  return `${label.replace(nameIndexRegExp, '')} No. ${index + 1}`;
}

const FieldLabel: React.FC<FieldLabelProps> = ({
  label,
  id,
  idSeparator,
  required,
  textProps,
}) => {
  const isArrayItem = isFieldArrayItem(id, idSeparator);

  return (
    <Text {...textProps}>
      {isArrayItem ? formatArrayItemLabel(label, id, idSeparator) : label}
      {required && !isArrayItem && <span>*</span>}
    </Text>
  );
};

export default FieldLabel;
