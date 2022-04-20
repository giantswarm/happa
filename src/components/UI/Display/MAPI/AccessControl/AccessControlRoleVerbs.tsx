import { Box, Text } from 'grommet';
import React, { useMemo } from 'react';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import {
  AccessControlRoleItemVerb,
  IAccessControlRoleItemPermission,
} from './types';

function formatVerbs(verbs: string[], verbMap: IVerbMap): string {
  if (verbs.length < 1) {
    return 'None';
  }

  for (const verb of verbs) {
    if (verb === '*') return 'All (*)';
  }

  const verbOrder = Object.keys(verbMap);
  // Sort verbs in the order they are in the map, and leave unknown ones at the end.
  const orderedVerbs = verbs.slice().sort((a, b) => {
    let aIdx = verbOrder.indexOf(a);
    if (aIdx < 0) {
      aIdx = verbOrder.length - 1;
    }
    let bIdx = verbOrder.indexOf(b);
    if (bIdx < 0) {
      bIdx = verbOrder.length - 1;
    }

    return aIdx - bIdx;
  });

  return orderedVerbs.join(', ');
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
      display: '⋯',
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

const AccessControlRoleVerbs: React.FC<
  React.PropsWithChildren<IAccessControlRoleVerbsProps>
> = ({ verbs, ...props }) => {
  const verbMap = useMemo(() => makeVerbMap(verbs), [verbs]);
  const formattedVerbs = useMemo(
    () => formatVerbs(verbs, verbMap),
    [verbs, verbMap]
  );

  return (
    <TooltipContainer
      content={
        <Tooltip placement='left' id='role-verbs'>
          {formattedVerbs}
        </Tooltip>
      }
    >
      <Box
        gap='xxsmall'
        direction='row'
        aria-label={`Supported verbs: ${formattedVerbs}`}
        {...props}
      >
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
            aria-disabled={!options.active}
          >
            <Text size='small' color={options.active ? 'text' : 'text-xweak'}>
              {options.display}
            </Text>
          </Box>
        ))}
      </Box>
    </TooltipContainer>
  );
};

export default AccessControlRoleVerbs;
