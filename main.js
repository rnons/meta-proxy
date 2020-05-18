const http = require("http");
const URL = require("url");

const fetch = require("node-fetch");

const metascraper = require("metascraper")([
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo-favicon")(),
  require("metascraper-title")(),
  require("metascraper-url")()
]);

const MAX_STORE_SIZE = 10000;
const store = new Map();

const fetchMeta = async url => {
  log(`fetching ${url}`);
  /**
   * Use `new URL(url)` to avoid "Request path contains unescaped characters"
   * error, see https://github.com/node-fetch/node-fetch/issues/531
   */
  const res = await fetch(new URL.URL(url));
  const html = await res.text();
  const metadata = await metascraper({ html, url });
  return metadata;
};

// Get meta from store or call fetchMeta
const getMeta = async url => {
  let meta = store.get(url);
  if (meta) {
    return meta;
  }
  meta = await fetchMeta(url);
  store.set(url, meta);
  release();
  return meta;
};

// Limit store size to MAX_STORE_SIZE
const release = () => {
  if (store.size > MAX_STORE_SIZE) {
    const iterator = store.keys();
    for (let i = 0; i < MAX_STORE_SIZE / 20; i++) {
      const key = iterator.next().value;
      store.delete(key);
    }
  }
};

const log = str => console.log(`${new Date().toISOString()} ${str}`);

const server = http.createServer(async (req, res) => {
  const { query } = URL.parse(req.url, true);
  const url = query && query.q;
  if (!url) {
    return res.end();
  }
  log(`GET ${url}`);
  const meta = await getMeta(url);
  res.writeHeader(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "max-age=86400"
  });
  res.write(JSON.stringify(meta));
  res.end();
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
  log(`Server started on ${port}`);
});
