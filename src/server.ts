import express from 'express';
import { getDb, initDb, saveDb } from './utils/database';
import { searchPubMed, getArticleAbstract } from './utils/pubmed';

const app = express();
app.use(express.json());
app.use(express.static('./public'));

app.get('/api/projects', (req, res) => {
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC');
    const projects = stmt.getAsObject();
    res.json(projects);
  } catch (e) {
    res.json([]);
  }
});

app.post('/api/projects', (req, res) => {
  const db = getDb();
  const { name, description } = req.body;
  db.run('INSERT INTO projects (name, description) VALUES (?, ?)', [name, description]);
  const result = db.exec('SELECT last_insert_rowid() as id');
  const id = result[0]?.values[0]?.[0];
  saveDb();
  res.json({ id, name, description });
});

app.get('/api/journals/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }
  try {
    const articles = await searchPubMed(q as string, 10);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search PubMed' });
  }
});

app.get('/api/journals/:pmid/abstract', async (req, res) => {
  const { pmid } = req.params;
  try {
    const abstract = await getArticleAbstract(pmid);
    res.json({ abstract });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch abstract' });
  }
});

const PORT = process.env.PORT || 3000;

export async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
