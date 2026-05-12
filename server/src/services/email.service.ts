// server/src/services/email.service.ts
import nodemailer from "nodemailer";

// ── Nodemailer transporter — Gmail SMTP ───────────────────────────────────────
// Uses an App Password (not your Gmail login password).
// Generate one at: myaccount.google.com → Security → App Passwords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `PawAdopt <${process.env.GMAIL_USER}>`;

// ── Colour tokens ─────────────────────────────────────────────────────────────
const AMBER = "#F59E0B";
const GREEN = "#22C55E";
const RED   = "#EF4444";
const GRAY  = "#6B7280";
const WHITE = "#FFFFFF";
const DARK  = "#111827";

// ── Base HTML shell ───────────────────────────────────────────────────────────
function shell(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PawAdopt</title>
</head>
<body style="margin:0;padding:0;background:#FFFBEB;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background:${WHITE};border-radius:24px;
                      overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:${AMBER};padding:32px 40px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🐾</div>
              <h1 style="margin:0;color:${WHITE};font-size:24px;font-weight:800;
                         letter-spacing:-0.5px;">PawAdopt</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Finding forever homes, one paw at a time
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;padding:24px 40px;text-align:center;
                       border-top:1px solid #F3F4F6;">
              <p style="margin:0;color:${GRAY};font-size:12px;line-height:1.6;">
                You're receiving this email because you submitted an adoption application on
                <strong>PawAdopt</strong>.<br/>
                If you have questions, please contact our support team.
              </p>
              <p style="margin:12px 0 0;color:#D1D5DB;font-size:11px;">
                © ${new Date().getFullYear()} PawAdopt. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ── Reusable blocks ───────────────────────────────────────────────────────────
function statusBadge(approved: boolean): string {
  const color = approved ? GREEN : RED;
  const label = approved ? "✓ Application Approved" : "✗ Application Rejected";
  return `
    <div style="display:inline-block;background:${color}1A;border:1.5px solid ${color};
                color:${color};font-size:13px;font-weight:700;padding:6px 16px;
                border-radius:999px;margin-bottom:24px;">
      ${label}
    </div>`;
}

function petCard(petName: string, petSpecies: string): string {
  return `
    <div style="background:#FFFBEB;border:1.5px solid #FDE68A;border-radius:16px;
                padding:20px 24px;margin:24px 0;">
      <div style="font-size:40px;line-height:1;margin-bottom:8px;">🐾</div>
      <p style="margin:0;font-size:18px;font-weight:800;color:${DARK};">${petName}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${GRAY};text-transform:capitalize;">
        ${petSpecies}
      </p>
    </div>`;
}

function ctaButton(label: string, url: string, color: string): string {
  return `
    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${url}" target="_blank"
         style="display:inline-block;background:${color};color:${WHITE};
                font-size:15px;font-weight:700;padding:14px 32px;border-radius:14px;
                text-decoration:none;letter-spacing:0.2px;">
        ${label}
      </a>
    </div>`;
}

// ── Approved HTML ─────────────────────────────────────────────────────────────
function buildApprovedHtml(
  applicantName: string,
  petName: string,
  petSpecies: string,
  dashboardUrl: string
): string {
  const content = `
    <div style="text-align:center;margin-bottom:8px;">
      ${statusBadge(true)}
    </div>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${DARK};text-align:center;">
      Congratulations, ${applicantName}! 🎉
    </h2>
    <p style="margin:0 0 4px;font-size:15px;color:${GRAY};text-align:center;">
      Your adoption application has been <strong style="color:${GREEN};">approved</strong>.
    </p>
    ${petCard(petName, petSpecies)}
    <p style="margin:0 0 16px;font-size:15px;color:${DARK};line-height:1.7;">
      We're thrilled to share this wonderful news — your application to adopt
      <strong>${petName}</strong> has been reviewed and approved by our team!
      ${petName} is excited to meet their new family. 🐾
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:${DARK};line-height:1.7;">
      <strong>What happens next?</strong><br/>
      Our team will reach out to you shortly to arrange the handover details,
      including a meet-and-greet and the adoption paperwork.
    </p>
    <div style="background:#F0FDF4;border-left:4px solid ${GREEN};border-radius:0 12px 12px 0;
                padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#166534;">
        📋 Your next steps
      </p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#166534;line-height:2;">
        <li>Check your dashboard for the latest application status</li>
        <li>Prepare your home for your new furry family member</li>
        <li>Wait for our team to contact you for handover details</li>
      </ul>
    </div>
    ${ctaButton("View My Application →", dashboardUrl, AMBER)}
    <p style="margin:24px 0 0;font-size:13px;color:${GRAY};text-align:center;line-height:1.6;">
      Thank you for choosing adoption and giving ${petName} a loving home. ❤️
    </p>`;
  return shell(content);
}

// ── Rejected HTML ─────────────────────────────────────────────────────────────
function buildRejectedHtml(
  applicantName: string,
  petName: string,
  petSpecies: string,
  listingUrl: string
): string {
  const content = `
    <div style="text-align:center;margin-bottom:8px;">
      ${statusBadge(false)}
    </div>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${DARK};text-align:center;">
      Hi ${applicantName},
    </h2>
    <p style="margin:0 0 4px;font-size:15px;color:${GRAY};text-align:center;">
      An update on your adoption application for <strong>${petName}</strong>.
    </p>
    ${petCard(petName, petSpecies)}
    <p style="margin:0 0 16px;font-size:15px;color:${DARK};line-height:1.7;">
      Thank you so much for your interest in adopting <strong>${petName}</strong> and
      for taking the time to submit an application. After careful consideration,
      our team has decided to move forward with a different applicant at this time.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:${DARK};line-height:1.7;">
      Please know this decision was not a reflection of you as a potential pet owner —
      we receive many wonderful applications and it's never an easy choice.
    </p>
    <div style="background:#FFF7ED;border-left:4px solid ${AMBER};border-radius:0 12px 12px 0;
                padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#92400E;">
        💛 Don't give up!
      </p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#92400E;line-height:2;">
        <li>Many other wonderful pets are waiting for a home</li>
        <li>Your perfect match might be just one click away</li>
        <li>You're welcome to apply for any other pet on our platform</li>
      </ul>
    </div>
    ${ctaButton("Browse Available Pets →", listingUrl, AMBER)}
    <p style="margin:24px 0 0;font-size:13px;color:${GRAY};text-align:center;line-height:1.6;">
      Thank you for caring about animals and considering adoption.
      We hope to help you find your perfect companion soon. 🐾
    </p>`;
  return shell(content);
}

// ── Plain-text fallbacks ──────────────────────────────────────────────────────
function buildApprovedText(applicantName: string, petName: string, dashboardUrl: string): string {
  return `
Congratulations ${applicantName}!

Your adoption application for ${petName} has been APPROVED! 🎉

Our team will reach out shortly to arrange the handover details.

What's next:
- Check your dashboard: ${dashboardUrl}
- Prepare your home for your new pet
- Wait for our team to contact you

Thank you for choosing adoption!
— The PawAdopt Team`.trim();
}

function buildRejectedText(applicantName: string, petName: string, listingUrl: string): string {
  return `
Hi ${applicantName},

Thank you for your application to adopt ${petName}.

After careful consideration, our team has decided to move forward with a different applicant at this time. This was not a reflection of you as a potential pet owner.

Don't give up! Many wonderful pets are still looking for a home.
Browse available pets: ${listingUrl}

Thank you for caring about animals and considering adoption.
— The PawAdopt Team`.trim();
}

// ── Public types ──────────────────────────────────────────────────────────────
export interface ApplicationEmailPayload {
  to:            string;
  applicantName: string;
  petName:       string;
  petSpecies:    string;
  status:        "approved" | "rejected";
  appBaseUrl?:   string;
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function sendApplicationStatusEmail(
  payload: ApplicationEmailPayload
): Promise<void> {
  const {
    to,
    applicantName,
    petName,
    petSpecies,
    status,
    appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:5173",
  } = payload;

  const dashboardUrl = `${appBaseUrl}/dashboard`;
  const listingUrl   = `${appBaseUrl}/pets`;
  const approved     = status === "approved";

  try {
    await transporter.sendMail({
      from:    FROM,
      to,                          // ← real recipient, any email address
      subject: approved
        ? `🎉 Your adoption application for ${petName} has been approved!`
        : `Update on your adoption application for ${petName}`,
      text: approved
        ? buildApprovedText(applicantName, petName, dashboardUrl)
        : buildRejectedText(applicantName, petName, listingUrl),
      html: approved
        ? buildApprovedHtml(applicantName, petName, petSpecies, dashboardUrl)
        : buildRejectedHtml(applicantName, petName, petSpecies, listingUrl),
    });

    console.log(`📧 Email (${status}) sent to ${to} for pet "${petName}"`);
  } catch (err: any) {
    // Never crash the adoption flow because of an email failure
    console.error(`❌ Gmail SMTP failed for ${to}:`, err?.message ?? err);
  }
}