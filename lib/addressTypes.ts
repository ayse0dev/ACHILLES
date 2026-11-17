import { z } from "zod";

export type Address = {
    id: string;
    label: string;
    region: string;
    municipality: string;
    barangay: string;
    street: string;
    lat: number | null;
    lng: number | null;
    home: boolean;
};

export const addressSchema = z.object({
    label: z.string().trim().max(40).default(""),
    region: z.string().trim().min(2).max(120),
    municipality: z.string().trim().min(2).max(120),
    barangay: z.string().trim().min(2).max(120),
    street: z.string().trim().min(3).max(200),
    lat: z.number().min(4).max(22).nullable().default(null),
    lng: z.number().min(116).max(128).nullable().default(null),
});

export type AddressInput = z.infer<typeof addressSchema>;

export function addressLine(a: Pick<Address, "street" | "barangay" | "municipality" | "region">): string {
    return [a.street, `Brgy. ${a.barangay}`, a.municipality, a.region].filter(Boolean).join(", ");
}
