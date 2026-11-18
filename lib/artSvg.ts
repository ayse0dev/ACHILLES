const INK = "#1b1340";
const LEATHER = "#b9783f";
const DARK = "#8a5a36";
const SOLE = "#3a2a4a";
const ORANGE = "#ff7a3d";
const TEAL = "#19b3c4";
const PURPLE = "#8b3fc7";
const YELLOW = "#ffc83d";
const RED = "#e8374f";
const WHITE = "#ffffff";

export const productKinds = ["sneaker", "boot", "heel", "sandal", "oxford", "slipon", "cleaning"] as const;
export type ProductKind = (typeof productKinds)[number];

const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

type Shape = { upper: string; sole: string; heel: string; toe: string; details: string };

function shapeOf(kind: string, a: string, b: string): Shape {
    if (kind === "sneaker" || kind === "slipon") {
        const laces =
            kind === "slipon"
                ? `<path d="M64 52 L80 44 L96 56 L112 60" fill="none" stroke="${b}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
                : `<path d="M62 52 L70 44 M76 55 L84 47 M90 58 L98 50 M104 60 L112 52" fill="none" stroke="${WHITE}" stroke-width="4" stroke-linecap="round"/>`;
        return {
            upper: `<path d="M12 80 V38 Q12 28 22 28 H38 Q46 48 70 54 L112 60 Q156 66 162 80 Z" fill="${a}" ${S}/>`,
            sole: `<path d="M6 78 H166 V94 Q166 102 158 102 H14 Q6 102 6 94 Z" fill="${WHITE}" ${S}/><path d="M9 95 H163" stroke="${SOLE}" stroke-width="4" stroke-linecap="round"/>`,
            heel: "",
            toe: `<path d="M118 61 Q156 66 162 80 H112 Z" fill="${WHITE}" fill-opacity="0.55" ${S}/>`,
            details: `<path d="M20 28 Q24 18 36 20 L40 32" fill="${b}" ${S}/><path d="M26 68 Q68 74 112 64" fill="none" stroke="${b}" stroke-width="5" stroke-linecap="round"/>${laces}`,
        };
    }
    if (kind === "boot") {
        return {
            upper: `<path d="M14 86 V6 Q14 0 20 0 H64 Q70 0 70 6 V52 L112 60 Q158 68 164 86 V90 H14 Z" fill="${a}" ${S}/>`,
            sole: `<path d="M8 88 H168 V98 H8 Z" fill="${SOLE}" ${S}/>`,
            heel: `<path d="M8 98 H54 V110 H8 Z" fill="${SOLE}" ${S}/>`,
            toe: `<path d="M120 62 Q158 68 164 86 V90 H112 Z" fill="${b}" fill-opacity="0.35" ${S}/>`,
            details: `<path d="M14 14 H70" stroke="${b}" stroke-width="5" stroke-linecap="round"/><path d="M70 52 L112 60" stroke="${b}" stroke-width="4" stroke-linecap="round"/><path d="M26 26 H58 M26 40 H58" stroke="${INK}" stroke-opacity="0.35" stroke-width="3" stroke-linecap="round"/>`,
        };
    }
    if (kind === "heel") {
        return {
            upper: `<path d="M14 46 Q14 30 28 32 Q60 54 104 74 Q144 90 164 88 Q172 91 168 98 Q140 102 108 98 Q80 92 52 82 L46 80 Q14 72 14 46 Z" fill="${a}" ${S}/>`,
            sole: `<path d="M50 84 Q80 96 108 100 Q140 104 168 98" fill="none" stroke="${SOLE}" stroke-width="5" stroke-linecap="round"/>`,
            heel: `<path d="M30 76 L34 108 H42 L52 82 Z" fill="${SOLE}" ${S}/>`,
            toe: `<path d="M128 82 Q150 90 166 90 L168 98 Q146 100 124 96 Z" fill="${b}" ${S}/>`,
            details: `<path d="M28 34 Q34 44 30 58" fill="none" stroke="${b}" stroke-width="4" stroke-linecap="round"/><circle cx="82" cy="70" r="4" fill="${b}" stroke="${INK}" stroke-width="2"/>`,
        };
    }
    if (kind === "sandal") {
        return {
            upper: `<path d="M100 88 Q116 50 142 84" fill="none" stroke="${a}" stroke-width="12" stroke-linecap="round"/><path d="M40 88 Q34 52 66 48 L72 88" fill="none" stroke="${a}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M100 88 Q116 50 142 84" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="1 8" stroke-linecap="round"/>`,
            sole: `<path d="M8 96 Q8 86 24 86 L150 82 Q168 82 168 92 Q168 102 150 102 L24 104 Q8 104 8 96 Z" fill="${b}" ${S}/>`,
            heel: "",
            toe: `<path d="M110 84 Q122 62 140 82" fill="none" stroke="${WHITE}" stroke-opacity="0.6" stroke-width="5" stroke-linecap="round"/>`,
            details: `<rect x="60" y="44" width="16" height="14" rx="3" fill="${YELLOW}" ${S}/>`,
        };
    }
    return {
        upper: `<path d="M12 86 V40 Q12 30 22 30 H40 Q46 50 70 56 L112 62 Q158 68 164 86 V90 H12 Z" fill="${a}" ${S}/>`,
        sole: `<path d="M8 88 H168 V98 H8 Z" fill="${SOLE}" ${S}/>`,
        heel: `<path d="M8 98 H52 V108 H8 Z" fill="${SOLE}" ${S}/>`,
        toe: `<path d="M120 64 Q158 70 164 86 V90 H116 Z" fill="${b}" fill-opacity="0.3" ${S}/>`,
        details: `<path d="M22 30 Q26 22 38 24" fill="none" ${S}/><circle cx="74" cy="58" r="2.5" fill="${INK}"/><circle cx="88" cy="61" r="2.5" fill="${INK}"/><circle cx="102" cy="63" r="2.5" fill="${INK}"/><path d="M70 52 L80 62 M84 55 L94 65 M98 58 L108 66" stroke="${b}" stroke-width="3" stroke-linecap="round"/>`,
    };
}

function shoeGroup(kind: string, a: string, b: string, transform: string, extra = "") {
    const s = shapeOf(kind, a, b);
    const order = kind === "sandal" ? s.sole + s.upper + s.toe + s.details : s.heel + s.upper + s.toe + s.sole + s.details;
    return `<g transform="${transform}">${order}${extra}</g>`;
}

function sparkle(x: number, y: number, r: number, fill = YELLOW) {
    return `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z" fill="${fill}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
}

function bubbles(points: [number, number, number][]) {
    return points.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${WHITE}" fill-opacity="0.8" stroke="${TEAL}" stroke-width="2.5"/>`).join("");
}

function arrow(x1: number, y1: number, x2: number, y2: number, color = ORANGE) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = (d: number) => x2 - 9 * Math.cos(ang + d);
    const hy = (d: number) => y2 - 9 * Math.sin(ang + d);
    return `<path d="M${x1} ${y1} L${x2} ${y2} M${x2} ${y2} L${hx(0.5).toFixed(1)} ${hy(0.5).toFixed(1)} M${x2} ${y2} L${hx(-0.5).toFixed(1)} ${hy(-0.5).toFixed(1)}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function stitches(d: string, color = WHITE) {
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>`;
}

