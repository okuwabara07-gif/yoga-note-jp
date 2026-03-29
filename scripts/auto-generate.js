const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AMAZON_ID = process.env.AMAZON_TRACKING_ID || '';
const RAKUTEN_ID = process.env.RAKUTEN_AFFILIATE_ID || '';

const KEYWORDS = [
  {kw:"\u30e8\u30ac \u521d\u5fc3\u8005 \u30dd\u30fc\u30ba \u57fa\u672c",genre:"beginner"},
  {kw:"\u30e8\u30ac \u75e9\u305b\u308b \u52b9\u679c \u671f\u9593",genre:"pose"},
  {kw:"\u671d\u30e8\u30ac \u30eb\u30fc\u30c6\u30a3\u30f3 5\u5206",genre:"pose"},
  {kw:"\u30e8\u30ac\u30de\u30c3\u30c8 \u304a\u3059\u3059\u3081 \u539a\u3055",genre:"wear"},
  {kw:"\u547c\u5438\u6cd5 \u30e8\u30ac \u7a2e\u985e \u52b9\u679c",genre:"breathing"},
  {kw:"\u7791\u60f3 \u3084\u308a\u65b9 \u521d\u5fc3\u8005",genre:"meditation"},
  {kw:"\u30e8\u30ac\u30a6\u30a7\u30a2 \u304a\u3059\u3059\u3081 \u30d6\u30e9\u30f3\u30c9",genre:"wear"},
  {kw:"\u9aa8\u76e4 \u77ef\u6b63 \u30e8\u30ac \u30dd\u30fc\u30ba",genre:"pose"},
  {kw:"\u80a9\u3053\u308a \u30e8\u30ac \u30b9\u30c8\u30ec\u30c3\u30c1",genre:"pose"},
  {kw:"\u30db\u30c3\u30c8\u30e8\u30ac \u52b9\u679c \u901a\u3044\u65b9",genre:"beginner"}
];

const SYS = `あなたはヨガ・ウェルネス専門ライターです。読者目線で分かりやすく、SEOに強い記事を書きます。見出しはH2/H3を使ってください。文字数2000字以上。Markdown形式で出力。記事内でおすすめ商品を紹介する箇所には[AMAZON:商品名]と[RAKUTEN:商品名]を合計5箇所挿入してください。`;

function insertLinks(text) {
  text = text.replace(/\[AMAZON:([^\]]+)\]/g, (_, p) => {
    return `[🛒 ${p}をAmazonでチェック](https://www.amazon.co.jp/s?k=${encodeURIComponent(p)}&tag=${AMAZON_ID})`;
  });
  text = text.replace(/\[RAKUTEN:([^\]]+)\]/g, (_, p) => {
    return `[🛍 ${p}を楽天でチェック](https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p)}/?rafcid=${RAKUTEN_ID})`;
  });
  return text;
}

function toSlug(kw) {
  return kw.replace(/[\s\u3000]+/g, '-').replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, '') + '-' + Date.now();
}

async function generateArticle(kw, genre) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYS,
      messages: [{ role: 'user', content: `ジャンル：${genre}\nキーワード：「${kw}」\n\nSEO記事をMarkdownで書いてください。` }],
    }),
  });
  const data = await res.json();
  return data.content?.map(c => c.text || '').join('') || '';
}

async function main() {
  const contentDir = path.join(process.cwd(), 'content/blog');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

  const targets = KEYWORDS.sort(() => Math.random() - 0.5).slice(0, 5);

  for (const { kw, genre } of targets) {
    console.log(`生成中: ${kw}`);
    try {
      let text = await generateArticle(kw, genre);
      text = insertLinks(text);
      const slug = toSlug(kw);
      const content = `---\ntitle: "${kw}"\ndate: "${new Date().toISOString().split('T')[0]}"\ngenre: "${genre}"\ntags: [${genre}]\n---\n\n${text}\n`;
      fs.writeFileSync(path.join(contentDir, `${slug}.mdx`), content);
      console.log(`完了: ${slug}.mdx`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`エラー: ${kw}`, e.message);
    }
  }
  console.log('全記事生成完了！');
}

main();
