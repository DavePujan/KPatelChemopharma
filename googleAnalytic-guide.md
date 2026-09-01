# Google Analytics 4 (GA4) Setup Guide for K. Patel Chemopharma

This guide provides step-by-step instructions to create your Google Analytics 4 property and activate tracking across the entire website.

---

## 📌 Overview

The website already has **centralized GA4 integration code** installed at [`assets/js/analytics.js`](./assets/js/analytics.js). 

Once you get your **Measurement ID** (`G-XXXXXXXXXX`), you only need to paste it into **one line** in that file. Tracking and B2B conversion events will activate across all 19 pages automatically.

---

## 🚀 Step 1: Create Your GA4 Property (5 Minutes)

1. Go to [https://analytics.google.com/](https://analytics.google.com/) and sign in with your Google / Company Account.
2. Click the **Admin** gear icon ⚙️ in the bottom left corner.
3. Click **+ Create Account** (or select your existing account):
   * **Account Name**: `K. Patel Chemopharma`
4. Click **Next** to create a Property:
   * **Property Name**: `K. Patel Chemopharma Website`
   * **Reporting Time Zone**: `India (GMT+05:30)`
   * **Currency**: `Indian Rupee (INR ₹)` or `US Dollar (USD $)`
5. Fill in business details:
   * **Industry Category**: *Chemicals & Plastics / Manufacturing & Industrial*
   * **Business Size**: Choose your organization size
6. Choose Business Objectives:
   * Select **Generate leads** and **Examine user behavior**.
7. Click **Create** and accept the Terms of Service.

---

## 🔗 Step 2: Set Up Data Stream & Get Measurement ID

1. Under **Choose a platform**, select **Web**.
2. Set up your data stream:
   * **Website URL**: `https://www.kpateldyes.com`
   * **Stream Name**: `K. Patel Production Web`
   * Keep **Enhanced Measurement** enabled (measures scrolls, outbound clicks, file downloads automatically).
3. Click **Create stream**.
4. You will see a panel showing your **Measurement ID** in the top right:
   ```text
   MEASUREMENT ID: G-XXXXXXXXXX
   ```
5. Copy this ID.

---

## ⚡ Step 3: Activate Tracking in the Code (10 Seconds)

1. Open the file: [`assets/js/analytics.js`](./assets/js/analytics.js).
2. Locate line 12:
   ```javascript
   const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // <-- Replace with your real GA4 ID
   ```
3. Replace `'G-XXXXXXXXXX'` with your real ID (for example: `'G-A1B2C3D4E5'`).
4. Save the file and deploy/push to production.

Tracking is now **100% active site-wide**!

---

## 🎯 What is Automatically Tracked?

The script includes custom B2B conversion tracking configured specifically for industrial chemical exporters:

| Event Name | Trigger Action | What it Measures |
| :--- | :--- | :--- |
| `page_view` | Page navigation | Traffic across Homepage, Products, Applications, Sustainability, etc. |
| `generate_lead` | User reaches `/thank-you` | Successful B2B inquiry form submissions |
| `click_to_call` | Click on `tel:+91...` | Inbound phone inquiries from mobile/desktop |
| `click_to_email` | Click on `mailto:sales@...` | Direct email drafting from prospective buyers |
| `request_sample` | Click on *Request Sample / Quote* | Buyer intent for specific chemical grades & shade swatches |
| `search_product` | Using product catalog search bar | Specific dyes, C.I. numbers, or chemistries buyers are searching for |

---

## 🔍 Step 4: Verify Tracking in GA4

1. Open [Google Analytics](https://analytics.google.com/).
2. Navigate to **Reports** $\rightarrow$ **Realtime**.
3. Open `https://www.kpateldyes.com` on your mobile phone or browser.
4. You should see **1 active user** in the Realtime dashboard within 10–30 seconds.
5. Click a phone number, submit a test inquiry, or browse product categories to see your custom events appear in the *Event count by Event name* card.

---

## 📊 Recommended Reports for B2B Exporters

* **Geographic Demographics** (*Reports $\rightarrow$ User attributes $\rightarrow$ Demographic details*): See which countries (Europe, North America, Middle East, Asia-Pacific) are driving the most inquiries.
* **Top Product Pages** (*Reports $\rightarrow$ Engagement $\rightarrow$ Pages and screens*): Identify which product lines (Basic Dyes, Solvent Dyes, Pigments, Rinsable Colors) generate the highest engagement.
* **Lead Conversion Funnel** (*Reports $\rightarrow$ Engagement $\rightarrow$ Conversions*): Track monthly lead volume from website submissions.
