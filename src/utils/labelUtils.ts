import { Constants } from 'model/constants';

// contains validation for kubernetes labels
// regular expressions & logic mostly copied from
// https://github.com/kubernetes/apimachinery/blob/f315d76/pkg/util/validation/validation.go
// Licensed under Apache-2.0
//
// check functions IsValidLabelValue for label values
//               & IsQualifiedName for label keys

interface IisDNS1123Subdomain {
  (value: string): boolean;
}

const labelValueMaxLength = 63;
const qnameCharFmt = '[A-Za-z0-9]';
const qnameExtCharFmt = '[-A-Za-z0-9_.]';
const qualifiedNameFmt = `(${qnameCharFmt}${qnameExtCharFmt}*)?${qnameCharFmt}`;
const labelValueFmt = `(${qualifiedNameFmt})?`;
const labelValueRegexp = new RegExp(`^${labelValueFmt}$`);

const qualifiedNameMaxLength = 63;
const qualifiedNameRegexp = new RegExp(`^${qualifiedNameFmt}$`);

const DNS1123SubdomainMaxLength = 253;
const dns1123LabelFmt = '[a-z0-9]([-a-z0-9]*[a-z0-9])?';
const dns1123SubdomainFmt = `${dns1123LabelFmt}(\\.${dns1123LabelFmt})*`;
const dns1123SubdomainRegexp = new RegExp(`^${dns1123SubdomainFmt}$`);

export const validateLabelValue: IValidationFunction = (value) => {
  const strValue = `${value}`;

  if (strValue === '') {
    return {
      isValid: false,
      validationError: 'Value cannot be empty.',
    };
  }

  if (strValue.length > labelValueMaxLength) {
    return {
      isValid: false,
      validationError: `Value must not be longer than ${labelValueMaxLength}.`,
    };
  }

  if (labelValueRegexp.test(strValue) === false) {
    return {
      isValid: false,
      validationError: `Value must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character.`,
    };
  }

  return {
    isValid: true,
    validationError: '',
  };
};

// IsDNS1123Subdomain tests for a string that conforms to the definition of a
// subdomain in DNS (RFC 1123).
const isDNS1123Subdomain: IisDNS1123Subdomain = (value) => {
  if (value.length > DNS1123SubdomainMaxLength) {
    return false;
  }
  if (dns1123SubdomainRegexp.test(value) === false) {
    return false;
  }

  return true;
};

// func IsQualifiedName(value string) []string {
const isQualifiedName: IValidationFunction = (key) => {
  const parts = key.split('/');
  let name = '';
  let prefix = '';

  switch (parts.length) {
    case 1:
      name = parts[0];
      break;
    case 2:
      [prefix, name] = parts;
      if (prefix.length === 0) {
        return {
          isValid: false,
          validationError: 'Key prefix cannot be empty.',
        };
      } else if (isDNS1123Subdomain(prefix) === false) {
        return {
          isValid: false,
          validationError: `Key prefix must be a nonempty DNS subdomain not longer than ${DNS1123SubdomainMaxLength} characters.`,
        };
      }
      break;
    default:
      return {
        isValid: false,
        validationError: `Key consists of a name part with an optional DNS subdomain prefix seprarated by a single '/'.`,
      };
  }

  if (name.length === 0) {
    return {
      isValid: false,
      validationError: 'Key name part cannot be empty.',
    };
  }

  if (name.length > qualifiedNameMaxLength) {
    return {
      isValid: false,
      validationError: `Key name part must be no longer than ${qualifiedNameMaxLength} characters.`,
    };
  }

  if (
    name.length > qualifiedNameMaxLength ||
    qualifiedNameRegexp.test(name) === false
  ) {
    return {
      isValid: false,
      validationError: `Key name part must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character.`,
    };
  }

  return {
    isValid: true,
    validationError: '',
  };
};

export const isLabelKeyRestricted = (key: string) => {
  return Constants.RESTRICTED_CLUSTER_LABEL_KEYS.some(
    (restrictedKeyItem) => key.toLowerCase() === restrictedKeyItem
  );
};

export const labelKeyHasRestrictedSubstring = (key: string) => {
  return Constants.RESTRICTED_CLUSTER_LABEL_KEY_SUBSTRINGS.some((substring) =>
    key.toLowerCase().includes(substring)
  );
};

export const isLabelKeyAllowed = (key: string) => {
  return Constants.ALLOWED_CLUSTER_LABEL_KEYS.includes(key.toLowerCase());
};

export const validateLabelKey: IValidationFunction = (key) => {
  const strKey = `${key}`;
  if (!strKey) {
    return {
      isValid: false,
      validationError: 'Key cannot be empty',
    };
  }

  if (isLabelKeyRestricted(strKey)) {
    const restrictedKey = Constants.RESTRICTED_CLUSTER_LABEL_KEYS.find(
      (restrictedKeyItem) => strKey.toLowerCase() === restrictedKeyItem
    );
    if (restrictedKey) {
      return {
        isValid: false,
        validationError: `Key cannot be '${restrictedKey}'`,
      };
    }
  }

  if (!isLabelKeyAllowed(strKey) && labelKeyHasRestrictedSubstring(strKey)) {
    const restrictedSubstring =
      Constants.RESTRICTED_CLUSTER_LABEL_KEY_SUBSTRINGS.find((substring) =>
        strKey.toLowerCase().includes(substring)
      );
    if (restrictedSubstring) {
      return {
        isValid: false,
        validationError: `Key cannot contain '${restrictedSubstring}'`,
      };
    }
  }

  return isQualifiedName(strKey);
};
