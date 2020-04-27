const http = require("http");

const fetch = require("node-fetch");

const metascraper = require("metascraper")([
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo-favicon")(),
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

const server = http.createServer(async (req, res) => {
  log(`GET ${req.url.slice(1)}`);
  const meta = await fetchMeta(req.url.slice(1));
  res.writeHeader(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "max-age=3600"
  });
  res.write(JSON.stringify(meta));
  res.end();
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
  log(`Server started on ${port}`);
});
