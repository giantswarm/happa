import { Box, Heading, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled from 'styled-components';

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('input-highlight', theme)};
  display: inline-block;
  width: auto;
`;

interface ICLIGuideAdditionalInfoLink {
  label: string;
  href: string;
  external?: boolean;
}

interface ICLIGuideAdditionalInfoProps
  extends React.ComponentPropsWithoutRef<'div'> {
  links?: ICLIGuideAdditionalInfoLink[];
}

const CLIGuideAdditionalInfo: React.FC<
  React.PropsWithChildren<ICLIGuideAdditionalInfoProps>
> = ({ links, ...props }) => {
  return (
    <Box {...props}>
      <Box>
        <Heading level={5}>Additional information</Heading>
      </Box>
      <Box direction='column' gap='xxsmall'>
        {links?.map((link) => (
          <div key={`${link.label}-${link.href}`}>
            <StyledLink
              href={link.href}
              rel={link.external ? 'noopener noreferrer' : undefined}
              target={link.external ? '_blank' : undefined}
            >
              {link.external && (
                <Text
                  className='fa fa-open-in-new'
                  aria-hidden={true}
                  role='presentation'
                  aria-label='Opens in a new tab'
                  margin={{ right: 'xsmall' }}
                />
              )}
              {link.label}
            </StyledLink>
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default CLIGuideAdditionalInfo;
