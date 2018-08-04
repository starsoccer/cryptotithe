import * as faker from 'faker';
import { mockHoldings } from '../../mock';
import { IHoldings} from '../../types';
import sortHoldings from './';

describe('Sort Holdings', () => {
    test('By Date no overflow', () => {
        const holdings: IHoldings = mockHoldings(
            faker.random.number(10) + 5, faker.random.number(10) + 5, faker.date.past(5), faker.date.recent(),
        );

        const sortedHoldings = sortHoldings(holdings);
        const currencies = Object.keys(sortedHoldings);
        for (const currency of currencies) {
            for (let i = 1; i < sortedHoldings[currency].length; i++) {
                expect(sortedHoldings[currency][i].date > sortedHoldings[currency][i - 1].date).toBeTruthy();
            }
        }
    });

    test('By Date no overflow', () => {
        const holdings: IHoldings = mockHoldings(
            faker.random.number(10) + 5, faker.random.number(10) + 5, faker.date.past(5), faker.date.recent(),
        );
        const currencies = Object.keys(holdings);

        const randomizedHoldings: IHoldings = {};
        for (const currency of currencies) {
            randomizedHoldings[currency] = [];
            for (const holding of holdings[currency]) {
                randomizedHoldings[currency].push(faker.helpers.randomize(holdings[currency]));
            }
        }

        const sortedHoldings = sortHoldings(holdings);
        for (const currency of currencies) {
            for (let i = 1; i < sortedHoldings[currency].length; i++) {
                expect(sortedHoldings[currency][i].date > sortedHoldings[currency][i - 1].date).toBeTruthy();
            }
        }
    });

});
