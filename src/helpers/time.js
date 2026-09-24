// Unix timestamp (seconds) for the start of a relative time filter
// ('1-week', '2-week', '1-month', '2-month', '6-month'). Anything else,
// e.g. 'all', returns 0 so the API applies no lower bound.
export function getFilterTimestamp(filter) {
  const date = new Date();

  switch (filter) {
    case '1-week':
      date.setDate(date.getDate() - 7);
      break;
    case '2-week':
      date.setDate(date.getDate() - 14);
      break;
    case '1-month':
      date.setMonth(date.getMonth() - 1);
      break;
    case '2-month':
      date.setMonth(date.getMonth() - 2);
      break;
    case '6-month':
      date.setMonth(date.getMonth() - 6);
      break;
    default:
      return 0;
  }
  return Math.round(date.getTime() / 1000);
}

// Normalizes a Unix timestamp to milliseconds, accepting seconds or ms.
export function toMs(timestamp) {
  return timestamp < 1e12 ? timestamp * 1000 : timestamp;
}
