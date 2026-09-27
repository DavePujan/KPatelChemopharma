import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    console.warn('[Env] Warning: Failed to parse .env file:', err.message);
  }
}

// Load rewrites from vercel.json
let rewrites = [];
const vercelConfigPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    rewrites = vercelConfig.rewrites || [];
  } catch (err) {
    console.warn('[Vercel] Warning: Failed to parse vercel.json:', err.message);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function resolvePath(reqPath) {
  // Strip trailing slashes except for root
  let cleanPath = reqPath;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // 1. Check vercel.json rewrites
  for (const rule of rewrites) {
    if (rule.source === cleanPath) {
      cleanPath = rule.destination;
      break;
    }
  }

  // Sanitize path against directory traversal
  const safeRelativePath = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, '');
  let fullPath = path.join(__dirname, safeRelativePath);

  // If path is a directory, look for index.html inside
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    const indexFile = path.join(fullPath, 'index.html');
    if (fs.existsSync(indexFile)) {
      return indexFile;
    }
  }

  // If file directly exists
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return fullPath;
  }

  // Check with .html appended (cleanUrls support)
  const htmlPath = `${fullPath}.html`;
  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
    return htmlPath;
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Enhanced res object for serverless functions
  res.status = function (statusCode) {
    this.statusCode = statusCode;
    return this;
  };
  res.json = function (data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
    return this;
  };
  res.send = function (data) {
    if (typeof data === 'object') {
      return this.json(data);
    }
    this.setHeader('Content-Type', 'text/html; charset=utf-8');
    this.end(data);
    return this;
  };

  // Handle API routes (/api/*)
  if (pathname.startsWith('/api/')) {
    const endpointName = pathname.slice('/api/'.length).replace(/\.js$/, '');
    const apiFilePath = path.join(__dirname, 'api', `${endpointName}.js`);

    if (fs.existsSync(apiFilePath)) {
      try {
        let bodyBuffer = [];
        for await (const chunk of req) {
          bodyBuffer.push(chunk);
        }
        const rawBody = Buffer.concat(bodyBuffer).toString('utf8');

        if (req.headers['content-type']?.includes('application/json')) {
          try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            req.body = {};
          }
        } else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
          req.body = Object.fromEntries(new URLSearchParams(rawBody));
        } else {
          req.body = rawBody;
        }

        const apiModule = await import(`file://${apiFilePath}?t=${Date.now()}`);
        const handler = apiModule.default || apiModule;

        if (typeof handler === 'function') {
          await handler(req, res);
          return;
        }
      } catch (err) {
        console.error(`[API Error] ${pathname}:`, err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
        return;
      }
    }
  }

  // Resolve static file
  const filePath = resolvePath(pathname);

  if (filePath && fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range && (ext === '.mp4' || ext === '.webm')) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };
      res.writeHead(206, head);
      file.pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    return;
  }

  // 404 Fallback
  const notFoundPage = path.join(__dirname, '404.html');
  if (fs.existsSync(notFoundPage)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(notFoundPage).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  K. Patel Chemopharma - Local Development Server`);
  console.log(`======================================================`);
  console.log(`  ➜ Local:   http://localhost:${PORT}/`);
  console.log(`  ➜ API:     http://localhost:${PORT}/api/contact`);
  console.log(`======================================================\n`);
});
