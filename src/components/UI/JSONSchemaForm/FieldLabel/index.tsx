import { Text, TextExtendedProps } from 'grommet';
import React from 'react';

import { ID_SEPARATOR } from '../utils';

interface FieldLabelProps {
  label: string;
  id: string;
  required?: boolean;
  textProps?: TextExtendedProps;
}

const nameIndexRegExp = /(-\d+)$/;
const idIndexRegExp = new RegExp(`(${ID_SEPARATOR}\\d+)$`, 'g');

function formatArrayItemLabel(label: string, id: string) {
  const indexMatchArray = id.match(idIndexRegExp);
  const index = indexMatchArray
    ? parseInt(indexMatchArray[0].replace(ID_SEPARATOR, ''))
    : -1;

  return `${label.replace(nameIndexRegExp, '')} No. ${index + 1}`;
}

const FieldLabel: React.FC<FieldLabelProps> = ({
  label,
  id,
  required,
  textProps,
}) => {
  const isArrayItem = idIndexRegExp.test(id);

  return (
    <Text {...textProps}>
      {isArrayItem ? formatArrayItemLabel(label, id) : label}
      {required && !isArrayItem && <span>*</span>}
    </Text>
  );
};

export default FieldLabel;
