import { Resend } from "resend";

// Lazy initialization of Resend client to avoid build-time errors
let resendInstance: Resend | null = null;

function getResendClient() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY || "re_placeholder";
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "TaskFlow <noreply@taskflow.app>";

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  // In development, if Resend is not configured properly, just log the email
  const isDev = process.env.NODE_ENV === "development";
  const hasValidKey = process.env.RESEND_API_KEY && 
                      process.env.RESEND_API_KEY !== "re_your_resend_api_key" &&
                      !process.env.RESEND_API_KEY.startsWith("re_123") &&
                      process.env.RESEND_API_KEY !== "re_placeholder";

  if (isDev && !hasValidKey) {
    console.log("\n📧 [EMAIL - DEV MODE] Would send email:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML preview:", html.substring(0, 200) + "...");
    console.log("(Configure RESEND_API_KEY to send real emails)\n");
    return { id: "dev-mode-email-" + Date.now() };
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    });

    if (error) {
      console.error("[sendEmail] Resend error:", JSON.stringify(error));
      
      // In development, don't throw - just log and continue
      if (isDev) {
        console.warn("⚠️  Email failed but continuing in dev mode");
        console.log("📧 Email content that failed to send:");
        console.log("To:", to);
        console.log("Subject:", subject);
        return { id: "dev-mode-fallback-" + Date.now() };
      }
      
      throw new Error(`Resend failed: ${error.message ?? JSON.stringify(error)}`);
    }

    return data;
  } catch (err) {
    console.error("[sendEmail] Unexpected error:", err);
    
    // In development, don't throw - just log and continue
    if (isDev) {
      console.warn("⚠️  Email failed but continuing in dev mode");
      return { id: "dev-mode-error-" + Date.now() };
    }
    
    throw err;
  }
}
