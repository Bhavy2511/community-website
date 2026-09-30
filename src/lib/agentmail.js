const AGENTMAIL_API_URL = "https://api.agentmail.to/v0";

export function agentMailConfiguration() {
  const apiKey = process.env.AGENTMAIL_API_KEY_COMMUNITY || process.env.AGENTMAIL_API_KEY || process.env.AGENTMAIL_API_KEY_GARBARAAS;
  const inboxId = process.env.AGENTMAIL_INBOX || "gujaraticommunityiitg@agentmail.to";
  return { apiKey, inboxId, ready: Boolean(apiKey && inboxId) };
}

export async function sendAgentMail({ to, subject, text, html, replyTo, labels = [], inboxId, apiKey, attachments = [] }) {
  const config = agentMailConfiguration();
  const sendingApiKey = apiKey || config.apiKey;
  const sendingInbox = inboxId || config.inboxId;
  if (!sendingApiKey || !sendingInbox) return false;

  const response = await fetch(`${AGENTMAIL_API_URL}/inboxes/${encodeURIComponent(sendingInbox)}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendingApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      ...(html ? { html } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(labels.length ? { labels } : {}),
      ...(attachments.length ? { attachments } : {}),
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || "AgentMail did not accept the email.");
  return body.message_id || true;
}

export function escapeEmailHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}
