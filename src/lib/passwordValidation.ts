export enum PasswordStatusMessage {
  TooShort = 'password_too_short',
  JustNumbers = 'password_not_just_numbers',
  JustLetters = 'password_not_just_letters',
  Ok = 'password_ok',
}

export function validatePassword(password: string): {
  valid: boolean;
  statusMessage: PasswordStatusMessage;
} {
  const minPasswordLength = 8;

  let valid = false;
  let statusMessage: PasswordStatusMessage = PasswordStatusMessage.Ok;

  if (password.length < minPasswordLength) {
    statusMessage = PasswordStatusMessage.TooShort;
  } else if (/^[0-9]+$/.test(password)) {
    statusMessage = PasswordStatusMessage.JustNumbers;
  } else if (/^[a-z]+$/.test(password)) {
    statusMessage = PasswordStatusMessage.JustLetters;
  } else if (/^[A-Z]+$/.test(password)) {
    statusMessage = PasswordStatusMessage.JustLetters;
  } else {
    valid = true;
  }

  return { valid, statusMessage };
}
