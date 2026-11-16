const artwork = [
    "/products/glitch-core.jpg",
    "/products/tech-strike.jpg",
    "/products/pixel-flow.jpg",
    "/products/dark-circuit.jpg",
    "/products/neon-byte.jpg",
    "/products/cyber-motion.jpg",
];

function artworkFor(name: string) {
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return artwork[hash % artwork.length];
}

export default function ProductArt({ name, className = "" }: { name: string; className?: string }) {
    return (
        <img
            src={artworkFor(name || "shoe")}
            alt={name}
            className={`w-full h-full object-cover ${className}`}
        />
    );
}
