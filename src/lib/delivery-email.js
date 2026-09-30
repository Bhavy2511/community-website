import { escapeEmailHtml, sendAgentMail } from "./agentmail";

export async function sendDeliveryConfirmation({ order, orderType }) {
  const label = orderType === "koti" ? "Koti" : "Kurta";
  const inboxId = orderType === "koti" ? (process.env.KOTI_ORDER_AGENTMAIL_INBOX || "garbaraas.iitg@agentmail.to") : (process.env.KURTA_ORDER_AGENTMAIL_INBOX || "garbaraas.iitg@agentmail.to");
  const deliveredAt = new Date(order.deliveredAt || Date.now()).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
  const items = order.designs.map((design) => {
    const sizes = design.sizes || (design.size ? [design.size] : []);
    return `${design.name}: ${design.quantity} × ${sizes.join(", ") || "Size not recorded"}`;
  }).join("\n");
  const htmlItems = order.designs.map((design) => {
    const sizes = design.sizes || (design.size ? [design.size] : []);
    return `<li>${escapeEmailHtml(design.name)} — ${design.quantity} × ${escapeEmailHtml(sizes.join(", ") || "Size not recorded")}</li>`;
  }).join("");
  return Boolean(await sendAgentMail({
    apiKey: process.env.AGENTMAIL_API_KEY_GARBARAAS,
    inboxId,
    to: order.email,
    subject: `${label} delivered - ${order.pickupCode} | GarbaRaas 2026 IITG`,
    labels: ["website", `${orderType}-delivery`],
    text: `GarbaRaas IITG delivery confirmation\n\nHello ${order.name},\n\nYour ${label.toLowerCase()} merchandise has been delivered successfully.\n\nORDER DETAILS\nPickup code: ${order.pickupCode}\nItems:\n${items}\nTotal ${label.toLowerCase()}s: ${order.totalCount}\nAmount paid: Rs. ${order.amount}\nDelivered: ${deliveredAt}\n\nPlease keep this email for your records.\n\nFor any query contact:\nNidhi Sharma: 6355515926\nDarshan Agrawal: 8770510588\n\nThank you,\nGarbaRaas IITG\n\nFollow us on Instagram: https://www.instagram.com/garbaraas_iitg/\nVisit our website: https://gujarati-community-iitg.vercel.app/garbaraas/2026`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#193630"><p style="color:#b64c28;letter-spacing:2px;font-size:12px">GARBARAAS IITG · DELIVERY CONFIRMATION</p><h1 style="font-family:Georgia,serif;font-weight:500">Merch Delivered!</h1><p>Hello ${escapeEmailHtml(order.name)},</p><p>Your ${label.toLowerCase()} merchandise has been delivered successfully.</p><div style="padding:16px;background:#f8f3ea"><p><strong>Pickup code:</strong> ${escapeEmailHtml(order.pickupCode)}<br><strong>Total:</strong> ${order.totalCount} ${label.toLowerCase()}${order.totalCount === 1 ? "" : "s"}<br><strong>Amount paid:</strong> Rs. ${order.amount}<br><strong>Delivered:</strong> ${escapeEmailHtml(deliveredAt)}</p><p><strong>Items</strong></p><ul>${htmlItems}</ul></div><p style="margin-top:24px"><strong>For any query contact:</strong><br>Nidhi Sharma: 6355515926<br>Darshan Agrawal: 8770510588</p><p>Thank you,<br><strong>GarbaRaas IITG</strong></p><p>Follow us on <a href="https://www.instagram.com/garbaraas_iitg/">Instagram</a><br>Visit our <a href="https://gujarati-community-iitg.vercel.app/garbaraas/2026">website</a></p></div>`,
  }));
}
