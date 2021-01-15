import add from 'date-fns/fp/add';
import differenceInHours from 'date-fns/fp/differenceInHours';
import startOfDay from 'date-fns/fp/startOfDay';
import PropTypes from 'prop-types';
import React from 'react';
import DatePicker from 'react-datepicker';
import { Constants } from 'shared/constants';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import FlashMessage from 'UI/FlashMessage';

const List = styled.ul`
  & > li + li {
    margin-top: 25px;
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

  handleDateChange(date) {
    this.setState(
      {
        expireDate: date,
        selectionType: 'date',
      },
      () => {
        this.updateTTL();
      }
    );
  }

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
    const { error } = this.state;
    const hasError = error !== '';

    const now = new Date();
    const maxDate = add({ years: 30 })(now);
    const minDate = add({ day: 1 })(now);

    return (
      <List className='expiry-hours-picker'>
        <li className='expiry-hours-picker--granular'>
          <input
            checked={this.state.selectionType === 'relative'}
            id='relativeCheck'
            name='selectionType'
            onChange={this.onSelectionTypeChanged.bind(this)}
            type='radio'
            value='relative'
          />
          <label htmlFor='relativeCheck'>Relatively:</label>
          <div>
            <input
              autoComplete='off'
              max='10'
              maxLength={2}
              min='0'
              name='years'
              onChange={this.handleYearChange.bind(this)}
              ref={(i) => {
                this.years = i;
              }}
              type='text'
              value={this.state.yearsValue}
            />{' '}
            years
            <input
              autoComplete='off'
              max='999'
              maxLength={2}
              min='0'
              name='months'
              onChange={this.handleMonthChange.bind(this)}
              ref={(i) => {
                this.months = i;
              }}
              type='text'
              value={this.state.monthsValue}
            />{' '}
            months
            <input
              autoComplete='off'
              max='999'
              maxLength={2}
              min='0'
              name='days'
              onChange={this.handleDayChange.bind(this)}
              ref={(i) => {
                this.days = i;
              }}
              type='text'
              value={this.state.daysValue}
            />{' '}
            days
            <input
              autoComplete='off'
              max='999'
              maxLength={2}
              min='0'
              name='hours'
              onChange={this.handleHourChange.bind(this)}
              ref={(i) => {
                this.hours = i;
              }}
              type='text'
              value={this.state.hoursValue}
            />{' '}
            hours from now
          </div>
        </li>
        <li>
          <input
            checked={this.state.selectionType === 'date'}
            id='dateCheck'
            name='selectionType'
            onChange={this.onSelectionTypeChanged.bind(this)}
            type='radio'
            value='date'
          />
          <label htmlFor='dateCheck'>Date:</label>
          <DatePicker
            dateFormat='yyyy-MM-dd'
            dropdownMode='select'
            maxDate={maxDate}
            minDate={minDate}
            onChange={this.handleDateChange.bind(this)}
            selected={this.state.expireDate}
            showMonthDropdown
            showYearDropdown
          />
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
