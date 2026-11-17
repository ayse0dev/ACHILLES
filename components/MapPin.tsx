"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, CircleMarker } from "leaflet";

type Point = { lat: number; lng: number } | null;

export default function MapPin({ value, onChange }: { value: Point; onChange: (p: Point) => void }) {
    const el = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<CircleMarker | null>(null);
    const lastRef = useRef<Point>(value);
    const changeRef = useRef(onChange);

    useEffect(() => {
        changeRef.current = onChange;
    });
    const [locating, setLocating] = useState(false);
    const [note, setNote] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const L = await import("leaflet");
            if (cancelled || !el.current || mapRef.current) return;
            const start = lastRef.current;
            const map = L.map(el.current, { scrollWheelZoom: false }).setView(start ? [start.lat, start.lng] : [12.88, 121.77], start ? 16 : 5);
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);
            const place = (lat: number, lng: number) => {
                if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
                else
                    markerRef.current = L.circleMarker([lat, lng], {
                        radius: 10,
                        color: "#1b1340",
                        weight: 3,
                        fillColor: "#ff7a3d",
                        fillOpacity: 1,
                    }).addTo(map);
            };
            if (start) place(start.lat, start.lng);
            map.on("click", (e) => {
                place(e.latlng.lat, e.latlng.lng);
                lastRef.current = { lat: e.latlng.lat, lng: e.latlng.lng };
                changeRef.current(lastRef.current);
            });
            mapRef.current = map;
        })();
        return () => {
            cancelled = true;
            mapRef.current?.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    const locate = () => {
        if (!navigator.geolocation) {
            setNote("Your browser cannot share location. Tap the map instead.");
            return;
        }
        setLocating(true);
        setNote("");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const L = await import("leaflet");
                const map = mapRef.current;
                if (map) {
                    map.setView([latitude, longitude], 17);
                    if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
                    else
                        markerRef.current = L.circleMarker([latitude, longitude], {
                            radius: 10,
                            color: "#1b1340",
                            weight: 3,
                            fillColor: "#ff7a3d",
                            fillOpacity: 1,
                        }).addTo(map);
                }
                lastRef.current = { lat: latitude, lng: longitude };
                changeRef.current(lastRef.current);
                setLocating(false);
            },
            () => {
                setNote("Could not get your location. Tap the map to drop a pin.");
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="space-y-2">
            <div ref={el} className="h-56 w-full rounded-2xl border-2 border-ink overflow-hidden z-0" />
            <div className="flex flex-wrap items-center gap-3 text-xs">
                <button type="button" onClick={locate} disabled={locating} className="underline font-bold">
                    {locating ? "Locating..." : "Use my current location"}
                </button>
                <span className="text-ink/60">{value ? `Pin set (${value.lat.toFixed(5)}, ${value.lng.toFixed(5)})` : "Tap the map to drop a pin (optional)."}</span>
            </div>
            {note && <p className="text-xs text-red">{note}</p>}
        </div>
    );
}
