import { PDFDocument, PDFFont, PDFPage, StandardFonts, degrees, rgb } from "pdf-lib";
import { base } from "./airtable";
import { formulaString } from "./formula";
import { contact } from "./business";
import { isStaff } from "./roles";

export const PAID_STATUSES = ["Paid", "Packed", "Shipped", "Delivered"];
export const REPAIR_DONE = "Completed";

export type ReceiptLine = { name: string; qty: number; unit: number | null };

export type Receipt = {
    kind: "order" | "repair";
    title: string;
    noteLabel: string;
    note: string;
    reference: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    status: string;
    paymentMethod: string;
    paymentRef: string;
    discount: string;
    voucher: string;
    voucherOff: number;
    total: number;
    lines: ReceiptLine[];
};

type Fields = {
    Reference?: string;
    Email?: string;
    Name?: string;
    Phone?: string;
    Address?: string;
    CreatedAt?: string;
    Status?: string;
    PaymentMethod?: string;
    PaymentRef?: string;
    Discount?: string;
    Voucher?: string;
    VoucherOff?: number;
    Total?: number;
    Items?: string;
    Lines?: string;
};

export function paymentLabel(method: string): string {
    if (method === "online") return "GCash / Maya / Card (PayMongo)";
    if (method === "banking") return "Online banking (PayMongo)";
    if (method === "bank_transfer") return "Bank transfer";
    if (method === "cod") return "Cash on delivery";
    return method || "Online payment";
}

export function discountLabel(d: string): string {
    if (d === "student") return "Student discount (20%)";
    if (d === "senior") return "Senior citizen discount (20%)";
    if (d === "pwd") return "PWD discount (20%)";
    return "";
}

function parseLines(f: Fields): ReceiptLine[] {
    if (f.Lines) {
        try {
            const raw = JSON.parse(f.Lines) as { name: string; qty: number; unit: number }[];
            if (Array.isArray(raw)) return raw.map((l) => ({ name: String(l.name), qty: Number(l.qty), unit: Number(l.unit) }));
        } catch {
            void 0;
        }
    }
    const items = f.Items ?? "";
    return items
        .split(/,\s(?=[^,]+ x\d+(?:,|$))/)
        .map((part) => {
            const m = /^(.*) x(\d+)$/.exec(part.trim());
            return m ? { name: m[1], qty: Number(m[2]), unit: null } : { name: part.trim(), qty: 1, unit: null };
        })
        .filter((l) => l.name);
}

export function isReceiptReady(r: { kind: "order" | "repair"; status: string; total: number }): boolean {
    return r.kind === "repair" ? r.status === REPAIR_DONE && r.total > 0 : PAID_STATUSES.includes(r.status);
}

type RepairFields = {
    Reference?: string;
    Email?: string;
    Name?: string;
    Phone?: string;
    ShoeDescription?: string;
    Issue?: string;
    Status?: string;
    Quote?: number;
    SubmittedAt?: string;
    UserId?: string;
};

export function repairServices(issue: string): string[] {
    const m = /^(?:Services|Service requested):\s*(.+)$/m.exec(issue);
    return m ? m[1].split(/;\s*/).filter(Boolean) : [];
}

export function repairPayment(issue: string): string {
    const m = /^Payment preference:\s*(.+)$/m.exec(issue);
    return m ? m[1].trim() : "Paid at the shop";
}

async function loadRepairReceipt(reference: string, viewer: { email: string; role: string; id?: string }): Promise<Receipt | null> {
    const found = await base("RepairRequests")
        .select({ filterByFormula: `{Reference} = ${formulaString(reference)}`, maxRecords: 1 })
        .firstPage();
    if (found.length === 0) return null;
    const f = found[0].fields as RepairFields;
    const owner = (f.Email ?? "").toLowerCase() === viewer.email.toLowerCase() || (!!viewer.id && f.UserId === viewer.id);
    if (!owner && !isStaff(viewer.role)) return null;
    const issue = f.Issue ?? "";
    const services = repairServices(issue);
    return {
        kind: "repair",
        title: "SERVICE RECEIPT",
        noteLabel: "Shoe",
        note: f.ShoeDescription ?? "",
        reference,
        name: f.Name ?? "",
        email: f.Email ?? "",
        phone: f.Phone ?? "",
        createdAt: f.SubmittedAt ?? "",
        status: f.Status ?? "",
        paymentMethod: repairPayment(issue),
        paymentRef: "",
        discount: "",
        voucher: "",
        voucherOff: 0,
        total: Number(f.Quote ?? 0),
        lines: (services.length ? services : [f.ShoeDescription ?? "Repair service"]).map((name) => ({ name, qty: 1, unit: null })),
    };
}

