export interface IItem {
    date: number;
}

export default function getYears<T extends IItem>(items: T[]) {
    const years: string[] = [];
    items.forEach((item) => {
        const year = new Date(item.date).getFullYear();
        if (years.indexOf(year.toString()) === -1) {
            years.push(year.toString());
        }
    });
    return years;
}
