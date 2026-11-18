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

type Geo = { regions: string[]; cities: string[]; barangays: string[]; street: string };

function norm(s: string) {
    return s
        .toLowerCase()
        .replace(/\(.*?\)/g, " ")
        .replace(/city of|municipality of|\bcity\b|barangay|brgy\.?|\bregion\b/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function matchItem(items: Item[], candidates: string[]): Item | null {
    const wanted = candidates.map(norm).filter(Boolean);
    for (const w of wanted) {
        const exact = items.find((i) => norm(i.name) === w);
        if (exact) return exact;
    }
    for (const w of wanted) {
        const partial = items.find((i) => {
            const n = norm(i.name);
            return n && (n.includes(w) || w.includes(n));
        });
        if (partial) return partial;
    }
    return null;
}

function matchRegion(items: Item[], candidates: string[]): Item | null {
    const ncr = candidates.some((c) => /metro manila|national capital|manila/i.test(c));
    if (ncr) return items.find((i) => /national capital/i.test(i.name)) ?? null;
    return matchItem(items, candidates);
}

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
    const [locating, setLocating] = useState(false);
    const [note, setNote] = useState("");

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


    const fillFrom = useCallback(
        async (lat: number, lng: number) => {
            setNote("");
            let geo: Geo | null = null;
            try {
                const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
                if (res.ok) geo = (await res.json()) as Geo;
            } catch {
                geo = null;
            }
            const base = { ...value, lat, lng };
            if (!geo) {
                onChange(base);
                setNote("Pin saved. We could not auto-fill the address, please choose it below.");
                return;
            }
            const region = matchRegion(regions, geo.regions);
            if (!region) {
                onChange({ ...base, street: value.street || geo.street });
                setNote("Pin saved. Please choose your region, municipality and barangay below.");
                return;
            }
            const cityList = await load(`type=cities&parent=${region.code}`);
            const city = matchItem(cityList, geo.cities);
            let barangayList: Item[] = [];
            let barangay: Item | null = null;
            if (city) {
                barangayList = await load(`type=barangays&parent=${city.code}`);
                barangay = matchItem(barangayList, geo.barangays);
            }
            setCities(cityList);
            setBarangays(barangayList);
            onChange({
                ...base,
                regionCode: region.code,
                region: region.name,
                cityCode: city?.code ?? "",
                municipality: city?.name ?? "",
                barangay: barangay?.name ?? "",
                street: value.street || geo.street,
            });
            setNote(
                city && barangay
                    ? "Address filled from your location. Please check it and add your house number."
                    : "Pin saved and address partly filled. Please complete the rest below."
            );
        },
        [regions, value, onChange]
    );

    const useGps = () => {
        if (!navigator.geolocation) {
            setNote("Your browser cannot share location. Tap the map instead.");
            return;
        }
        setLocating(true);
        setNote("");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                await fillFrom(pos.coords.latitude, pos.coords.longitude);
                setLocating(false);
            },
            (err) => {
                setNote(
                    err.code === err.PERMISSION_DENIED
                        ? "Location is blocked. Allow location for this site in your browser, or tap the map to drop a pin."
                        : "Could not get your location. Tap the map to drop a pin."
                );
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 12000 }
        );
    };

    const pickPin = useCallback(
        (p: { lat: number; lng: number } | null) => {
            if (p) void fillFrom(p.lat, p.lng);
            else onChange({ ...value, lat: null, lng: null });
        },
        [fillFrom, onChange, value]
    );

    return (
        <div className="space-y-3">
            <button type="button" onClick={useGps} disabled={locating} className="btn btn-accent w-full !py-2 text-sm disabled:opacity-60">
                {locating ? "Finding you..." : "📍 Use my location (GPS) and fill in automatically"}
            </button>
            {note && <p className="text-xs font-bold text-ink/70">{note}</p>}
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
