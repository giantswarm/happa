import { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
import { pipe, traverseJSONSchemaObject } from 'utils/helpers';

import { IIdConfigs } from '.';

function transformRequiredArrayItemError(
  error: RJSFValidationError
): RJSFValidationError {
  if (error.name === 'type' && error.params.type === 'string') {
    return {
      ...error,
      message: 'must not be empty',
      stack: `${error.property} must not be empty`,
    };
  }

  return error;
}

export function transformErrors(errors: RJSFValidationError[]) {
  return errors.map((err) => pipe(err, transformRequiredArrayItemError));
}

export function mapErrorPropertyToField(
  e: RJSFValidationError,
  idConfigs: IIdConfigs
): string {
  if (!e.property) return '';

  return `${idConfigs.idPrefix}${(e.property[0] === '.'
    ? e.property
    : `.${e.property}`
  ).replaceAll('.', idConfigs.idSeparator)}`;
}

export function isTouchedField(
  id: string,
  touchedFields: string[],
  idSeparator: string
): boolean {
  return touchedFields.some((field) =>
    `${field}${idSeparator}`.includes(`${id}${idSeparator}`)
  );
}

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const idIndexRegExp = (idSeparator: string) =>
  new RegExp(`(${escapeRegExp(idSeparator)}\\d+)$`, 'g');

export function isFieldArrayItem(id: string, idSeparator: string) {
  return idIndexRegExp(idSeparator).test(id);
}

export function getArrayItemIndex(id: string, idSeparator: string) {
  const indexMatchArray = id.match(idIndexRegExp(idSeparator));

  return indexMatchArray
    ? parseInt(indexMatchArray[0].replace(idSeparator, ''))
    : -1;
}

export function removeDefaultValues(schema: RJSFSchema): RJSFSchema {
  const removeDefaults = (obj: RJSFSchema) => {
    if (obj.default) {
      delete obj.default;
    }

    return obj;
  };

  return traverseJSONSchemaObject(schema, removeDefaults);
}
