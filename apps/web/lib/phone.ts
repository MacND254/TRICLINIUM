/**
 * Kenyan phone number formatting utility
 * Automatically ensures +254 prefix, dropping leading 0 from 07... and 01... numbers
 */
export function formatKenyanPhone(input: string): string {
  if (!input) return '';

  let str = input.trim();

  // Remove non-digit characters except leading +
  const hasPlus = str.startsWith('+');
  const digitsOnly = str.replace(/\D/g, '');

  if (!digitsOnly) return hasPlus ? '+' : '';

  // If starts with 254
  if (digitsOnly.startsWith('254')) {
    return `+${digitsOnly}`;
  }

  // If starts with 07 or 01 (standard Kenyan mobile formats)
  if (digitsOnly.startsWith('07') || digitsOnly.startsWith('01')) {
    return `+254${digitsOnly.slice(1)}`;
  }

  // If starts with 0 and followed by any digit
  if (digitsOnly.startsWith('0')) {
    return `+254${digitsOnly.slice(1)}`;
  }

  // If starts with 7 or 1 without leading zero
  if (digitsOnly.startsWith('7') || digitsOnly.startsWith('1')) {
    return `+254${digitsOnly}`;
  }

  // Default: if has +, preserve it
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Live input handler helper: formats as user types or pastes
 */
export function handleKenyanPhoneChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (val: string) => void
) {
  const val = e.target.value;
  // If the user is deleting everything, let them clear it
  if (!val) {
    setter('');
    return;
  }

  // If they typed 07... or 01... or pasted a standard number, format immediately
  if (val.startsWith('07') || val.startsWith('01') || (val.startsWith('0') && val.length >= 3)) {
    setter(formatKenyanPhone(val));
  } else if (!val.startsWith('+') && !val.startsWith('0') && (val.startsWith('7') || val.startsWith('1'))) {
    setter(formatKenyanPhone(val));
  } else {
    setter(val);
  }
}
