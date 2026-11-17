import { base } from "./airtable";

export async function findUserByEmail(email: string) {
    const escaped = email.replace(/"/g, '""');
    const records = await base("Users")
        .select({
            filterByFormula: `LOWER({Email}) = LOWER("${escaped}")`,
            maxRecords: 1,
        })
        .firstPage();

    return records[0] ?? null;
}

export function normalizeUsername(value: string) {
    return value.trim().toLowerCase();
}

export async function findUserByUsername(username: string) {
    const records = await base("Users")
        .select({
            filterByFormula: `LOWER({Username}) = ${JSON.stringify(normalizeUsername(username))}`,
            maxRecords: 1,
        })
        .firstPage();

    return records[0] ?? null;
}

export async function findUserByIdentifier(identifier: string) {
    const value = identifier.trim();
    return value.includes("@") ? findUserByEmail(value) : findUserByUsername(value);
}
