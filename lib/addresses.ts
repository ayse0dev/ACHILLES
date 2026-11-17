import { base } from "./airtable";
import { formulaString } from "./formula";
import type { Address, AddressInput } from "./addressTypes";

type Fields = {
    Email?: string;
    Label?: string;
    Region?: string;
    Municipality?: string;
    Barangay?: string;
    Street?: string;
    Lat?: number;
    Lng?: number;
    Home?: boolean;
};

export function toAddress(r: { id: string; fields: Fields }): Address {
    const f = r.fields;
    return {
        id: r.id,
        label: f.Label ?? "",
        region: f.Region ?? "",
        municipality: f.Municipality ?? "",
        barangay: f.Barangay ?? "",
        street: f.Street ?? "",
        lat: typeof f.Lat === "number" ? f.Lat : null,
        lng: typeof f.Lng === "number" ? f.Lng : null,
        home: !!f.Home,
    };
}

export async function listAddresses(email: string): Promise<Address[]> {
    try {
        const records = await base("Addresses")
            .select({ filterByFormula: `LOWER({Email}) = LOWER(${formulaString(email)})`, maxRecords: 30 })
            .firstPage();
        return records
            .map((r) => toAddress(r as unknown as { id: string; fields: Fields }))
            .sort((a, b) => Number(b.home) - Number(a.home));
    } catch {
        return [];
    }
}

export async function findOwnedAddress(email: string, id: string): Promise<Address | null> {
    try {
        const r = await base("Addresses").find(id);
        const f = r.fields as Fields;
        if ((f.Email ?? "").toLowerCase() !== email.toLowerCase()) return null;
        return toAddress(r as unknown as { id: string; fields: Fields });
    } catch {
        return null;
    }
}

export function addressFields(email: string, a: AddressInput, home: boolean) {
    return {
        Email: email.toLowerCase(),
        Label: a.label,
        Region: a.region,
        Municipality: a.municipality,
        Barangay: a.barangay,
        Street: a.street,
        ...(a.lat !== null && a.lng !== null ? { Lat: a.lat, Lng: a.lng } : {}),
        Home: home,
    };
}
