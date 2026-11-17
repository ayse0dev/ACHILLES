"use client";

export default function PhoneInput({
    value,
    onChange,
    name,
    required = true,
}: {
    value: string;
    onChange: (v: string) => void;
    name?: string;
    required?: boolean;
}) {
    return (
        <div className="flex items-stretch rounded-xl border-2 border-ink overflow-hidden bg-white">
            <span className="px-3 flex items-center text-sm font-bold bg-ink/5 border-r-2 border-ink">+63</span>
            <input
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 14))}
                inputMode="tel"
                placeholder="9xx-xxx-xxxx"
                required={required}
                className="flex-1 px-3 py-2 outline-none bg-transparent"
                aria-label="Mobile number"
            />
        </div>
    );
}
