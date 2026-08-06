
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
    
    // Determine inquiry type
    const inquiryType = data.sample_quantity ? 'Technical Sample Request' : 'Bulk Sales Inquiry';

    // Fallbacks if some fields are missing
    const name = data.name || 'Website Visitor';
    const company = data.company || 'Not provided';
    const email = data.email || 'No email provided';
    const phone = data.phone || 'Not provided';
    const compound = data.compound || 'Not specified';
    const specs = data.specs || 'None provided';
    const msds = data.include_msds === 'on' ? 'Yes' : 'No';
    const packagingType = data.packaging_type === 'Other' 
      ? `Other: ${data.other_packaging || 'Not specified'}` 
      : (data.packaging_type || 'Not specified');
    
    // Subject Line
    const subjectLine = `New ${inquiryType} – ${compound} – ${company}`;

    // Construct the optimized B2B Email Template
    const htmlBody = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 4px; overflow: hidden; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background-color: #ffffff; padding: 24px 32px; border-bottom: 3px solid #294B49;">
          <h1 style="color: #294B49; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">K. PATEL CHEMOPHARMA</h1>
          <h2 style="color: #333333; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">New ${inquiryType}</h2>
          <p style="color: #666666; margin: 0; font-size: 14px;">A new inquiry has been submitted through the website.</p>
          <div style="margin-top: 16px; font-size: 13px; color: #888888;">
            Submitted:<br/>
            <strong style="color: #333333;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</strong>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          
          <h3 style="color: #294B49; margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Contact Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tbody>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #666666; width: 35%; font-size: 14px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #666666; font-size: 14px;">Company</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 500;">${company}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #666666; font-size: 14px;">Business Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 500;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #666666; font-size: 14px;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 500;">${phone}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #294B49; margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Product Requirement</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tbody>
              <tr style="background-color: #F8F8F8;">
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #666666; width: 35%; font-size: 14px;">Inquiry Type</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 600;">${inquiryType}</td>
              </tr>
              <tr style="background-color: #F8F8F8;">
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #666666; font-size: 14px;">Product / C.I. No.</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 600;">${compound}</td>
              </tr>
              ${data.sample_quantity ? `
              <tr style="background-color: #F8F8F8;">
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #666666; font-size: 14px;">Quantity</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 600;">${data.sample_quantity}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #666666; font-size: 14px;">MSDS / CoA Requested</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 500;">${msds}</td>
              </tr>
              ${data.packaging_type ? `
              <tr style="background-color: #F8F8F8;">
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #666666; font-size: 14px;">Preferred Packing</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 14px; font-weight: 600;">${packagingType}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          <h3 style="color: #294B49; margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Requirement Details</h3>
          <div style="padding: 16px; border-left: 4px solid #294B49; background-color: #F8F8F8; color: #111111; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 32px;">${specs}</div>

          <h3 style="color: #294B49; margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Submission Metadata</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #666666; width: 35%; font-size: 13px;">Submitted From</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #111111; font-size: 13px;">Website Form</td>
              </tr>
            </tbody>
          </table>

        </div>

        <!-- Footer -->
        <div style="background-color: #ffffff; padding: 24px 32px; border-top: 1px solid #eaeaea;">
          <p style="color: #333333; margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">K. Patel Chemopharma Pvt. Ltd.</p>
          <p style="color: #888888; margin: 0 0 8px 0; font-size: 12px;">This email was automatically generated from the website enquiry form.</p>
          <a href="https://www.kpateldyes.com" style="color: #294B49; font-size: 12px; text-decoration: none; font-weight: 500;">https://www.kpateldyes.com</a>
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
        to: 'sales@kpateldyes.com', // Updated to deliver directly to your email
        reply_to: email,
        subject: subjectLine,
        html: htmlBody
      })
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('Resend API Error:', errorData);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
