# K. Patel Chemopharma

Official corporate website for **K. Patel Chemopharma Private Limited**, established in 1974. Manufacturers and global exporters of Dyes, Pigments, and specialty colorants serving 40+ countries.

---

## 🌟 Key Features

- **Modern Responsive Design**: Dedicated experiences for Desktop, Tablet, and Mobile with optimized touch interfaces.
- **Clean URL Architecture**: Semantic, extensionless routing (`/about`, `/contact`, `/products/basic-dyes`, etc.) mapped via `vercel.json`.
- **Comprehensive Product Catalog**: Structured catalog spanning Basic Dyes, Solvent Dyes, Rinsable Colorants, Acid Dyes, Direct Dyes, Pigments, and Pigment Dispersions.
- **B2B Inquiry & Sample Request Flow**: Integrated quotation forms connected to an automated email dispatch serverless function.
- **Zero-Dependency Local Server**: Built-in development server that mirrors Vercel routing rules and serverless functions without requiring external dependencies or third-party CLI logins.

---

## 🛠️ Tech Stack

- **Frontend**: Semantic HTML5, Vanilla CSS3 (Custom Design System tokens), Vanilla JavaScript (ES6+).
- **Backend / API**: Vercel Serverless Functions (Node.js 18+ native `fetch`).
- **Email Delivery**: [Resend](https://resend.com) API for fast, reliable transaction and quotation delivery.
- **Hosting**: Vercel (Edge Network with global CDN).

---

## 📁 Repository Structure

```
├── .env                  # Local environment configuration (RESEND_API_KEY)
├── .gitignore            # Git exclusion rules for secrets, builds, and dependencies
├── 404.html              # Custom styled 404 error page
├── README.md             # Project documentation and guide
├── api/
│   └── contact.js        # Serverless function handling quotation and contact forms
├── assets/
│   ├── css/              # Design system, components, and responsive stylesheets
│   ├── images/           # High-resolution webp photography and company assets
│   └── js/               # Client-side scripts and GA4 analytics
├── index.html            # Main desktop & tablet landing page
├── package.json          # Node.js project manifest & scripts
├── pages/
│   ├── about/            # Corporate heritage, leadership & history
│   ├── applications/     # Industry breakdown (Paper, Inks, Textiles, Coatings)
│   ├── company/          # Company overview and infrastructure
│   ├── contact/          # Interactive contact & quotation form
│   ├── csr/              # Corporate Social Responsibility initiatives
│   ├── home/             # Dedicated lightweight mobile home experience
│   ├── infrastructure/   # Manufacturing units, labs, and testing equipment
│   ├── products/         # Product categories & shade swatches
│   ├── sustainability/   # Green chemistry & 4R environmental framework
│   └── thank-you/        # Lead conversion & form submission confirmation
├── robots.txt            # Search crawler directives
├── server.js             # Zero-dependency local dev server
├── sitemap.xml           # Production sitemap for search engine indexing
└── vercel.json           # Vercel rewrites, clean URLs, and routing configuration
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended).

### Running the App

1. **Start the local development server:**
   ```bash
   npm run dev
   # or
   node server.js
   ```

2. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

   > The local development server (`server.js`) automatically:
   > - Loads environment variables from `.env`
   > - Resolves extensionless clean URLs matching `vercel.json` rewrites
   > - Dispatches API requests directly to `api/contact.js`
   > - Serves static assets with appropriate MIME types

### Alternative: Vercel CLI

If you have the Vercel CLI installed and linked:
```bash
npx vercel dev
```

---

## 🔐 Environment Variables

Create or update a `.env` file in the project root:

```ini
# Resend API Key for contact and sample quotation submissions
RESEND_API_KEY=re_your_api_key_here
```

> **Note:** For production and preview deployments, set `RESEND_API_KEY` in the **Vercel Dashboard $\rightarrow$ Project Settings $\rightarrow$ Environment Variables**.

---

## 🌐 Production Deployment & Domain Setup

This project is optimized for deployment on Vercel:

1. **Deploy to Vercel:**
   - Push your code to GitHub.
   - Import the repository in your [Vercel Dashboard](https://vercel.com/dashboard).
   - Vercel automatically detects `vercel.json` and configures the build and rewrites.

2. **Connect Custom Domain (`kpateldyes.com`):**
   - In Vercel Project Settings $\rightarrow$ **Domains**, add `kpateldyes.com`.
   - Update your domain registrar's DNS records:
     - **A Record (`@`):** Points to `76.76.21.21`
     - **CNAME (`www`):** Points to `cname.vercel-dns.com`
   - SSL certificates are provisioned automatically.

3. **Verify Email Domain in Resend:**
   - In your [Resend Dashboard](https://resend.com/domains), add and verify `kpateldyes.com`.
   - Update the `from:` sender field in `api/contact.js` from `onboarding@resend.dev` to `noreply@kpateldyes.com` (or `sales@kpateldyes.com`).

---

## 📄 License

&copy; 1974–2026 **K. Patel Chemopharma Private Limited**. All Rights Reserved.
