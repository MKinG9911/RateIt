import { NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  subject: z.string().trim().max(200).optional().default('General Inquiry'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(5000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { name, email, subject, message } = result.data;
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'mahtabkhan9911@gmail.com';

    if (!resendApiKey) {
      return NextResponse.json(
        { success: false, error: 'Email service is not configured (missing API key).' },
        { status: 500 },
      );
    }

    const emailSubject = subject?.trim()
      ? `[RateIt Contact] ${subject.trim()}`
      : `[RateIt Contact] New message from ${name}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0E14; color: #F1F5F9; margin: 0; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #141820; border: 1px solid #2D3548; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            
            <!-- Header with Brand -->
            <div style="background: linear-gradient(135deg, #1A1F2E 0%, #141820 100%); padding: 28px 32px; border-bottom: 1px solid #2D3548;">
              <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #F1F5F9;">
                <span style="color: #8B5CF6;">Rate</span><span>It</span>
              </div>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94A3B8;">New submission from footer contact form</p>
            </div>

            <!-- Content Area -->
            <div style="padding: 32px;">
              <!-- Sender Details Card -->
              <div style="background-color: #1E2433; border: 1px solid #2D3548; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748B; width: 80px; font-weight: 600;">Sender:</td>
                    <td style="padding: 6px 0; color: #F1F5F9; font-weight: 600;">${escapeHtml(name)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Email:</td>
                    <td style="padding: 6px 0; color: #A78BFA;">
                      <a href="mailto:${escapeHtml(email)}" style="color: #A78BFA; text-decoration: none;">${escapeHtml(email)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Subject:</td>
                    <td style="padding: 6px 0; color: #F1F5F9;">${escapeHtml(subject || 'General Inquiry')}</td>
                  </tr>
                </table>
              </div>

              <!-- Message Body -->
              <div style="margin-bottom: 28px;">
                <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94A3B8; margin: 0 0 10px 0;">Message:</h3>
                <div style="background-color: #0B0E14; border: 1px solid #2D3548; border-radius: 12px; padding: 20px; font-size: 15px; line-height: 1.6; color: #F1F5F9; white-space: pre-wrap;">${escapeHtml(message)}</div>
              </div>

              <!-- Quick Reply Action Button -->
              <div style="text-align: center;">
                <a href="mailto:${escapeHtml(email)}?subject=Re: ${encodeURIComponent(subject || 'Your RateIt Inquiry')}" 
                   style="display: inline-block; background-color: #8B5CF6; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                  Reply to ${escapeHtml(name)} &rarr;
                </a>
              </div>
            </div>

            <!-- Footer Meta -->
            <div style="background-color: #0B0E14; padding: 16px 32px; border-top: 1px solid #2D3548; font-size: 12px; color: #64748B; text-align: center;">
              Sent via RateIt Community Platform &bull; ${new Date().toUTCString()}
            </div>
          </div>
        </body>
      </html>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RateIt Contact <onboarding@resend.dev>',
        to: [adminEmail],
        reply_to: email,
        subject: emailSubject,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API Error:', resendData);
      return NextResponse.json(
        {
          success: false,
          error: resendData.message || 'Failed to send email through Resend.',
        },
        { status: resendResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
      id: resendData.id,
    });
  } catch (err: any) {
    console.error('Contact route error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'An unexpected error occurred while sending your message.' },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
