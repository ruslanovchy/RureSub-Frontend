const yearFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
});

const oneDayInMs = 86400000;
const oneHourInMs = 3600000;
const oneMinuteInMs = 60000;
const oneSecondInMs = 1000;

export function toPostDateFormat(date) {
    const currentDate = new Date();

    const currentYear = currentDate.getFullYear();

    const year = currentYear - date.getFullYear();

    if (year !== 0) {
        return yearFormatter.format(date);
    }

    const diffInMs = currentDate - date;
    

    const currentMonth = currentDate.getMonth();
    const month = currentMonth - date.getMonth();

    const day = diffInMs / oneDayInMs;

    if (month !== 0 && day > 28) {
        return `${month} month ago`;
    }

    if (day >= 1) {
        return `${parseInt(day)} days ago`;
    }
    
    const hours = diffInMs / oneHourInMs;

    if (hours >= 1) {
        return `${parseInt(hours)} ${hours == 1 ? 'hour' : 'hours'} ago`;
    }

    const minutes = diffInMs / oneMinuteInMs;

    if (minutes >= 1) {
        return `${parseInt(minutes)} ${minutes == 1 ? 'minute' : 'minutes'} ago`;
    }

    const seconds = diffInMs / oneSecondInMs;

    if (seconds >= 1) {
        return `${parseInt(seconds)} ${seconds == 1 ? 'second' : 'seconds'} ago`;
    }

    return 'now'
}