import add from 'date-fns/fp/add';
import differenceInHours from 'date-fns/fp/differenceInHours';
import format from 'date-fns/fp/format';
import startOfDay from 'date-fns/fp/startOfDay';
import toDate from 'date-fns-tz/toDate';
import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import { Constants } from 'shared/constants';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import FlashMessage from 'UI/Display/FlashMessage';
import DateInput from 'UI/Inputs/DateInput';
import RadioInput from 'UI/Inputs/RadioInput';
import TextInput from 'UI/Inputs/TextInput';

const List = styled.ul`
  & > li + li {
    margin-top: 25px;
  }

  .date-input-button {
    background: ${({ theme }) => theme.global.colors['input-background']};
    border-width: 0;
    padding: 9px;

    :hover {
      box-shadow: none;
      background: ${({ theme }) => theme.global.colors.border.dark};
    }
  }
`;

class ExpiryHoursPicker extends React.Component {
  constructor(props) {
    super(props);

    let years = 0;
    let months = 0;
    let days = 0;
    let hours = 0;

    // eslint-disable-next-line no-magic-numbers
    years = Math.floor(props.initialValue / 8760);
    // eslint-disable-next-line no-magic-numbers
    months = Math.floor((props.initialValue - years * 8760) / 720);
    // eslint-disable-next-line no-magic-numbers
    days = Math.floor((props.initialValue - years * 8760 - months * 720) / 24);
    hours = Math.floor(
      // eslint-disable-next-line no-magic-numbers
      props.initialValue - years * 8760 - months * 720 - days * 24
    );

    const expireDate = add({
      hours: props.initialValue,
    })(new Date());

    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      yearsValue: years,
      monthsValue: months,
      daysValue: days,
      hoursValue: hours,
      expireDate: expireDate,
      selectionType: 'relative',
      error: '',
    };
  }

  handleDateChange = ({ value }) => {
    const date = toDate(value, { timeZone: 'UTC' });

    this.setState(
      {
        expireDate: date,
        selectionType: 'date',
      },
      () => {
        this.updateTTL();
      }
    );
  };

  handleYearChange(event) {
    const value = parseInt(event.target.value) || 0;
    this.setState(
      {
        yearsValue: value,
        selectionType: 'relative',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  handleMonthChange(event) {
    const value = parseInt(event.target.value) || 0;
    this.setState(
      {
        monthsValue: value,
        selectionType: 'relative',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  handleDayChange(event) {
    const value = parseInt(event.target.value) || 0;
    this.setState(
      {
        daysValue: value,
        selectionType: 'relative',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  handleHourChange(event) {
    const value = parseInt(event.target.value) || 0;
    this.setState(
      {
        hoursValue: value,
        selectionType: 'relative',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  onSelectionTypeChanged(event) {
    this.setState(
      {
        selectionType: event.target.value,
      },
      () => {
        this.updateTTL();
      }
    );
  }

  updateTTL() {
    let expireDate = 0; // The expiration date the user intends
    // This will either come straight from the date picker state
    // or calculated based on values from the various year/month/day/hour
    // inputs.
    let TTL = 0;

    this.setState(
      (prevState, props) => {
        const now = new Date();

        if (prevState.selectionType === 'date') {
          // expireDate is at the start of the day of whatever the user picked.
          expireDate = startOfDay(prevState.expireDate);
        } else if (prevState.selectionType === 'relative') {
          // Calculate hours based on years, months, days, hours chosen
          expireDate = add({
            years: prevState.yearsValue,
            months: prevState.monthsValue,
            days: prevState.daysValue,
            hours: prevState.hoursValue,
          })(now);
        }

        // Now that we have an expireDate, calculate the difference between it and
        // now in hours.
        TTL = differenceInHours(now)(expireDate);

        let error = '';
        if (TTL >= props.maxSafeValueHours) {
          error = Constants.KEYPAIR_UNSAFE_TTL_EXPLANATION;
        }

        // Guard against invalid value
        if (TTL < 1) {
          TTL = 0;
        }

        // Set date picker to this value too
        return { expireDate, error };
      },
      () => {
        this.props.onChange(TTL);
      }
    );
  }

  render() {
    const { error, expireDate } = this.state;
    const hasError = error !== '';

    const now = new Date();
    const maxDate = add({ years: 30 })(now).toISOString();
    const minDate = add({ day: 1 })(now).toISOString();

    const dateInputLabel = expireDate
      ? format('d MMM yyyy')(expireDate)
      : 'Please pick a date';

    return (
      <List className='expiry-hours-picker'>
        <li className='expiry-hours-picker--granular'>
          <RadioInput
            checked={this.state.selectionType === 'relative'}
            id='relativeCheck'
            name='selectionType'
            onChange={this.onSelectionTypeChanged.bind(this)}
            value='relative'
            label='Relatively'
          />
          <Box direction='row' gap='small' align='baseline'>
            <TextInput
              autoComplete='off'
              max='10'
              maxLength={2}
              min='0'
              name='years'
              onChange={this.handleYearChange.bind(this)}
              type='number'
              size='small'
              value={this.state.yearsValue}
            />
            <Text>years</Text>
            <TextInput
              autoComplete='off'
              max='999'
              maxLength={2}
              min='0'
              name='months'
              onChange={this.handleMonthChange.bind(this)}
              type='number'
              size='small'
              value={this.state.monthsValue}
            />
            <Text>months</Text>
            <TextInput
              autoComplete='off'
              max='999'
              maxLength={2}
              min='0'
              name='days'
              onChange={this.handleDayChange.bind(this)}
              type='number'
              size='small'
              value={this.state.daysValue}
            />
            <Text>days</Text>
            <TextInput
              autoComplete='off'
              max='999'
              maxLength={2}
              min='0'
              name='hours'
              onChange={this.handleHourChange.bind(this)}
              type='number'
              size='small'
              value={this.state.hoursValue}
            />
            <Text>hours from now</Text>
          </Box>
        </li>
        <li>
          <Box direction='row' align='center' gap='medium'>
            <RadioInput
              checked={this.state.selectionType === 'date'}
              id='dateCheck'
              name='selectionType'
              onChange={this.onSelectionTypeChanged.bind(this)}
              value='date'
              label='Date'
            />
            <DateInput
              id='date-input'
              buttonProps={{
                label: dateInputLabel,
                className: 'date-input-button',
              }}
              calendarProps={{
                bounds: [minDate, maxDate],
              }}
              onChange={this.handleDateChange}
              value={expireDate.toISOString()}
            />
          </Box>
        </li>
        <li>
          <SlideTransition in={hasError}>
            <FlashMessage type='warning'>{error}</FlashMessage>
          </SlideTransition>
        </li>
      </List>
    );
  }
}

ExpiryHoursPicker.propTypes = {
  onChange: PropTypes.func,
  initialValue: PropTypes.number,
  maxSafeValueHours: PropTypes.number,
};

export default ExpiryHoursPicker;
