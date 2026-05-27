const yearFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
});

export function toPostDateFormat(date) {
    const currentDate = new Date();
    
    const currentYear = currentDate.getFullYear();

    const year = currentYear - date.getFullYear();

    if (year !== 0) {
        return yearFormatter.format(date);
    }

    const currentMonth = currentDate.getMonth();
    const month = currentMonth - date.getMonth();

    if (month !== 0) {
        return `${month} month ago`;
    }

    const currentDay = currentDate.getDate();
    const day = currentDay - date.getDate();
    if (day !== 0) {
        return `${day} days ago`;
    }
    
    const currentHours = currentDate.getHours();
    const hours = currentHours - date.getHours();

    if (hours !== 0) {
        return `${hours} ${hours == 1 ? 'hour' : 'hours'} ago`;
    }

    const currentMinutes = currentDate.getMinutes();
    const minutes = currentMinutes - date.getMinutes();

    if (minutes !== 0) {
        return `${minutes} ${minutes == 1 ? 'minute' : 'minutes'} ago`;
    }

    const currentSeconds = currentDate.getSeconds();
    const seconds = currentSeconds - date.getSeconds();

    if (seconds !== 0) {
        return `${seconds} ${seconds == 1 ? 'second' : 'seconds'} ago`;
    }
}