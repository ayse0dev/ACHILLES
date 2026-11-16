import { randomInt } from "crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newReference(prefix: "RP" | "OR" | "TK"): string {
    let code = "";
    for (let i = 0; i < 6; i++) code += alphabet[randomInt(alphabet.length)];
    return `${prefix}-${code}`;
}

export const repairSteps = ["Pending", "In progress", "Ready", "Completed"];
export const ticketSteps = ["Open", "In progress", "Resolved"];
export const orderSteps = ["Paid", "Packed", "Shipped", "Delivered"];
