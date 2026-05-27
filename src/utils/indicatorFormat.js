export function toIndicatorFormat(num) {
    if (num < 1000) return num;

    const tiers = [
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'K' },
    ]

    const tier = tiers.find(t => num >= t.value);
    if (!tier) return num;

    let result = num / tier.value;
    return result.toFixed(1).replace(/\.0$/, '') + tier.suffix;
}