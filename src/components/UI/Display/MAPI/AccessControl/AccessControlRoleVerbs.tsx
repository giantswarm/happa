import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import {
  AccessControlRoleItemVerb,
  IAccessControlRoleItemPermission,
} from './types';

function formatVerbs(verbs: string[]): string {
  if (verbs.length < 1) {
    return 'None';
  }

  for (const verb of verbs) {
    if (verb === '*') return 'All';
  }

  return verbs.join(', ');
}

interface IVerbSymbol {
  color: string;
  display: string;
  active: boolean;
}

interface IVerbMap {
  [key: string]: IVerbSymbol;
  get: IVerbSymbol;
  watch: IVerbSymbol;
  list: IVerbSymbol;
  create: IVerbSymbol;
  update: IVerbSymbol;
  patch: IVerbSymbol;
  delete: IVerbSymbol;
  other: IVerbSymbol;
}

function makeVerbMap(from: AccessControlRoleItemVerb[]): IVerbMap {
  const verbs: IVerbMap = {
    get: {
      color: '#45694b',
      display: 'G',
      active: false,
    },
    watch: {
      color: '#516a40',
      display: 'W',
      active: false,
    },
    list: {
      color: '#696a40',
      display: 'L',
      active: false,
    },
    create: {
      color: '#817239',
      display: 'C',
      active: false,
    },
    update: {
      color: '#7f5c38',
      display: 'U',
      active: false,
    },
    patch: {
      color: '#7d4337',
      display: 'P',
      active: false,
    },
    delete: {
      color: '#7d2d2b',
      display: 'D',
      active: false,
    },
    other: {
      color: 'transparent',
      display: '···',
      active: false,
    },
  };

  // Make all verbs active.
  if (from.length === 1 && from[0] === '*') {
    for (const v of Object.keys(verbs)) {
      verbs[v].active = true;
    }

    return verbs;
  }

  for (const verb of from) {
    if (verbs.hasOwnProperty(verb)) {
      verbs[verb].active = true;
    } else {
      verbs.other.active = true;
    }
  }

  return verbs;
}

interface IAccessControlRoleVerbsProps
  extends Pick<IAccessControlRoleItemPermission, 'verbs'>,
    React.ComponentPropsWithoutRef<typeof Box> {}

const AccessControlRoleVerbs: React.FC<IAccessControlRoleVerbsProps> = ({
  verbs,
  ...props
}) => {
  const verbMap = useMemo(() => makeVerbMap(verbs), [verbs]);
  const formattedVerbs = useMemo(() => formatVerbs(verbs), [verbs]);

  return (
    <OverlayTrigger
      overlay={
        <Tooltip id='role-verbs'>
          <Text size='xsmall'>{formattedVerbs}</Text>
        </Tooltip>
      }
      placement='left'
    >
      <Box gap='xxsmall' direction='row' {...props}>
        {Object.entries(verbMap).map(([verb, options]) => (
          <Box
            width='23px'
            height='23px'
            border={{
              color: options.active ? 'text-weak' : 'text-xweak',
            }}
            key={verb}
            background={options.active ? options.color : 'transparent'}
            align='center'
            justify='center'
            round='xxsmall'
            aria-label={verb}
          >
            <Text size='small' color={options.active ? 'text' : 'text-xweak'}>
              {options.display}
            </Text>
          </Box>
        ))}
      </Box>
    </OverlayTrigger>
  );
};

AccessControlRoleVerbs.propTypes = {
  verbs: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default AccessControlRoleVerbs;
