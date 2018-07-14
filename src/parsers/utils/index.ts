export function createDateAsUTC(date: Date) {
    return new Date(Date.UTC(
        date.getFullYear(), 
        date.getMonth(), 
        date.getDate(), 
        date.getHours(), 
        date.getMinutes(), 
        date.getSeconds(),
        date.getMilliseconds()
    ));
}