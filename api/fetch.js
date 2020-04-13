const fetch = require("node-fetch");

const metascraper = require("metascraper")([
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo")(),
  require("metascraper-title")(),
  require("metascraper-url")()
]);

const fetchMeta = async url => {
  const res = await fetch(url);
  const html = await res.text();
  const metadata = await metascraper({ html, url });
  return metadata;
};

const log = str => console.log(`${new Date().toISOString()} ${str}`);

module.exports = async (req, res) => {
  const { q } = req.query;
  log(`GET ${q}`);
  if (q) {
    const meta = await fetchMeta(q);
    res.json({ body: meta });
  }
};
