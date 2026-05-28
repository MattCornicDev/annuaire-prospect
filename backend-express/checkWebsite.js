const dns = require("dns").promises;
const fetch = require("node-fetch");

async function domainExists(domain) {
  try {
    await dns.resolve(domain);
    return true;
  } catch {
    return false;
  }
}

async function httpExists(domain) {
  try {
    const res = await fetch("https://" + domain, {
      method: "HEAD",
      timeout: 3000
    });
    return res.ok;
  } catch {
    return false;
  }
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/docteur|dr\.?/g, "")
    .replace(/cabinet/g, "")
    .replace(/dentaire/g, "")
    .replace(/chirurgien/g, "")
    .replace(/dentiste/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

async function hasWebsite(name) {
  const base = normalizeName(name);

  if (!base) return null;

  const candidates = [
    `${base}.fr`,
    `${base}.com`,
    `cabinet-${base}.fr`,
    `dr-${base}.fr`,
    `${base}-dentiste.fr`,
    `${base}-dentaire.fr`,
    `${base}.dentiste.fr`,
    `${base}.cabinet-dentaire.fr`
  ];

  for (const domain of candidates) {
    if (await domainExists(domain)) return domain;
    if (await httpExists(domain)) return domain;
  }

  return null;
}

module.exports = { hasWebsite };
