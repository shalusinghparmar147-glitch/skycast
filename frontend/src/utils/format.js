
export const formatTemp = (celsius, fahrenheit, unit) =>
  `${Math.round(unit === 'C' ? celsius : fahrenheit)}°`;


function readTime(dateTime) {
  const [hours, minutes] = dateTime.split(' ')[1].split(':').map(Number);
  return { hours, minutes, suffix: hours < 12 ? 'AM' : 'PM', hour12: hours % 12 || 12 };
}

export function formatHour(dateTime) {
  const { hour12, suffix } = readTime(dateTime);
  return `${hour12} ${suffix}`;
}


export function formatClock(dateTime) {
  const { hour12, minutes, suffix } = readTime(dateTime);
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}


function toDate(dateText) {
  const [year, month, day] = dateText.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}


export const formatWeekday = (dateText) =>
  toDate(dateText).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });


export const formatLongDate = (dateText) =>
  toDate(dateText).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
