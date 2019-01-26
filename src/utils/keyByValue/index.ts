export default function keyByValue(value: any, object: object) {
    const keys = Object.keys(object);
    for (const key of keys) {
        if (object[key] === value) {
            return key;
        }
    }
    return undefined;
}
