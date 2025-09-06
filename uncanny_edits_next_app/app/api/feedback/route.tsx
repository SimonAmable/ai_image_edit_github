import { EmailTemplate } from '@/app/components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { feedback } = await req.json();
    if (!feedback || typeof feedback !== 'string') {
      return Response.json({ error: 'Feedback is required.' }, { status: 400 });
    }
    const { data, error } = await resend.emails.send({
      from: 'Your Application <onboarding@resend.dev>',
      to: [process.env.FEEDBACK_EMAIL_TO as string],
      subject: 'Feedback from Your Application',
      react: EmailTemplate({ feedback }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}   