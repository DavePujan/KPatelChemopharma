To connect your Vercel deployment to your existing custom domain (`kpateldyes.com`), you will need to add the domain in your Vercel dashboard and then update the DNS settings wherever you purchased the domain (like GoDaddy, Namecheap, HostGator, etc.).

Here is the step-by-step process:

### Step 1: Add the Domain in Vercel

1. Log in to your **Vercel Dashboard**.
2. Click on your project (`k-patel-chemopharma`).
3. Click on the **Settings** tab at the top.
4. On the left sidebar, click on **Domains**.
5. In the input box, type `kpateldyes.com` and click **Add**.
   *(Vercel will usually ask if you want to add `www.kpateldyes.com` as well and automatically redirect it—choose **Yes** / Recommended).*

### Step 2: Update your DNS Records

After you click Add, Vercel will show an "Invalid Configuration" error message. This is normal! Below the error, it will give you the exact DNS records you need to copy.

You will need to log into your Domain Registrar (where you bought `kpateldyes.com`) and navigate to your **DNS Settings / Zone Editor**.

You typically need to add/update these two records:


1. The A Record (For kpateldyes.com)

Type: A
Name / Host: @ (Note: If your provider doesn't accept @, you can usually just leave the name field blank)
Value / Points to: 216.198.79.1

2.  The CNAME Record (For www.kpateldyes.com)

Type: CNAME
Name / Host: www
Value / Points to: 2f8f66ff055dbca3.vercel-dns-017.com.


⚠️ Important Note:
Before saving these, make sure you delete any old A records for @ or old CNAME records for www that might be pointing to your old website server. Having conflicting records will prevent the new site from connecting!

Once you add those records to your domain provider, just wait. The red "Invalid Configuration" text on Vercel will eventually turn into a blue checkmark, meaning your website is officially live on kpateldyes.com!


### Step 3: Wait for Propagation

Once you save the DNS changes in your registrar, go back to Vercel.
Vercel will continuously check the DNS records. Once it detects the changes, it will automatically provision a free SSL certificate for you and the red "Invalid Configuration" warning will turn into a blue checkmark.

This usually takes about **5 to 15 minutes**, but in rare cases can take up to a few hours depending on your domain provider. Once you see the blue checkmarks in Vercel, your new site is live on your old domain!





do this:

**Add and Verify your Domain (Recommended for Production)**

1. Go to your **Resend Dashboard** ->  **Domains** .
2. Add `kpateldyes.com` and verify the DNS records.
3. Once verified, you will be able to send emails to any address! *(Note: You will also need to update the `from:` line in `api/contact.js` from `onboarding@resend.dev` to something like `noreply@kpateldyes.com` once verified).*
