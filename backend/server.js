require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { exec, spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Client (uses service role for server-side access)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api', (req, res) => {
  res.json({ message: 'LIVE TECH API — Supabase Edition 🚀', status: 'ok' });
});

// GET /api/tools — Fetch AI tools sorted by trending score
app.get('/api/tools', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page  = parseInt(req.query.page)  || 1;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const { data, error, count } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact' })
      .order('trending_score', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      tools: data,
      total: count,
      page,
      limit,
    });
  } catch (err) {
    console.error('[/api/tools] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch AI tools', details: err.message });
  }
});

// POST /api/scrape — Trigger background scraping pipeline manually
app.post('/api/scrape', (req, res) => {
  const pyCommand = `${process.platform === 'win32' ? 'python' : 'python3'} -c "import sys, os; sys.path.insert(0, os.path.abspath('../ai-bulletin')); from pipeline import run_fetch_and_save; from producer import run_producer; tools = run_fetch_and_save(); run_producer(tools) if tools else None"`;
  
  exec(pyCommand, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('[/api/scrape] Error:', error.message);
      return res.status(500).json({ error: 'Failed to run scraping pipeline', details: error.message });
    }
    console.log('[/api/scrape] Output:', stdout);
    if (stderr) console.error('[/api/scrape] Stderr:', stderr);
    res.json({ message: 'Scraping pipeline executed successfully', output: stdout });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Start the background Python scheduler
  console.log('🤖 Starting background Python scheduler...');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const pythonProcess = spawn(pythonCmd, ['scheduler_realtime.py'], { cwd: __dirname });

  pythonProcess.on('error', (err) => {
    console.error(`[Scheduler Failed to Start] ${err.message}`);
    console.error('If you are on Linux/Railway, make sure python3 is installed. If on Windows, make sure python is in PATH.');
  });

  pythonProcess.stdout.on('data', (data) => {
    process.stdout.write(`[Scheduler] ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    process.stderr.write(`[Scheduler Error] ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`[Scheduler] Process exited with code ${code}`);
  });
});