function needle(x: number, y: number) {
    return `<g transform="translate(${x} ${y}) rotate(-35)"><rect x="0" y="0" width="46" height="4" rx="2" fill="#d9dde6" stroke="${INK}" stroke-width="2"/><ellipse cx="4" cy="2" rx="2" ry="1.4" fill="${INK}"/><path d="M4 2 Q-12 8 -6 22" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/></g>`;
}

function brush(x: number, y: number, rotate = -30) {
    return `<g transform="translate(${x} ${y}) rotate(${rotate})"><rect x="0" y="0" width="46" height="12" rx="5" fill="${PURPLE}" stroke="${INK}" stroke-width="3"/><rect x="46" y="-3" width="20" height="18" rx="3" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/><path d="M50 15 V24 M56 15 V24 M62 15 V24" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>`;
}

function glue(x: number, y: number) {
    return `<g transform="translate(${x} ${y}) rotate(-20)"><rect x="0" y="10" width="26" height="40" rx="5" fill="${TEAL}" stroke="${INK}" stroke-width="3"/><path d="M8 10 L10 0 H16 L18 10" fill="${YELLOW}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="13" cy="62" r="4" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/></g>`;
}

function ruler(x: number, y: number, w: number) {
    const ticks = Array.from({ length: Math.floor(w / 10) }, (_, i) => `<path d="M${x + 6 + i * 10} ${y} v${i % 2 ? 6 : 10}" stroke="${INK}" stroke-width="2"/>`).join("");
    return `<rect x="${x}" y="${y}" width="${w}" height="16" rx="3" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/>${ticks}`;
}

