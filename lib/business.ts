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
    { label: "Men", href: "/shop?category=Men#products", text: "Formal, casual, boots, sandals, sports" },
    { label: "Women", href: "/shop?category=Women#products", text: "Heels, flats, sandals, boots, sneakers" },
    { label: "Kids", href: "/shop?category=Kids#products", text: "School shoes, sneakers, sandals, sports" },
    { label: "Sports", href: "/shop?category=Sports#products", text: "Running, basketball, football, training" },
    { label: "Cleaning Equipment", href: "/shop?category=Cleaning#products", text: "Brushes, cleaners, polish and restoration tools" },
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
    { offer: "Payday sale", details: "Extra 10% off every 15th and 30th of the month" },
    { offer: "Free shipping", details: "On orders of ₱3,000 and above within Metro Manila" },
    { offer: "Birthday treat", details: "Voucher for 10% off during your birthday month" },
    { offer: "Cleaning kit bundle", details: "Brush, cleaner and polish together at 20% off" },
    { offer: "Weekend flash deal", details: "New markdowns every Saturday and Sunday" },
    { offer: "Refer a friend", details: "You both get a ₱100 voucher on the first order" },
    { offer: "Kids back-to-school", details: "School shoes with a free cleaning and waterproofing" },
    { offer: "Trade-in credit", details: "Bring an old pair for ₱200 off a new one" },
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

export const shopBank = {
    bank: "",
    accountName: "",
    accountNumber: "",
};

export const serviceDetails: Record<string, string> = {
    "Heel tip / top lift": "Replaces the small worn rubber tip at the back of the heel so you stop walking on bare heel.",
    "Full heel replacement": "Removes the worn heel block and fits a new one, matched to height and shape.",
    "Half sole": "A new sole is fitted on the front half of the shoe where wear is worst, saving the rest.",
    "Full sole replacement": "Old sole is removed and a new full sole is glued and stitched on.",
    "Re-stitching (per seam)": "Splitting seams are re-sewn by hand or machine with strong waxed thread.",
    "Re-gluing": "Peeling soles and loose parts are cleaned and bonded back with shoe-grade cement.",
    "Patch repair": "Tears and holes in leather or fabric are reinforced and covered with a matching patch.",
    "Lining replacement": "Worn or torn inner lining is cut out and replaced for a smooth, fresh fit.",
    "Insole replacement": "Flattened or smelly insoles are swapped for new cushioned ones.",
    "Shoe stretching": "Tight shoes are gently widened or lengthened on a stretching machine.",
    "Cleaning & conditioning": "Deep clean followed by conditioner so leather stays soft and does not crack.",
    "Polish & shine": "Wax polish and a hand buff to bring back color and shine.",
    "Scuff / scratch repair": "Scrapes are filled, sanded and colored so they blend into the leather.",
    "Color restoration / re-dye": "Faded or stained leather is re-dyed to its original color or a new one.",
    "Waterproofing": "A protective coating that repels rain and stains on leather, suede and canvas.",
    "Zipper replacement": "Broken or stuck zippers are removed and replaced with a new matching one.",
    "Eyelet replacement (each)": "Torn or missing lace holes are replaced with new metal eyelets.",
    "Buckle / strap repair": "Broken straps and buckles are re-stitched or replaced.",
    "Elastic gusset replacement": "Stretched-out side elastics on boots and loafers are swapped for new ones.",
    "Toe taps / toe protectors": "Small caps on the toe stop scuffing and wear on the front edge.",
    "Sole protectors": "A thin rubber layer glued on the sole for grip and longer life.",
    "Metal toe plates": "Metal plates on the toe for extra durability on work and dress shoes.",
    "Heel height adjustment": "Heels are cut down or built up so they sit at the height you want.",
    "Shank repair / replacement": "Replaces the hidden support strip in the arch when your shoe feels floppy.",
    "Boot resoling / rebuilding": "Full rebuild of the boot base with a new sole, welt work and heel stack.",
    "Orthopedic modification": "Soles and insoles adjusted to fit medical support or leg-length needs.",
    "Sneaker deep clean": "Hand wash of uppers, midsoles, laces and insoles, then air drying.",
    "Sneaker restoration": "Yellowed soles, cracked paint and faded colors brought back close to new.",
    "Athletic midsole replacement": "Crumbling or hardened midsole foam is replaced for cushioning again.",
    "Dance shoe repair": "Heels, suede soles and straps for ballroom, Latin and dance shoes.",
    "Handbag / leather goods repair": "Handles, straps, zippers, stitching and edges on bags, belts and wallets.",
    "Suede / nubuck cleaning": "Dry and wet cleaning that lifts stains and restores the soft nap.",
    "Full shoe restoration": "A complete overhaul: clean, re-dye, new sole, heels, lining and polish.",
    "Vintage shoe repair": "Careful repair of old and delicate pairs. We inspect first and quote after.",
};
