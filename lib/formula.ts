export function formulaString(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}
