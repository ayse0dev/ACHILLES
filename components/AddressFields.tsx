"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const MapPin = dynamic(() => import("./MapPin"), {
    ssr: false,
    loading: () => <div className="h-56 w-full rounded-2xl border-2 border-ink/20 bg-ink/5" />,
});

export type AddressDraft = {
    label: string;
    regionCode: string;
    region: string;
    cityCode: string;
    municipality: string;
    barangay: string;
    street: string;
    lat: number | null;
    lng: number | null;
};

export const emptyDraft: AddressDraft = {
    label: "",
    regionCode: "",
    region: "",
    cityCode: "",
    municipality: "",
    barangay: "",
    street: "",
    lat: null,
    lng: null,
};

export function draftComplete(d: AddressDraft) {
    return !!(d.region && d.municipality && d.barangay && d.street.trim().length >= 3);
}

type Item = { code: string; name: string };

async function load(query: string): Promise<Item[]> {
    try {
        const res = await fetch(`/api/psgc?${query}`);
        if (!res.ok) return [];
        return ((await res.json()) as { items: Item[] }).items;
    } catch {
        return [];
    }
}

export default function AddressFields({
    value,
    onChange,
    withLabel = false,
}: {
    value: AddressDraft;
    onChange: (next: AddressDraft) => void;
    withLabel?: boolean;
}) {
    const [regions, setRegions] = useState<Item[]>([]);
    const [cities, setCities] = useState<Item[]>([]);
    const [barangays, setBarangays] = useState<Item[]>([]);
    const [loading, setLoading] = useState("");

    useEffect(() => {
        let stop = false;
        load("type=regions").then((items) => {
            if (!stop) setRegions(items);
        });
        return () => {
            stop = true;
        };
    }, []);

    useEffect(() => {
        if (!value.regionCode) return;
        let stop = false;
        load(`type=cities&parent=${value.regionCode}`).then((items) => {
            if (!stop) {
                setCities(items);
                setLoading("");
            }
        });
        return () => {
            stop = true;
        };
    }, [value.regionCode]);

    useEffect(() => {
        if (!value.cityCode) return;
        let stop = false;
        load(`type=barangays&parent=${value.cityCode}`).then((items) => {
            if (!stop) {
                setBarangays(items);
                setLoading("");
            }
        });
        return () => {
            stop = true;
        };
    }, [value.cityCode]);

    const pickRegion = (code: string) => {
        const item = regions.find((r) => r.code === code);
        setCities([]);
        setBarangays([]);
        setLoading(code ? "cities" : "");
        onChange({ ...value, regionCode: code, region: item?.name ?? "", cityCode: "", municipality: "", barangay: "" });
    };

    const pickCity = (code: string) => {
        const item = cities.find((c) => c.code === code);
        setBarangays([]);
        setLoading(code ? "barangays" : "");
        onChange({ ...value, cityCode: code, municipality: item?.name ?? "", barangay: "" });
    };

    const pickPin = useCallback(
        (p: { lat: number; lng: number } | null) => onChange({ ...value, lat: p?.lat ?? null, lng: p?.lng ?? null }),
        [onChange, value]
    );

    return (
        <div className="space-y-3">
            {withLabel && (
                <input
                    value={value.label}
                    onChange={(e) => onChange({ ...value, label: e.target.value })}
                    placeholder="Label (e.g. Office, Mom's house)"
                    maxLength={40}
                    className="field !py-2"
                />
            )}
            <select value={value.regionCode} onChange={(e) => pickRegion(e.target.value)} className="field !py-2" aria-label="Region">
                <option value="">Region</option>
                {regions.map((r) => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                ))}
            </select>
            <select
                value={value.cityCode}
                onChange={(e) => pickCity(e.target.value)}
                disabled={!value.regionCode}
                className="field !py-2 disabled:opacity-50"
                aria-label="Municipality or city"
            >
                <option value="">{loading === "cities" ? "Loading..." : "Municipality / City"}</option>
                {cities.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                ))}
            </select>
            <select
                value={value.barangay}
                onChange={(e) => onChange({ ...value, barangay: e.target.value })}
                disabled={!value.cityCode}
                className="field !py-2 disabled:opacity-50"
                aria-label="Barangay"
            >
                <option value="">{loading === "barangays" ? "Loading..." : "Barangay"}</option>
                {barangays.map((b) => (
                    <option key={b.code} value={b.name}>{b.name}</option>
                ))}
            </select>
            <input
                value={value.street}
                onChange={(e) => onChange({ ...value, street: e.target.value })}
                placeholder="House no., street, subdivision"
                maxLength={200}
                className="field !py-2"
            />
            <MapPin value={value.lat !== null && value.lng !== null ? { lat: value.lat, lng: value.lng } : null} onChange={pickPin} />
        </div>
    );
}
