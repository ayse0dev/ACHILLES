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
