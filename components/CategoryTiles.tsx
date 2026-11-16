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
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {shopCategories.map((c, i) => (
                <Link
                    key={c.label}
                    href={c.href}
                    className="group relative aspect-[4/5] rounded-3xl overflow-hidden flex flex-col justify-end p-5 text-white hover:-translate-y-1 transition duration-300"
                    style={{ background: gradients[i % gradients.length] }}
                >
                    <span className="uppercase font-black text-xl tracking-tight group-hover:underline">{c.label}</span>
                    <span className="text-xs text-white/85">{c.text}</span>
                </Link>
            ))}
        </div>
    );
}
