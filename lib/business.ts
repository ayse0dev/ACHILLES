export const contact = {
    address: "Quezon City, Metro Manila, Philippines",
    hours: "Mon–Sat, 9:00 AM – 6:00 PM",
    phone: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    shipping: "Mail-in repairs and nationwide shipping available",
};

export const trustPoints = [
    { title: "30-day workmanship warranty", text: "Every repair is covered for 30 days." },
    { title: "Nationwide shipping", text: "We ship shoes and mail-in repairs across the Philippines." },
    { title: "Repair-backed purchases", text: "We service what we sell." },
    { title: "Easy payment", text: "Cash, GCash, Maya, bank transfer or card." },
];

export const shopCategories = [
    { label: "Men", href: "/shop?category=Men", text: "Formal, casual, boots, sandals, sports" },
    { label: "Women", href: "/shop?category=Women", text: "Heels, flats, sandals, boots, sneakers" },
    { label: "Kids", href: "/shop?category=Kids", text: "School shoes, sneakers, sandals, sports" },
    { label: "Sports", href: "/shop?category=Sports", text: "Running, basketball, football, training" },
    { label: "Cleaning Equipment", href: "/shop?category=Cleaning", text: "Brushes, cleaners, polish and restoration tools" },
    { label: "Sales & Offers", href: "/sales", text: "Clearance, bundles and discounts" },
];

export type ServiceRow = { service: string; price: string; turnaround: string };

export const repairGroups: { title: string; rows: ServiceRow[] }[] = [
    {
        title: "General repairs",
        rows: [
            { service: "Heel tip / top lift", price: "₱80 – ₱150", turnaround: "Same day – 1 day" },
            { service: "Full heel replacement", price: "₱250 – ₱450", turnaround: "1–2 days" },
            { service: "Half sole", price: "₱300 – ₱500", turnaround: "2–3 days" },
            { service: "Full sole replacement", price: "₱500 – ₱900", turnaround: "3–7 days" },
            { service: "Re-stitching (per seam)", price: "₱120 – ₱250", turnaround: "1–3 days" },
            { service: "Re-gluing", price: "₱100 – ₱200", turnaround: "Same day – 1 day" },
            { service: "Patch repair", price: "₱200 – ₱400", turnaround: "2–5 days" },
            { service: "Lining replacement", price: "₱350 – ₱650", turnaround: "3–7 days" },
            { service: "Insole replacement", price: "₱250 – ₱500", turnaround: "2–5 days" },
            { service: "Shoe stretching", price: "₱150 – ₱300", turnaround: "1–2 days" },
        ],
    },
    {
        title: "Leather & upper work",
        rows: [
            { service: "Cleaning & conditioning", price: "₱200 – ₱400", turnaround: "Same day – 1 day" },
            { service: "Polish & shine", price: "₱100 – ₱200", turnaround: "Same day" },
            { service: "Scuff / scratch repair", price: "₱150 – ₱350", turnaround: "1–3 days" },
            { service: "Color restoration / re-dye", price: "₱450 – ₱850", turnaround: "3–7 days" },
            { service: "Waterproofing", price: "₱150 – ₱300", turnaround: "Same day" },
            { service: "Zipper replacement", price: "₱350 – ₱650", turnaround: "3–7 days" },
            { service: "Eyelet replacement (each)", price: "₱40 – ₱80", turnaround: "1–2 days" },
            { service: "Buckle / strap repair", price: "₱250 – ₱500", turnaround: "2–5 days" },
            { service: "Elastic gusset replacement", price: "₱300 – ₱550", turnaround: "3–5 days" },
        ],
    },
    {
        title: "Structural & specialty",
        rows: [
            { service: "Toe taps / toe protectors", price: "₱180 – ₱350", turnaround: "Same day – 1 day" },
            { service: "Sole protectors", price: "₱250 – ₱450", turnaround: "1–2 days" },
            { service: "Metal toe plates", price: "₱200 – ₱400", turnaround: "1–2 days" },
            { service: "Heel height adjustment", price: "₱350 – ₱700", turnaround: "3–7 days" },
            { service: "Shank repair / replacement", price: "₱350 – ₱650", turnaround: "3–7 days" },
            { service: "Boot resoling / rebuilding", price: "₱900 – ₱1,600", turnaround: "7–14 days" },
            { service: "Orthopedic modification", price: "₱500 – ₱1,000", turnaround: "5–10 days" },
        ],
    },
    {
        title: "Sneakers, specialty & restoration",
        rows: [
            { service: "Sneaker deep clean", price: "₱300 – ₱600", turnaround: "3–5 days" },
            { service: "Sneaker restoration", price: "₱600 – ₱1,300", turnaround: "5–10 days" },
            { service: "Athletic midsole replacement", price: "₱500 – ₱900", turnaround: "5–10 days" },
            { service: "Dance shoe repair", price: "₱300 – ₱600", turnaround: "2–5 days" },
            { service: "Handbag / leather goods repair", price: "₱350 – ₱800", turnaround: "3–10 days" },
            { service: "Suede / nubuck cleaning", price: "₱300 – ₱600", turnaround: "3–7 days" },
            { service: "Full shoe restoration", price: "₱1,000 – ₱2,500", turnaround: "2–4 weeks" },
            { service: "Vintage shoe repair", price: "Quote on inspection", turnaround: "2–4 weeks" },
        ],
    },
];

