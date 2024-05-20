export function randomBetween(lower:number, upper:number):number {
    return Math.random() * (upper - lower) + lower;
}
