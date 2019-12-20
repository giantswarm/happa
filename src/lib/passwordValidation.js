export function validatePassword(password) {
  let valid = false;
  let statusMessage = '';

  if (password.length < 8) {
    statusMessage = 'password_too_short';
  } else if (/^[0-9]+$/.test(password)) {
    statusMessage = 'password_not_just_numbers';
  } else if (/^[a-z]+$/.test(password)) {
    statusMessage = 'password_not_just_letters';
  } else if (/^[A-Z]+$/.test(password)) {
    statusMessage = 'password_not_just_letters';
  } else {
    statusMessage = 'password_ok';
    valid = true;
  }

  return { valid, statusMessage };
}
