import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function getFirmDisclosure(): string {
  return (
    process.env.FIRM_DISCLOSURE_TEXT ||
    "Securities offered through Meridian Cap. This communication is for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any securities."
  );
}

export function getFirmName(): string {
  return process.env.FIRM_NAME || "Meridian Cap";
}
