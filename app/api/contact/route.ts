import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    await resend.emails.send({
    from: "Holytime <support@holytime.auction>",
      to: "supportholytime@gmail.com",
      subject: "New support request — Holytime",
      html: `
        <h2>New support request 💬</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });


    await resend.emails.send({
  from: "Holytime <support@holytime.auction>",
  to: email,
  subject: "We received your message 💜",
  html: `
    <p>Hi,</p>

    <p>Thank you for contacting <strong>Holytime Support</strong> 💜</p>

    <p>Your message has been successfully received — our team will review it and get back to you as soon as possible.</p>

    <hr />

    <p><strong>Support working hours:</strong><br/>
    Monday – Friday<br/>
    09:00 – 22:00 (GMT)</p>

    <p>We usually respond within <strong>24–48 hours</strong>, but often much faster.</p>

    <p>If your request is related to a purchase, please include your email used during checkout.</p>

    <p>Thank you for your patience 🙌<br/>
    — <strong>Holytime Support Team</strong></p>
  `,
});

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}