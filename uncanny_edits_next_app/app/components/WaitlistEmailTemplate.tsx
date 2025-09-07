import * as React from 'react';

interface WaitlistEmailTemplateProps {
  email: string;
  type: 'confirmation' | 'notification';
}

export function WaitlistEmailTemplate({ email, type }: WaitlistEmailTemplateProps) {
  if (type === 'confirmation') {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#000', 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '12px' 
            }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>A</span>
            </div>
            <h1 style={{ color: '#000', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>AcMem</h1>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ color: '#000', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
            Welcome to the AcMem Waitlist! 🎉
          </h2>
          
          <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
            Thank you for joining our waitlist! We&apos;re excited to have you on board as we prepare to launch AcMem.
          </p>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
            <h3 style={{ color: '#000', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
              What&apos;s Next?
            </h3>
            <ul style={{ color: '#333', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>You&apos;ll be among the first to know when AcMem launches</li>
              <li>Early access to new features and updates</li>
              <li>Special launch pricing for waitlist members</li>
              <li>Direct communication with our team</li>
            </ul>
          </div>

          <p style={{ color: '#333', fontSize: '14px', lineHeight: '1.6', marginTop: '20px', textAlign: 'center' }}>
            <strong>Your email:</strong> {email}
          </p>
        </div>

        <div style={{ textAlign: 'center', color: '#666', fontSize: '12px' }}>
          <p>Follow us on X and Discord for updates!</p>
          <p style={{ marginTop: '10px' }}>
            If you didn&apos;t sign up for this waitlist, you can safely ignore this email.
          </p>
        </div>
      </div>
    );
  }

  // Notification email for admin
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#000', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        New Waitlist Signup - AcMem
      </h2>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ color: '#000', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          New Waitlist Member
        </h3>
        
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
          <p style={{ color: '#333', fontSize: '14px', margin: '0 0 8px 0' }}>
            <strong>Email:</strong> {email}
          </p>
          <p style={{ color: '#333', fontSize: '14px', margin: '0 0 8px 0' }}>
            <strong>Signup Time:</strong> {new Date().toLocaleString()}
          </p>
          <p style={{ color: '#333', fontSize: '14px', margin: '0' }}>
            <strong>Status:</strong> Confirmed
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p>This is an automated notification from your AcMem waitlist system.</p>
      </div>
    </div>
  );
}
