const fetch = require("node-fetch");

async function extractContactsFromWebsite(url) {
  try {
    const res = await fetch("https://" + url, { timeout: 5000 });
    const html = await res.text();

    const emailMatch = html.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    const phoneMatch = html.match(/0[1-9](\s?\d{2}){4}/);

    return {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null
    };
  } catch {
    return { email: null, phone: null };
  }
}

module.exports = { extractContactsFromWebsite };
