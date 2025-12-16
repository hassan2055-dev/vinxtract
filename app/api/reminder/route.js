import EmailTemplate from '../../components/Email_Template';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

export async function POST(request) {
  const { vin, email, carModel } = await request.json();

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailHtml = await render(EmailTemplate({ vin, email, carModel }));

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Payment Completion mail - IGNORE THIS IF YOU HAVE ALREADY PAID FOR THE REPORT',
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ 
      success: true, 
      message: 'Reminder mail sent successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return Response.json({ 
      error: 'An unexpected error occurred while sending reminder mail' 
    }, { status: 500 });
  }
}