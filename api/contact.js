
// Vercel serverless functions handle API requests (Node.js 18+ has native fetch)
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_KEY = process.env.RESEND_API_KEY;
  if (!API_KEY) {
    console.error('RESEND_API_KEY is not defined');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const data = req.body || {};
    
    // Fallbacks if some fields are missing
    const name = data.name || 'Website Visitor';
    const company = data.company || 'Not provided';
    const email = data.email || 'No email provided';
    const phone = data.phone || 'Not provided';
    const compound = data.compound || 'N/A';
    const specs = data.specs || 'None';
    const msds = data.include_msds === 'on' ? 'Yes' : 'No';

    // Construct the elegant HTML Email Template
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">K. Patel.</h1>
          <p style="color: #999999; margin: 4px 0 0 0; font-size: 14px;">New B2B Lead Submission</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 18px;">Contact Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #666666; width: 35%;"><strong>Name</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #111111;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #666666;"><strong>Email</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #111111;"><a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #666666;"><strong>Company</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #111111;">${company}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #666666;"><strong>Phone</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #111111;">${phone}</td>
              </tr>
            </tbody>
          </table>

          <h2 style="color: #333333; margin: 32px 0 20px 0; font-size: 18px;">Request Requirements</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #666666; width: 35%;"><strong>Compound/CAS</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #111111;">${compound}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #666666;"><strong>Req. MSDS/CoA</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #111111;">${msds}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 24px; padding: 16px; background-color: #f9f9f9; border-radius: 6px; border: 1px solid #eeeeee;">
            <strong style="display: block; color: #666666; margin-bottom: 8px; font-size: 14px;">Physical Form &amp; Spec Requirements:</strong>
            <p style="color: #111111; margin: 0; font-size: 15px; line-height: 1.5; white-space: pre-wrap;">${specs}</p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 16px 24px; text-align: center; border-top: 1px solid #eaeaea;">
          <p style="color: #888888; margin: 0; font-size: 12px;">Submitted via K. Patel Chemopharma Website</p>
        </div>
      </div>
    `;

    // Direct HTTP call to Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'K. Patel Dyes <onboarding@resend.dev>', // Change when you verify domain
        to: 'poojandave0506@gmail.com', // Updated to deliver directly to your email
        subject: `🚨 New B2B Lead: ${company !== 'Not provided' ? company : name}`,
        reply_to: email,
        html: htmlBody,
      })
    });

    const responseData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend Error:', responseData);
      return res.status(400).json({ error: responseData.message || 'Error sending email' });
    }

    return res.status(200).json({ success: true, id: responseData.id });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
