import * as got from 'got';

export async function getUSDRate (date: Date) {
    const data = [
        `fsym=BTC`,
        'tsym=USD',
        'sign=false', // change to true for security?
        `toTs=${date.getTime() / 1000}`,
        'extraParams=tApp',
    ];
    const response = await got('https://min-api.cryptocompare.com/data/dayAvg?' + data.join('&'));
    if ('body' in response) {
        try {
            const result = JSON.parse(response.body);
            return result.USD;
        } catch (ex) {
            console.log('Error parsing JSON');
        }
    } else {
        console.log('Invalid Response');
    }
    return undefined;
}
