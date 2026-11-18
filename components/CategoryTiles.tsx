import Link from "next/link";
import { shopCategories } from "@/lib/business";

const gradients = [
    "linear-gradient(160deg,#19b3c4,#1b1340)",
    "linear-gradient(160deg,#8b3fc7,#1b1340)",
    "linear-gradient(160deg,#ff7a3d,#8b3fc7)",
    "linear-gradient(160deg,#19b3c4,#ffc83d)",
    "linear-gradient(160deg,#ffc83d,#e8374f)",
    "linear-gradient(160deg,#e8374f,#1b1340)",
];

export default function CategoryTiles() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {shopCategories.map((c, i) => (
                <Link
                    key={c.label}
                    href={c.href}
                    className="group relative aspect-square rounded-none overflow-hidden flex flex-col justify-end p-4 text-white hover:-translate-y-1 transition duration-300"
                    style={{ background: gradients[i % gradients.length] }}
                >
                    <span className="uppercase font-black text-base leading-tight tracking-tight group-hover:underline">{c.label}</span>
                    <span className="text-[11px] leading-snug text-white/85 line-clamp-3">{c.text}</span>
                </Link>
            ))}
        </div>
    );
}
