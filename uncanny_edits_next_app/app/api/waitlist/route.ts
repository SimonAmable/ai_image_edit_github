import { WaitlistEmailTemplate } from '@/app/components/WaitlistEmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Send confirmation email to user
    const { data: userEmail, error: userError } = await resend.emails.send({
      from: 'AcMem <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to AcMem Waitlist!',
      react: WaitlistEmailTemplate({ 
        email, 
        type: 'confirmation' 
      }),
    });

    if (userError) {
      console.error('Error sending user confirmation email:', userError);
    }

    // Send notification email to admin
    const { data: adminEmail, error: adminError } = await resend.emails.send({
      from: 'AcMem <onboarding@resend.dev>',
      to: [process.env.WAITLIST_ADMIN_EMAIL || process.env.FEEDBACK_EMAIL_TO as string],
      subject: 'New Waitlist Signup - AcMem',
      react: WaitlistEmailTemplate({ 
        email, 
        type: 'notification' 
      }),
    });

    if (adminError) {
      console.error('Error sending admin notification email:', adminError);
      return Response.json({ error: 'Failed to process waitlist signup.' }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Successfully joined the waitlist!',
      userEmailId: userEmail?.id,
      adminEmailId: adminEmail?.id
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
