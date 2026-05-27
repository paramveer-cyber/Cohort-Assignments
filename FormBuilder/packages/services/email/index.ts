import { env } from "../env";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const webUrl = () => env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
const prefsLink = () => `${webUrl()}/dashboard/email-preferences`;

const prefsFooter = `
  <p style="color:#bbb;font-size:11px;margin-top:32px">
    <a href="${prefsLink()}" style="color:#bbb">Manage email preferences</a>
  </p>
`;

async function sendEmail(to: string, subject: string, htmlContent: string) {
  const apiKey = env.BREVO_API_KEY;
  const senderEmail = env.BREVO_SENDER_EMAIL ?? "noreply@formcraft.app";

  if (!apiKey) {
    console.warn(`[EMAIL SKIPPED] BREVO_API_KEY not set. to=${to} subject="${subject}"`);
    return;
  }
  if (to === "demo@formcraft.app") {
    console.log(`[EMAIL SKIPPED] Skipped send mail to demo account`);
    return;
  }

  const body = {
    sender: { name: "FormCraft", email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  console.log(`[EMAIL] Sending to=${to} subject="${subject}" sender=${senderEmail}`);

  let res: Response;
  try {
    res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`[EMAIL ERROR] fetch to Brevo failed:`, err);
    throw err;
  }

  const responseText = await res.text();

  if (!res.ok) {
    console.error(`[EMAIL ERROR] Brevo returned ${res.status} ${res.statusText}: ${responseText}`);
    throw new Error(`Brevo send failed (${res.status}): ${responseText}`);
  }

  console.log(`[EMAIL OK] Brevo accepted. status=${res.status} response=${responseText}`);
}

export async function sendNewResponseNotification(
  creatorEmail: string,
  formTitle: string,
  responseCount: number,
) {
  const subject = `New response on "${formTitle}"`;
  const htmlContent = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="margin:0 0 16px">New form response</h2>
      <p style="color:#666;margin:0 0 24px">Your form <strong>${formTitle}</strong> just received a new response.</p>
      <p style="color:#666;margin:0 0 24px">Total responses so far: <strong>${responseCount}</strong></p>
      <a href="${webUrl()}/dashboard"
         style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:4px">
        View responses
      </a>
      ${prefsFooter}
    </div>
  `;
  await sendEmail(creatorEmail, subject, htmlContent);
}

export async function sendRespondentConfirmation(
  respondentEmail: string,
  formTitle: string,
  successMessage: string,
) {
  const subject = `Your response to "${formTitle}" was received`;
  const htmlContent = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="margin:0 0 16px">Response confirmed</h2>
      <p style="color:#666;margin:0 0 24px">${successMessage}</p>
      <p style="color:#999;font-size:13px">Powered by FormCraft</p>
    </div>
  `;
  await sendEmail(respondentEmail, subject, htmlContent);
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string) {
  const resetUrl = `${webUrl()}/reset-password?token=${resetToken}`;
  const subject = "Reset your FormCraft password";
  const htmlContent = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="margin:0 0 16px">Reset your password</h2>
      <p style="color:#666;margin:0 0 24px">We received a request to reset your password. Click below to choose a new one. This link expires in 1 hour.</p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:4px">
        Reset password
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px">If you didn't request this, ignore this email. Your password won't change.</p>
      ${prefsFooter}
    </div>
  `;
  await sendEmail(toEmail, subject, htmlContent);
}

export async function sendAccountDeletionEmail(toEmail: string, userName: string) {
  const loginUrl = `${webUrl()}/login`;
  const subject = "Your FormCraft account has been scheduled for deletion";
  const htmlContent = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="margin:0 0 16px">Account deletion scheduled</h2>
      <p style="color:#666;margin:0 0 16px">Hi ${userName},</p>
      <p style="color:#666;margin:0 0 16px">Your FormCraft account and all associated data are scheduled for permanent deletion in <strong>7 days</strong>.</p>
      <p style="color:#666;margin:0 0 24px">Changed your mind? Log in within 7 days and your account will be automatically recovered.</p>
      <a href="${loginUrl}"
         style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:4px">
        Recover my account
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px">If you meant to delete your account, no action is needed.</p>
      ${prefsFooter}
    </div>
  `;
  await sendEmail(toEmail, subject, htmlContent);
}