export async function loadReceipt(reference: string, viewer: { email: string; role: string; id?: string }): Promise<Receipt | null> {
    if (/^RP-[A-Z0-9]{6}$/.test(reference)) return loadRepairReceipt(reference, viewer);
    if (!/^OR-[A-Z0-9]{6}$/.test(reference)) return null;
    const found = await base("Orders")
        .select({ filterByFormula: `{Reference} = ${formulaString(reference)}`, maxRecords: 1 })
        .firstPage();
    if (found.length === 0) return null;
    const f = found[0].fields as Fields;
    const owner = (f.Email ?? "").toLowerCase() === viewer.email.toLowerCase();
    if (!owner && !isStaff(viewer.role)) return null;
    return {
        kind: "order",
        title: "RECEIPT",
        noteLabel: "Deliver to",
        note: f.Address ?? "",
        reference,
        name: f.Name ?? "",
        email: f.Email ?? "",
        phone: f.Phone ?? "",
        createdAt: f.CreatedAt ?? "",
        status: f.Status ?? "",
        paymentMethod: f.PaymentMethod ?? "",
        paymentRef: f.PaymentRef ?? "",
        discount: f.Discount ?? "",
        voucher: f.Voucher ?? "",
        voucherOff: Number(f.VoucherOff ?? 0),
        total: Number(f.Total ?? 0),
        lines: parseLines(f),
    };
}