function drops(points: [number, number][], color = TEAL) {
    return points.map(([x, y]) => `<path d="M${x} ${y} Q${x - 7} ${y + 12} ${x} ${y + 16} Q${x + 7} ${y + 12} ${x} ${y} Z" fill="${color}" stroke="${INK}" stroke-width="2"/>`).join("");
}

function dashed(d: string, color = ORANGE) {
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function highlightBox(d: string, color = ORANGE, opacity = 0.9) {
    return `<path d="${d}" fill="${color}" fill-opacity="${opacity}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
}

export function productSvg(kind: string, a: string, b: string): string {
    const k = (productKinds as readonly string[]).includes(kind) ? kind : "sneaker";
    const bg = `<defs><radialGradient id="g" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ece7f3"/></radialGradient></defs><rect width="200" height="200" fill="url(#g)"/><ellipse cx="100" cy="158" rx="70" ry="8" fill="${INK}" fill-opacity="0.12"/>`;
    if (k === "cleaning") {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${bg}
<g transform="translate(28 40)"><rect x="0" y="30" width="44" height="86" rx="10" fill="${a}" ${S}/><rect x="8" y="52" width="28" height="34" rx="4" fill="${WHITE}" fill-opacity="0.85" stroke="${INK}" stroke-width="2"/><path d="M12 62 H32 M12 70 H28" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path d="M8 30 V14 Q8 6 18 6 H38 V16 H22 V30" fill="${b}" ${S}/><path d="M38 6 L52 2" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>
<g transform="translate(78 100) rotate(-16) scale(0.9)"><rect x="0" y="22" width="70" height="20" rx="9" fill="${b}" ${S}/><rect x="52" y="6" width="44" height="52" rx="8" fill="${YELLOW}" ${S}/><path d="M58 58 V74 M68 58 V74 M78 58 V74 M88 58 V74" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>
${bubbles([[96, 40, 9], [116, 30, 6], [86, 22, 5], [150, 46, 7]])}</svg>`;
    }
    const scale = 1.0;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${bg}${shoeGroup(k, a, b, `translate(16 ${k === "boot" ? 34 : 48}) scale(${scale})`)}</svg>`;
}

export const repairKeys = [
    "heel-tip", "heel-replace", "half-sole", "full-sole", "restitch", "reglue", "patch", "lining", "insole", "stretch",
    "clean", "polish", "scuff", "redye", "waterproof", "zipper", "eyelet", "buckle", "gusset",
    "toe-tap", "sole-protect", "toe-plate", "heel-height", "shank", "boot-resole", "orthopedic",
    "sneaker-clean", "sneaker-restore", "midsole", "dance", "handbag", "suede", "full-restore", "vintage",
] as const;
export type RepairKey = (typeof repairKeys)[number];

export function repairKeyFor(service: string): RepairKey {
    const s = service.toLowerCase();
    const table: [RegExp, RepairKey][] = [
        [/heel tip|top lift/, "heel-tip"], [/heel replacement/, "heel-replace"], [/half sole/, "half-sole"], [/full sole/, "full-sole"],
        [/stitch/, "restitch"], [/glu/, "reglue"], [/patch/, "patch"], [/lining/, "lining"], [/insole/, "insole"], [/stretch/, "stretch"],
        [/sneaker deep/, "sneaker-clean"], [/suede|nubuck/, "suede"], [/cleaning/, "clean"], [/polish/, "polish"], [/scuff|scratch/, "scuff"],
        [/dye|color/, "redye"], [/waterproof/, "waterproof"], [/zipper/, "zipper"], [/eyelet/, "eyelet"], [/buckle|strap/, "buckle"], [/gusset|elastic/, "gusset"],
        [/toe tap|toe protector/, "toe-tap"], [/sole protector/, "sole-protect"], [/metal toe/, "toe-plate"], [/heel height/, "heel-height"], [/shank/, "shank"],
        [/boot resol|rebuild/, "boot-resole"], [/orthopedic/, "orthopedic"], [/sneaker restoration/, "sneaker-restore"], [/midsole/, "midsole"],
        [/dance/, "dance"], [/handbag|leather goods/, "handbag"], [/full shoe restoration/, "full-restore"], [/vintage/, "vintage"],
    ];
    for (const [re, key] of table) if (re.test(s)) return key;
    return "clean";
}

const BG: Record<string, string> = {
    general: "#e6f6f8",
    leather: "#f5ebdc",
    structure: "#eee4f7",
    sneaker: "#fde8dc",
};

function groupOf(key: RepairKey) {
    if (["heel-tip", "heel-replace", "half-sole", "full-sole", "restitch", "reglue", "patch", "lining", "insole", "stretch"].includes(key)) return "general";
    if (["clean", "polish", "scuff", "redye", "waterproof", "zipper", "eyelet", "buckle", "gusset"].includes(key)) return "leather";
    if (["toe-tap", "sole-protect", "toe-plate", "heel-height", "shank", "boot-resole", "orthopedic"].includes(key)) return "structure";
    return "sneaker";
}

export function repairSvg(key: string): string {
    const k = (repairKeys as readonly string[]).includes(key) ? (key as RepairKey) : "clean";
    const bg = BG[groupOf(k)];
    const base = (kind: string, a = LEATHER, b = DARK, extra = "") => shoeGroup(kind, a, b, "translate(14 24)", extra);
    let body = "";
    const sp = (x: number, y: number, r: number) => sparkle(x, y, r);

    switch (k) {
        case "heel-tip":
            body = base("oxford", LEATHER, DARK, highlightBox("M8 98 H52 V108 H8 Z", ORANGE)) + arrow(44, 132, 20, 116) + `<circle cx="30" cy="104" r="9" fill="${SOLE}" stroke="${INK}" stroke-width="3" transform="translate(14 24)"/>`;
            break;
        case "heel-replace":
            body = base("oxford", LEATHER, DARK, highlightBox("M8 98 H52 V108 H8 Z", ORANGE) + `<path d="M8 90 H52" stroke="${INK}" stroke-width="3" stroke-dasharray="4 4"/>`) + arrow(70, 138, 40, 124, TEAL);
            break;
        case "half-sole":
            body = base("oxford", LEATHER, DARK, highlightBox("M96 88 H168 V98 H96 Z", ORANGE)) + `<path d="M96 70 V120" stroke="${INK}" stroke-width="3" stroke-dasharray="5 4" transform="translate(14 24)"/>` + arrow(150, 28, 150, 62, ORANGE);
            break;
        case "full-sole":
            body = base("oxford", LEATHER, DARK, highlightBox("M8 88 H168 V98 H8 Z", ORANGE) + highlightBox("M8 98 H52 V108 H8 Z", ORANGE, 0.45)) + sp(150, 40, 9);
            break;
        case "restitch":
            body = base("oxford", LEATHER, DARK, stitches("M120 64 Q124 78 118 90", WHITE) + stitches("M16 84 H160", YELLOW)) + needle(120, 20);
            break;
        case "reglue":
            body = base("oxford", LEATHER, DARK, drops([[128, 92], [142, 94]], YELLOW) + `<path d="M118 88 H166" stroke="${YELLOW}" stroke-width="4" stroke-dasharray="4 3"/>`) + glue(150, 4);
            break;
        case "patch":
            body = base("oxford", LEATHER, DARK, `<rect x="58" y="62" width="30" height="22" rx="3" fill="${TEAL}" stroke="${INK}" stroke-width="3" transform="rotate(-6 73 73)"/>` + stitches("M62 66 H84 V80 H62 Z", WHITE)) + needle(112, 28);
            break;
        case "lining":
            body = base("boot", LEATHER, DARK, `<path d="M20 4 H64 V50 H20 Z" fill="${PURPLE}" fill-opacity="0.85" stroke="${INK}" stroke-width="3"/><path d="M26 14 L58 14 M26 26 L58 26 M26 38 L58 38" stroke="${WHITE}" stroke-opacity="0.6" stroke-width="3" stroke-linecap="round"/>`) + sp(130, 36, 9);
            break;
        case "insole":
            body = `<g transform="translate(24 28) rotate(-8)"><path d="M10 50 Q4 30 22 20 Q40 10 62 22 Q96 40 130 38 Q156 36 156 56 Q156 76 126 80 Q80 86 40 78 Q12 72 10 50 Z" fill="${TEAL}" stroke="${INK}" stroke-width="3"/><path d="M30 52 Q60 40 100 52 Q130 60 142 56" fill="none" stroke="${WHITE}" stroke-width="4" stroke-linecap="round" stroke-opacity="0.8"/><path d="M26 44 Q22 36 30 32" fill="none" stroke="${INK}" stroke-width="2"/></g>` + sp(158, 36, 8) + arrow(100, 124, 100, 108, ORANGE);
            break;
        case "stretch":
            body = base("oxford") + ruler(20, 134, 150) + arrow(24, 20, 6, 20, TEAL) + arrow(150, 20, 176, 20, TEAL);
            break;
        case "clean":
            body = base("oxford") + bubbles([[40, 34, 9], [70, 24, 6], [104, 38, 8], [140, 30, 6], [92, 18, 5]]) + brush(116, 52, -25);
            break;
        case "polish":
            body = base("oxford", "#7a4a26", "#3a2a1a") + sp(70, 36, 12) + sp(112, 54, 8) + sp(40, 60, 7) + `<g transform="translate(138 100)"><ellipse cx="22" cy="14" rx="22" ry="8" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/><path d="M0 14 V28 Q22 40 44 28 V14" fill="${RED}" stroke="${INK}" stroke-width="3"/></g>`;
            break;
        case "scuff":
            body = base("oxford", LEATHER, DARK, `<path d="M64 44 L84 56 M70 40 L92 54 M60 50 L78 60" stroke="${INK}" stroke-opacity="0.65" stroke-width="3" stroke-linecap="round"/>`) + arrow(120, 34, 94, 56, TEAL) + sp(130, 28, 9);
            break;
        case "redye":
            body = base("oxford", RED, "#7a1c2a") + `<g transform="translate(120 12) rotate(20)"><rect x="0" y="0" width="12" height="40" rx="4" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/><path d="M0 40 H12 L10 54 H2 Z" fill="${PURPLE}" stroke="${INK}" stroke-width="3"/></g>` + drops([[60, 20], [82, 12]], PURPLE);
            break;
        case "waterproof":
            body = base("boot") + drops([[30, 14], [60, 8], [92, 14], [124, 10], [150, 18]], TEAL) + `<path d="M40 38 H160" stroke="${TEAL}" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" transform="translate(0 0)"/>`;
            break;
        case "zipper":
            body = base("boot", LEATHER, DARK, `<path d="M42 4 V50" stroke="#c9ced8" stroke-width="7" stroke-dasharray="4 3"/><path d="M42 4 V50" stroke="${INK}" stroke-width="2"/><rect x="36" y="24" width="12" height="16" rx="3" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/>`);
            break;
        case "eyelet":
            body = base("sneaker", LEATHER, DARK, `<circle cx="66" cy="50" r="5" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/><circle cx="80" cy="54" r="5" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/><circle cx="94" cy="57" r="5" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/><circle cx="108" cy="60" r="5" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/>`) + sp(150, 26, 9);
            break;
        case "buckle":
            body = base("sandal", TEAL, LEATHER) + `<g transform="translate(66 40)"><rect x="0" y="0" width="26" height="22" rx="4" fill="none" stroke="${INK}" stroke-width="5"/><rect x="0" y="0" width="26" height="22" rx="4" fill="none" stroke="${YELLOW}" stroke-width="2"/><path d="M13 -2 V24" stroke="${INK}" stroke-width="4"/></g>`;
            break;
        case "gusset":
            body = base("boot", LEATHER, DARK, `<path d="M14 40 H70 V58 H14 Z" fill="${INK}" fill-opacity="0.85"/><path d="M14 46 H70 M14 52 H70" stroke="${TEAL}" stroke-width="2" stroke-dasharray="4 3"/>`) + arrow(14, 126, 4, 126, ORANGE) + arrow(80, 126, 92, 126, ORANGE);
            break;
        case "toe-tap":
            body = base("oxford", LEATHER, DARK, highlightBox("M126 70 Q158 76 164 88 V94 H122 Z", "#c9ced8")) + sp(152, 40, 9);
            break;
        case "sole-protect":
            body = base("oxford", LEATHER, DARK, highlightBox("M8 98 H168 V104 H8 Z", RED, 0.95)) + arrow(90, 22, 90, 48, ORANGE);
            break;
        case "toe-plate":
            body = base("boot", LEATHER, DARK, highlightBox("M124 70 Q158 76 164 88 V92 H120 Z", "#aeb6c6")) + sp(140, 44, 10) + sp(166, 68, 6);
            break;
        case "heel-height":
            body = base("heel") + `<g transform="translate(0 0)"><path d="M18 36 H6 M12 36 V118 M6 118 H18" fill="none" stroke="${INK}" stroke-width="3"/></g>` + arrow(184, 116, 184, 76, ORANGE) + arrow(184, 76, 184, 116, ORANGE);
            break;
        case "shank":
            body = base("oxford", LEATHER, DARK, `<path d="M0 78 H176" stroke="none"/>`) + `<rect x="40" y="112" width="96" height="8" rx="3" fill="#aeb6c6" stroke="${INK}" stroke-width="3"/><path d="M52 116 H124" stroke="${WHITE}" stroke-width="2" stroke-dasharray="6 6"/>` + sp(150, 34, 8);
            break;
        case "boot-resole":
            body = base("boot", LEATHER, DARK, highlightBox("M8 88 H168 V98 H8 Z", ORANGE) + highlightBox("M8 98 H54 V110 H8 Z", ORANGE, 0.5)) + sp(130, 40, 10);
            break;
        case "orthopedic":
            body = `<g transform="translate(24 28) rotate(-8)"><path d="M10 50 Q4 30 22 20 Q40 10 62 22 Q96 40 130 38 Q156 36 156 56 Q156 76 126 80 Q80 86 40 78 Q12 72 10 50 Z" fill="${PURPLE}" fill-opacity="0.9" stroke="${INK}" stroke-width="3"/><path d="M34 62 Q70 38 110 60" fill="none" stroke="${YELLOW}" stroke-width="7" stroke-linecap="round"/></g>` + sp(160, 28, 8);
            break;
        case "sneaker-clean":
            body = base("sneaker", WHITE, TEAL) + bubbles([[40, 30, 9], [74, 20, 6], [110, 30, 8], [146, 22, 6]]) + brush(112, 44, -25);
            break;
        case "sneaker-restore":
            body = base("sneaker", ORANGE, INK) + sp(60, 22, 11) + sp(120, 34, 9) + sp(150, 56, 7) + brush(130, 96, -10);
            break;
        case "midsole":
            body = base("sneaker", "#6b8be8", INK, `<path d="M6 78 H166 V96 Q166 102 158 102 H14 Q6 102 6 94 Z" fill="${ORANGE}" fill-opacity="0.9" stroke="${INK}" stroke-width="3"/>`) + arrow(90, 138, 90, 124, TEAL);
            break;
        case "dance":
            body = base("heel", "#e8374f", "#ffc83d", `<path d="M28 36 Q10 20 14 6 M28 36 Q40 14 56 12" fill="none" stroke="${YELLOW}" stroke-width="4" stroke-linecap="round"/>`) + sp(150, 40, 9) + sp(170, 74, 6);
            break;
        case "handbag":
            body = `<g transform="translate(34 18)"><path d="M32 40 Q32 4 66 4 Q100 4 100 40" fill="none" stroke="${DARK}" stroke-width="9" stroke-linecap="round"/><path d="M8 44 H124 L116 118 Q115 124 108 124 H24 Q17 124 16 118 Z" fill="${LEATHER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="52" y="52" width="28" height="18" rx="4" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/>${stitches("M20 56 H44 M88 56 H112", WHITE)}</g>` + needle(124, 40);
            break;
        case "suede":
            body = base("oxford", "#a9794f", "#5d3a22", Array.from({ length: 22 }, (_, i) => `<circle cx="${20 + ((i * 37) % 120)}" cy="${40 + ((i * 23) % 44)}" r="1.6" fill="${INK}" fill-opacity="0.35"/>`).join("")) + brush(110, 30, -20) + bubbles([[44, 26, 7], [64, 16, 5]]);
            break;
        case "full-restore":
            body = base("boot", "#8a5a36", "#3a2a1a") + sp(40, 18, 11) + sp(110, 30, 9) + sp(148, 56, 7) + brush(104, 114, -8);
            break;
        case "vintage":
            body = base("oxford", "#a37a4d", "#5d3a22") + `<g transform="translate(138 10)"><circle cx="22" cy="22" r="20" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/><path d="M22 10 V22 L30 28" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>` + sp(30, 22, 8);
            break;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect width="200" height="150" fill="${bg}"/><circle cx="100" cy="150" r="90" fill="${WHITE}" fill-opacity="0.55"/>${body}</svg>`;
}
