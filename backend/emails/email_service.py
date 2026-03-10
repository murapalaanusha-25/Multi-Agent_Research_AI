import smtplib
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST    = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT    = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER    = os.getenv("SMTP_USER", "")
SMTP_PASS    = os.getenv("SMTP_PASSWORD", "")
FROM_NAME    = "ResearchAI"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _send(to: str, subject: str, html: str) -> bool:
    if not SMTP_USER or not SMTP_PASS:
        print(f"[EMAIL] Skipped — SMTP_USER/SMTP_PASSWORD not set in .env")
        return False
    try:
        print(f"[EMAIL] Sending '{subject}' to {to}...")
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"{FROM_NAME} <{SMTP_USER}>"
        msg["To"]      = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as s:
            s.ehlo(); s.starttls(); s.ehlo()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, to, msg.as_string())
        print(f"[EMAIL] Sent successfully to {to}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("[EMAIL] Auth failed — check SMTP_USER and SMTP_PASSWORD (use Gmail App Password)")
        return False
    except Exception as e:
        print(f"[EMAIL] Error: {e}")
        traceback.print_exc()
        return False


def send_password_reset_email(email: str, name: str, token: str):
    url = f"{FRONTEND_URL}/reset-password?token={token}"
    print(f"[EMAIL] Reset link: {url}")
    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #ede9fe;overflow:hidden;box-shadow:0 4px 24px rgba(109,40,217,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f5f3ff,#f0fdf9);padding:28px 32px;border-bottom:1px solid #ede9fe;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;width:36px;height:36px;background:linear-gradient(135deg,#6d28d9,#8b5cf6);border-radius:10px;text-align:center;line-height:36px;font-size:18px;vertical-align:middle;">&#9881;</span>
                  <span style="font-family:Arial,sans-serif;font-weight:800;font-size:18px;color:#6d28d9;margin-left:10px;vertical-align:middle;">Research</span><span style="font-family:Arial,sans-serif;font-weight:800;font-size:18px;color:#111827;vertical-align:middle;">AI</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 10px;font-family:Arial,sans-serif;">Reset Your Password</h1>
            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 28px;font-family:Arial,sans-serif;">
              Hi {name}, we received a request to reset the password for your ResearchAI account. Click the button below — it will open your local app where you can set a new password.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:linear-gradient(135deg,#6d28d9,#8b5cf6);border-radius:10px;box-shadow:0 4px 14px rgba(109,40,217,0.3);">
                  <a href="{url}" style="display:inline-block;padding:14px 36px;color:white;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">
                    Reset My Password
                  </a>
                </td>
              </tr>
            </table>

            <p style="color:#6b7280;font-size:12px;margin:0 0 6px;font-family:Arial,sans-serif;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size:11px;word-break:break-all;margin:0 0 28px;font-family:monospace;background:#f5f3ff;padding:10px 14px;border-radius:8px;border:1px solid #ddd6fe;color:#6d28d9;">
              {url}
            </p>

            <!-- Note -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
              <p style="color:#92400e;font-size:13px;margin:0;font-family:Arial,sans-serif;line-height:1.6;">
                <strong>Note:</strong> This link opens <strong>localhost:3000</strong> — make sure your app is running locally before clicking. The link expires in <strong>1 hour</strong>.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f0ff;background:#faf9ff;">
            <p style="color:#9ca3af;font-size:11px;margin:0;text-align:center;font-family:Arial,sans-serif;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""
    _send(email, "Reset your password — ResearchAI", html)


def send_verification_email(email: str, name: str, token: str):
    url = f"{FRONTEND_URL}/verify-email?token={token}"
    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #ede9fe;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#f5f3ff,#f0fdf9);padding:28px 32px;border-bottom:1px solid #ede9fe;">
            <span style="font-family:Arial,sans-serif;font-weight:800;font-size:18px;color:#6d28d9;">Research</span><span style="font-family:Arial,sans-serif;font-weight:800;font-size:18px;color:#111827;">AI</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 10px;">Welcome, {name}!</h1>
            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 28px;">
              Please verify your email address to activate your account.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:linear-gradient(135deg,#6d28d9,#8b5cf6);border-radius:10px;">
                  <a href="{url}" style="display:inline-block;padding:14px 36px;color:white;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">
                    Verify Email Address
                  </a>
                </td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:11px;word-break:break-all;font-family:monospace;background:#f5f3ff;padding:10px 14px;border-radius:8px;border:1px solid #ddd6fe;color:#6d28d9;">{url}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f0ff;background:#faf9ff;">
            <p style="color:#9ca3af;font-size:11px;margin:0;text-align:center;">This link expires in 24 hours.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
    _send(email, "Verify your email — ResearchAI", html)