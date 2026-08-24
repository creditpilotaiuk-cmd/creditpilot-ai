const logoUrl = "https://www.creditpilotai.co.uk/creditpilot-email-logo.png";

export function escapeEmailHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);
}

export function textToEmailHtml(value: string) {
  return escapeEmailHtml(value).replace(/\n/g, "<br>");
}

export function brandedEmail(content: string, signOff = "CreditPilot AI") {
  return `<div style="margin:0;background:#f6f8fc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#071633"><div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5eaf3;border-radius:12px;padding:28px"><img src="${logoUrl}" width="190" height="48" alt="CreditPilot AI" style="display:block;width:190px;height:48px;margin:0 0 24px"><div style="font-size:15px;line-height:1.65;color:#26344d">${content}</div><div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5eaf3;font-size:14px;line-height:1.5"><strong>${escapeEmailHtml(signOff)}</strong><br><a href="https://www.creditpilotai.co.uk" style="color:#2f66f6;text-decoration:none">www.creditpilotai.co.uk</a></div></div></div>`;
}
