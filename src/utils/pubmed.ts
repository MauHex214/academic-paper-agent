const PUBMED_API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
}

export async function searchPubMed(query: string, maxResults = 10): Promise<PubMedArticle[]> {
  const searchUrl = `${PUBMED_API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;
  
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  
  const ids = searchData.esearchresult?.idlist || [];
  if (ids.length === 0) return [];
  
  const fetchUrl = `${PUBMED_API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
  const fetchRes = await fetch(fetchUrl);
  const fetchData = await fetchRes.json();
  
  const articles: PubMedArticle[] = ids.map((id: string) => {
    const item = fetchData.result?.[id];
    return {
      pmid: id,
      title: item?.title || '',
      abstract: '',
      authors: item?.authors?.map((a: any) => a.name) || [],
      journal: item?.source || '',
      pubDate: item?.pubdate || '',
      doi: item?.elocationid?.replace('doi: ', '')
    };
  });
  
  return articles;
}

export async function getArticleAbstract(pmid: string): Promise<string> {
  const url = `${PUBMED_API_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
  const res = await fetch(url);
  const text = await res.text();
  
  const abstractMatch = text.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
  return abstractMatch ? abstractMatch[1].replace(/<[^>]+>/g, '').trim() : '';
}

export async function searchJournalsByField(field: string): Promise<string[]> {
  const articles = await searchPubMed(`${field}[Title/Abstract]`, 20);
  const journals = new Set<string>();
  
  articles.forEach(article => {
    if (article.journal) {
      journals.add(article.journal);
    }
  });
  
  return Array.from(journals);
}
