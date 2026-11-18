"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap, CircleMarker } from "leaflet";

type Point = { lat: number; lng: number } | null;

export default function MapPin({ value, onChange }: { value: Point; onChange: (p: Point) => void }) {
    const el = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<CircleMarker | null>(null);
    const lastRef = useRef<Point>(value);
    const changeRef = useRef(onChange);
    const valueRef = useRef<Point>(value);

    useEffect(() => {
        changeRef.current = onChange;
        valueRef.current = value;
    });

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !value) return;
        const last = lastRef.current;
        if (last && Math.abs(last.lat - value.lat) < 1e-7 && Math.abs(last.lng - value.lng) < 1e-7) return;
        lastRef.current = value;
        import("leaflet").then((L) => {
            if (markerRef.current) markerRef.current.setLatLng([value.lat, value.lng]);
            else
                markerRef.current = L.circleMarker([value.lat, value.lng], {
                    radius: 10,
                    color: "#1b1340",
                    weight: 3,
                    fillColor: "#ff7a3d",
                    fillOpacity: 1,
                }).addTo(map);
            map.setView([value.lat, value.lng], 17);
        });
    }, [value]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const L = await import("leaflet");
            if (cancelled || !el.current || mapRef.current) return;
            const start = valueRef.current;
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

    return (
        <div className="space-y-2">
            <div ref={el} className="h-56 w-full rounded-2xl border-2 border-ink overflow-hidden z-0" />
            <p className="text-xs text-ink/60">{value ? `Pin set (${value.lat.toFixed(5)}, ${value.lng.toFixed(5)})` : "Tap the map to drop a pin (optional)."}</p>
        </div>
    );
}
