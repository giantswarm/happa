import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.span(
  props => `
  font-family: ${props.theme.fontFamilies.console};
`
);

class AWSAccountID extends React.Component {
  render() {
    // get account ID from ARN like 'arn:aws:iam::<YOUR_ACCOUNT_ID>:role/GiantSwarmAdmin'
    let parts = this.props.roleARN.split(':');
    let accountID = parts[4];

    return (
      <Wrapper>
        {accountID}{' '}
        <a
          href={'https://' + accountID + '.signin.aws.amazon.com/console'}
          rel='noopener noreferrer'
          target='_blank'
        >
          <i className='fa fa-open-in-new' />
        </a>
      </Wrapper>
    );
  }
}

AWSAccountID.propTypes = {
  roleARN: PropTypes.string,
};

export default AWSAccountID;
