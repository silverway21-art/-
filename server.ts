import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import {
  initServerFirestore,
  authenticateAdmin,
  validateSessionToken,
  destroySession,
  getProjectsFromDb,
  saveProjectToDb,
  deleteProjectFromDb
} from './src/server/firestoreService';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Admin Authentication: Server-Side PBKDF2 Password Hash Verification
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authenticateAdmin(username, password);
    if (!result.success) {
      return res.status(401).json(result);
    }
    return res.json(result);
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server authentication error' });
  }
});

// Verify Current Admin Session
app.get('/api/auth/session', (req, res) => {
  const authHeader = req.headers.authorization;
  const session = validateSessionToken(authHeader);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    user: {
      username: session.username,
      name: session.name,
      role: session.role,
      email: session.email,
    }
  });
});

// Admin Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  destroySession(authHeader);
  return res.json({ success: true });
});

// Public Project Retrieval (Backed by Firestore)
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await getProjectsFromDb();
    return res.json({ success: true, projects });
  } catch (err: any) {
    console.error('Fetch projects error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Middleware to guard Admin Project Mutation APIs
const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const session = validateSessionToken(authHeader);
  if (!session) {
    return res.status(403).json({ success: false, message: '권한이 없습니다. 관리자로 로그인해 주세요.' });
  }
  (req as any).adminUser = session;
  next();
};

// Admin: Create Project
app.post('/api/admin/projects', requireAdminAuth, async (req, res) => {
  try {
    const projectData = req.body;
    if (!projectData || !projectData.id || !projectData.title) {
      return res.status(400).json({ success: false, message: '필수 프로젝트 정보가 누락되었습니다.' });
    }
    await saveProjectToDb(projectData);
    return res.json({ success: true, project: projectData });
  } catch (err: any) {
    console.error('Create project error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Update Project
app.put('/api/admin/projects/:id', requireAdminAuth, async (req, res) => {
  try {
    const projectData = req.body;
    const { id } = req.params;
    projectData.id = id;
    await saveProjectToDb(projectData);
    return res.json({ success: true, project: projectData });
  } catch (err: any) {
    console.error('Update project error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Delete Project
app.delete('/api/admin/projects/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProjectFromDb(id);
    return res.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Delete project error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Translation API endpoint for Project Creation
app.post('/api/translate', async (req, res) => {
  try {
    const { titleKo, descriptionKo, categoryKo, singleText } = req.body;

    const ai = getGeminiClient();

    // If single text translation is requested
    if (singleText) {
      if (!ai) {
        return res.json({
          success: true,
          translated: singleText,
          fallback: true,
          notice: 'No API key, returned source'
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Translate the following Korean robotics/engineering text into natural, professional technical English for a developer portfolio. Output ONLY the translated English text without quotes or explanations:
"${singleText}"`,
      });

      return res.json({
        success: true,
        translated: response.text?.trim() || singleText,
      });
    }

    // Multi-field translation for Project Form (title, description, category, tags)
    if (!titleKo && !descriptionKo && !categoryKo) {
      return res.status(400).json({ error: 'No text provided for translation' });
    }

    if (!ai) {
      return res.json({
        success: false,
        error: 'Gemini API key is not configured',
        translatedTitle: titleKo || '',
        translatedDescription: descriptionKo || '',
        translatedCategory: categoryKo || '',
      });
    }

    const prompt = `You are a technical robotics translator. Translate the following project details from Korean to professional engineering English:
Project Title: ${titleKo || '(None)'}
Category: ${categoryKo || '(None)'}
Description: ${descriptionKo || '(None)'}

Ensure the terminology matches real robotics hardware, sensor control, embedded systems, and competition contexts.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedTitle: {
              type: Type.STRING,
              description: 'Professional English title for the project',
            },
            translatedCategory: {
              type: Type.STRING,
              description: 'Technical category in English (e.g., Autonomous Ground Vehicle, Edge AI Vision)',
            },
            translatedDescription: {
              type: Type.STRING,
              description: 'Fluent, concise English description of the robot mechanism, algorithm, and purpose',
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Suggested English technical tags in lowercase (e.g., pid-control, ros2, arduino, slam)',
            },
          },
          required: ['translatedTitle', 'translatedCategory', 'translatedDescription', 'suggestedTags'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      ...parsed,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Translation failed',
    });
  }
});

async function startServer() {
  // Initialize Firestore database and seed default admin
  await initServerFirestore();

  // Vite middleware in dev, static files in production
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
    console.log(`Zion Robotics Portfolio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
