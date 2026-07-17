import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Ensure directories exist
const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
const baseDir = isVercel ? '/tmp' : process.cwd();

// In Vercel, write to /tmp/uploads; locally write to public/uploads
const uploadsDir = isVercel 
  ? path.join('/tmp', 'uploads') 
  : path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(baseDir, 'db.json');
const initialDbPath = path.join(process.cwd(), 'db.json');

// Initialize database with backup/initial data if on Vercel
function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      if (isVercel && fs.existsSync(initialDbPath)) {
        const staticData = fs.readFileSync(initialDbPath, 'utf8');
        fs.writeFileSync(dbPath, staticData);
        return JSON.parse(staticData);
      }
      const defaultDb = { wishes: [], media: [] };
      fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
      return defaultDb;
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { wishes: [], media: [] };
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    // In local development, also backup to root db.json so it is committed to git
    if (!isVercel && fs.existsSync(initialDbPath)) {
      fs.writeFileSync(initialDbPath, JSON.stringify(data, null, 2));
    }
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for media uploads
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.mp4', '.webm', '.mov'];
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/') || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio and video files are allowed!'));
    }
  }
});

// Serve uploads statically from multiple locations for absolute Vercel compatibility
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/uploads', express.static(path.join(process.cwd(), 'dist', 'uploads')));
app.use('/uploads', express.static(path.join('/tmp', 'uploads')));

// Parse JSON bodies
app.use(express.json());

// --- API Routes ---

// Stream from Google Drive
app.get('/api/drive/stream', async (req, res) => {
  const { fileId, token } = req.query;
  if (!fileId || !token) {
    return res.status(400).json({ error: 'Missing fileId or token' });
  }

  try {
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range as string;
    }

    const driveRes = await fetch(driveUrl, { headers });

    if (!driveRes.ok && driveRes.status !== 206) {
      const errorText = await driveRes.text();
      console.error(`Google Drive API returned error status ${driveRes.status}: ${errorText}`);
      return res.status(driveRes.status).json({ error: `Google Drive API error: ${driveRes.status}` });
    }

    // Set relevant headers
    if (driveRes.headers.get('content-type')) {
      res.setHeader('Content-Type', driveRes.headers.get('content-type')!);
    }
    if (driveRes.headers.get('content-range')) {
      res.setHeader('Content-Range', driveRes.headers.get('content-range')!);
    }
    if (driveRes.headers.get('content-length')) {
      res.setHeader('Content-Length', driveRes.headers.get('content-length')!);
    }
    if (driveRes.headers.get('accept-ranges')) {
      res.setHeader('Accept-Ranges', driveRes.headers.get('accept-ranges')!);
    }

    res.status(driveRes.status);

    if (driveRes.body) {
      // @ts-ignore
      const reader = driveRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(Buffer.from(value));
      }
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('Error streaming from Google Drive:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get all media items
app.get('/api/media', (req, res) => {
  const db = readDb();
  res.json(db.media || []);
});

// Get all wishes
app.get('/api/wishes', (req, res) => {
  const db = readDb();
  res.json(db.wishes || []);
});

// Upload a media file
app.post('/api/media/upload', upload.single('mediaFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, type } = req.body;
    if (!title || !type) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Title and type (audio/video) are required' });
    }

    const db = readDb();
    const newMedia = {
      id: 'upload-' + Date.now(),
      title,
      description: description || '',
      type,
      url: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      date: new Date().toISOString().split('T')[0]
    };

    db.media.push(newMedia);
    writeDb(db);

    res.json(newMedia);
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// Add media by external URL
app.post('/api/media/url', (req, res) => {
  try {
    const { title, description, type, url, fileName } = req.body;
    if (!title || !type || !url) {
      return res.status(400).json({ error: 'Title, type, and URL are required' });
    }

    const db = readDb();
    const newMedia = {
      id: 'link-' + Date.now(),
      title,
      description: description || '',
      type,
      url,
      fileName: fileName || 'External Link',
      date: new Date().toISOString().split('T')[0]
    };

    db.media.push(newMedia);
    writeDb(db);

    res.json(newMedia);
  } catch (err: any) {
    console.error('Add URL error:', err);
    res.status(500).json({ error: err.message || 'Failed to add media' });
  }
});

// Add a birthday wish
app.post('/api/wishes', (req, res) => {
  try {
    const { sender, message } = req.body;
    if (!sender || !message) {
      return res.status(400).json({ error: 'Sender and message are required' });
    }

    const db = readDb();
    const newWish = {
      id: 'wish-' + Date.now(),
      sender,
      message,
      date: new Date().toISOString().split('T')[0]
    };

    db.wishes.push(newWish);
    writeDb(db);

    res.json(newWish);
  } catch (err: any) {
    console.error('Add wish error:', err);
    res.status(500).json({ error: err.message || 'Failed to add wish' });
  }
});

// Delete a media item
app.delete('/api/media/:id', (req, res) => {
  try {
    const id = req.params.id;
    const db = readDb();
    const index = db.media.findIndex((m: any) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const mediaItem = db.media[index];
    if (mediaItem.url.startsWith('/uploads/')) {
      const filename = mediaItem.url.replace('/uploads/', '');
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    db.media.splice(index, 1);
    writeDb(db);

    res.json({ success: true, message: 'Media item deleted' });
  } catch (err: any) {
    console.error('Delete media error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete media' });
  }
});

// Delete a wish
app.delete('/api/wishes/:id', (req, res) => {
  try {
    const id = req.params.id;
    const db = readDb();
    const index = db.wishes.findIndex((w: any) => w.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Wish not found' });
    }

    db.wishes.splice(index, 1);
    writeDb(db);

    res.json({ success: true, message: 'Wish deleted' });
  } catch (err: any) {
    console.error('Delete wish error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete wish' });
  }
});

// Global API error handler
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// --- Vite Middleware or Static Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server directly if not running on Vercel
if (!isVercel) {
  startServer();
}

export default app;