export const rushNotes = [
    "24–48 hour rush: +30%",
    "Same-day rush on select services: +50%",
    "Ask before drop-off. Rush depends on workload and parts.",
];

export const mailInSteps = [
    "Message us photos and describe the issue.",
    "We send a quote and shipping instructions.",
    "Ship the shoes to us. The customer covers shipping both ways.",
    "We repair them and ship them back with tracking.",
];

export const repairPolicies = [
    "Free estimate. No work starts without your approval.",
    "30-day workmanship warranty. New wear or damage is not covered.",
    "50% down payment on repairs above ₱1,000.",
    "Items unclaimed after 60 days may be disposed of.",
    "We don't repair unrepairable synthetic soles, severely deteriorated uppers, or counterfeit goods.",
];

export const offers = [
    { offer: "Clearance sale", details: "Up to 50% off selected styles" },
    { offer: "Buy 1 take 1", details: "Select casual shoes and sandals (seasonal)" },
    { offer: "Bundle deal", details: "Shoe plus cleaning kit at a discount" },
    { offer: "Student discount", details: "10% off with valid ID" },
    { offer: "Senior / PWD discount", details: "20% plus VAT exemption per Philippine law" },
    { offer: "Loyalty card", details: "Buy 5 pairs, 6th at 20% off" },
    { offer: "Free polish", details: "With leather shoe purchase (in-store)" },
    { offer: "Repair + buy combo", details: "Buy shoes, get 15% off any repair" },
];

export const promoTerms = [
    "Offers cannot be combined unless stated.",
    "Regular-priced items only unless marked.",
    "Valid ID required for student, senior and PWD discounts.",
    "Subject to stock. Offers may change.",
];

export const whyBuy = [
    "Repair-backed purchases: we service what we sell",
    "Free sizing and fitting check",
    "Authenticity guaranteed on branded items",
    "Nationwide shipping",
    "7-day returns or exchange (unworn, with receipt)",
    "Repair discounts for shoes bought from us",
];

export const shoppingPolicies = [
    { title: "Payment", text: "Cash, GCash, Maya, bank transfer, card" },
    { title: "Shipping", text: "Nationwide courier. Fee depends on location." },
    { title: "Returns / exchange", text: "7 days, unworn, original packaging, with receipt" },
    { title: "Warranty", text: "Manufacturer defects per brand. Wear and tear excluded." },
    { title: "Reservation", text: "24-hour hold via message" },
];