export function formatMoney(n: number): string {
    return n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const INK = rgb(0.106, 0.075, 0.251);
const TEAL = rgb(0.098, 0.702, 0.769);
const ORANGE = rgb(1, 0.478, 0.239);
const PURPLE = rgb(0.545, 0.247, 0.78);
const YELLOW = rgb(1, 0.784, 0.239);
const SOFT = rgb(0.965, 0.953, 0.98);
const GREY = rgb(0.42, 0.4, 0.5);
const WHITE = rgb(1, 1, 1);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";
    for (const w of words) {
        const next = current ? `${current} ${w}` : w;
        if (font.widthOfTextAtSize(next, size) <= maxWidth) current = next;
        else {
            if (current) lines.push(current);
            current = w;
        }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [""];
}

function moneyWidth(amount: number, font: PDFFont, size: number) {
    return font.widthOfTextAtSize("P", size) + 4 + font.widthOfTextAtSize(formatMoney(amount), size);
}

function drawMoney(page: PDFPage, amount: number, rightX: number, y: number, size: number, font: PDFFont, color = INK) {
    const w = moneyWidth(amount, font, size);
    const x = rightX - w;
    const pw = font.widthOfTextAtSize("P", size);
    page.drawText("P", { x, y, size, font, color });
    page.drawLine({ start: { x: x - 1, y: y + size * 0.33 }, end: { x: x + pw * 0.95, y: y + size * 0.33 }, thickness: size * 0.07, color });
    page.drawLine({ start: { x: x - 1, y: y + size * 0.48 }, end: { x: x + pw * 0.95, y: y + size * 0.48 }, thickness: size * 0.07, color });
    page.drawText(formatMoney(amount), { x: x + pw + 4, y, size, font, color });
}

export async function buildReceiptPdf(r: Receipt, logo: Uint8Array | null): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    pdf.setTitle(`ACHILLES receipt ${r.reference}`);
    pdf.setAuthor("ACHILLES");
    const page = pdf.addPage([595.28, 841.89]);
    const W = page.getWidth();
    const H = page.getHeight();
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const mono = await pdf.embedFont(StandardFonts.CourierBold);
    const M = 44;

    page.drawRectangle({ x: 0, y: H - 120, width: W, height: 120, color: INK });
    const stripe = W / 4;
    [TEAL, ORANGE, PURPLE, YELLOW].forEach((c, i) => page.drawRectangle({ x: i * stripe, y: H - 128, width: stripe, height: 8, color: c }));

    if (logo) {
        try {
            const img = await pdf.embedPng(logo);
            const h = 64;
            const w = (img.width / img.height) * h;
            page.drawImage(img, { x: M, y: H - 92, width: w, height: h });
        } catch {
            page.drawText("ACHILLES", { x: M, y: H - 70, size: 28, font: bold, color: WHITE });
        }
    } else {
        page.drawText("ACHILLES", { x: M, y: H - 70, size: 28, font: bold, color: WHITE });
    }
    page.drawText(r.title, { x: W - M - bold.widthOfTextAtSize(r.title, 26), y: H - 62, size: 26, font: bold, color: WHITE });
    page.drawText(r.reference, { x: W - M - mono.widthOfTextAtSize(r.reference, 14), y: H - 86, size: 14, font: mono, color: YELLOW });

    const date = r.createdAt ? new Date(r.createdAt).toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila" }) : "";
    let y = H - 168;

    const label = (t: string, x: number, yy: number) => page.drawText(t.toUpperCase(), { x, y: yy, size: 8, font: bold, color: PURPLE });
    label("Billed to", M, y);
    page.drawText(r.name || r.email, { x: M, y: y - 16, size: 13, font: bold, color: INK });
    page.drawText(r.email, { x: M, y: y - 31, size: 10, font: regular, color: GREY });
    if (r.phone) page.drawText(r.phone, { x: M, y: y - 45, size: 10, font: regular, color: GREY });

    const colX = W / 2 + 10;
    label("Order details", colX, y);
    const info: [string, string][] = [
        ["Date", date],
        ["Payment", paymentLabel(r.paymentMethod)],
        ["Status", r.status],
    ];
    info.forEach(([k, v], i) => {
        page.drawText(k, { x: colX, y: y - 16 - i * 14, size: 9, font: regular, color: GREY });
        page.drawText(v, { x: colX + 52, y: y - 16 - i * 14, size: 9.5, font: bold, color: INK });
    });

    y -= 78;
    label(r.noteLabel, M, y);
    const addr = wrap(r.note || "—", regular, 10.5, W - M * 2 - 150);
    addr.slice(0, 3).forEach((line, i) => page.drawText(line, { x: M, y: y - 16 - i * 14, size: 10.5, font: regular, color: INK }));
    y -= 16 + Math.min(addr.length, 3) * 14 + 22;

    page.drawRectangle({ x: M, y: y - 8, width: W - M * 2, height: 28, color: INK });
    const cols = { name: M + 14, qty: W - M - 210, unit: W - M - 120, amt: W - M - 14 };
    page.drawText("ITEM", { x: cols.name, y: y + 2, size: 9, font: bold, color: WHITE });
    page.drawText("QTY", { x: cols.qty, y: y + 2, size: 9, font: bold, color: WHITE });
    page.drawText("PRICE", { x: cols.unit - 10, y: y + 2, size: 9, font: bold, color: WHITE });
    page.drawText("AMOUNT", { x: cols.amt - bold.widthOfTextAtSize("AMOUNT", 9), y: y + 2, size: 9, font: bold, color: WHITE });
    y -= 12;

    r.lines.slice(0, 9).forEach((l, i) => {
        const nameLines = wrap(l.name, bold, 10.5, cols.qty - cols.name - 16);
        const rowH = Math.max(30, nameLines.length * 13 + 14);
        if (i % 2 === 0) page.drawRectangle({ x: M, y: y - rowH + 8, width: W - M * 2, height: rowH, color: SOFT });
        nameLines.forEach((line, j) => page.drawText(line, { x: cols.name, y: y - 8 - j * 13, size: 10.5, font: bold, color: INK }));
        page.drawText(String(l.qty), { x: cols.qty + 6, y: y - 8, size: 10.5, font: regular, color: INK });
        if (l.unit !== null) {
            drawMoney(page, l.unit, cols.unit + 36, y - 8, 10, regular);
            drawMoney(page, l.unit * l.qty, cols.amt, y - 8, 10, bold);
        }
        y -= rowH;
    });

    if (r.lines.length > 9) {
        page.drawText(`+ ${r.lines.length - 9} more item(s) listed in your order history`, { x: M + 14, y: y - 4, size: 9, font: regular, color: GREY });
        y -= 16;
    }

    y -= 10;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: rgb(0.85, 0.83, 0.9) });
    y -= 20;

    const notes: string[] = [];
    if (r.kind === "repair") notes.push("Final price agreed for the services listed above");
    if (discountLabel(r.discount)) notes.push(`${discountLabel(r.discount)} already applied to item prices`);
    if (r.voucher) notes.push(`Voucher ${r.voucher}: -P${formatMoney(r.voucherOff)} already applied`);
    notes.forEach((n) => {
        page.drawText(n, { x: W - M - regular.widthOfTextAtSize(n, 9), y, size: 9, font: regular, color: GREY });
        y -= 14;
    });
    y -= 8;

    page.drawRectangle({ x: W - M - 250, y: y - 24, width: 250, height: 48, color: TEAL, borderColor: INK, borderWidth: 2 });
    page.drawText(r.kind === "repair" ? "TOTAL PAID" : "TOTAL PAID", { x: W - M - 238, y: y - 6, size: 10, font: bold, color: INK });
    drawMoney(page, r.total, W - M - 12, y - 8, 20, bold, INK);

    const stampX = M + 70;
    const stampY = y - 4;
    page.drawRectangle({ x: stampX - 46, y: stampY - 16, width: 92, height: 34, borderColor: TEAL, borderWidth: 3, rotate: degrees(-10), color: undefined, opacity: 0, borderOpacity: 0.95 });
    page.drawText("PAID", { x: stampX - 30, y: stampY - 4, size: 22, font: bold, color: TEAL, rotate: degrees(-10), opacity: 0.95 });

    if (r.paymentRef) {
        page.drawText(`Payment ref: ${r.paymentRef}`, { x: M, y: 150, size: 8, font: mono, color: GREY });
    }

    page.drawSvgPath("M0 0 C 90 -34 170 34 260 0 S 430 -34 520 0 S 700 34 800 0 V 80 H 0 Z", {
        x: -20,
        y: 96,
        color: TEAL,
        opacity: 0.22,
        scale: 1,
    });
    page.drawSvgPath("M0 0 C 110 -26 190 26 290 0 S 470 -26 580 0 S 740 26 860 0 V 80 H 0 Z", {
        x: -40,
        y: 78,
        color: PURPLE,
        opacity: 0.18,
        scale: 1,
    });

    page.drawText(r.kind === "repair" ? "Salamat sa pagtitiwala!" : "Salamat sa iyong order!", { x: M, y: 112, size: 17, font: bold, color: INK });
    page.drawText("Your shoes are in good hands. We service what we sell, with a 30-day workmanship warranty on repairs.", { x: M, y: 96, size: 9, font: regular, color: GREY });

    page.drawRectangle({ x: 0, y: 0, width: W, height: 58, color: INK });
    page.drawText("ACHILLES  |  Shoe repair & shoe shop", { x: M, y: 34, size: 10, font: bold, color: WHITE });
    page.drawText(`${contact.address}  |  ${contact.hours}`, { x: M, y: 20, size: 8, font: regular, color: rgb(0.8, 0.78, 0.9) });
    const footR = "System-generated receipt";
    page.drawText(footR, { x: W - M - regular.widthOfTextAtSize(footR, 8), y: 20, size: 8, font: regular, color: rgb(0.8, 0.78, 0.9) });

    return pdf.save();
}
