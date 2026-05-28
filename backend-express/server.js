require("dotenv").config();
const express = require("express");
const { fetch } = require("undici");
const { hasWebsite } = require("./checkWebsite");
const { extractContactsFromWebsite } = require("./contactScraper");
const cors = require("cors");



const API_KEY = process.env.INSEE_API_KEY;
const app = express();

app.use(cors());

app.use(express.static("public"));

const KEYWORDS = [
  "DENTAIRE",
  "DENTISTE",
  "CHIRURGIEN",
  "CABINET",
  "DR ",
  "DOCTEUR"
];

// -----------------------------
// 1) Récupérer les dentistes du 59 via l’INSEE
// -----------------------------
async function fetchAll59DentistsRaw() {
  const url = `https://api.insee.fr/api-sirene/3.11/siret?q=codePostalEtablissement:59* AND (denominationUniteLegale:DENT* OR nomUniteLegale:DENT*)&nombre=1000`;

  const response = await fetch(url, {
    headers: { "X-INSEE-Api-Key-Integration": API_KEY }
  });

  const data = await response.json();
  return data.etablissements || [];
}

// -----------------------------
// 2) Filtre de sécurité côté Node
// -----------------------------
function isDentist(e) {
  const name =
    e.uniteLegale?.denominationUniteLegale ||
    `${e.uniteLegale?.prenom1UniteLegale || ""} ${e.uniteLegale?.nomUniteLegale || ""}`.trim();

  if (!name) return false;

  return KEYWORDS.some(k => name.toUpperCase().includes(k));
}

// -----------------------------
// 3) API principale
// -----------------------------
app.get("/api/dentistes", async (req, res) => {
  try {
    console.log("🔍 Récupération des cabinets dentaires du 59...");
    const raw = await fetchAll59DentistsRaw();
    const dentists = raw.filter(isDentist);

    console.log(`➡️ ${dentists.length} cabinets dentaires détectés, check des sites + contacts...`);

    // Traitement un par un pour éviter les blocages
    for (const e of dentists) {
      const name =
        e.uniteLegale?.denominationUniteLegale ||
        `${e.uniteLegale?.prenom1UniteLegale || ""} ${e.uniteLegale?.nomUniteLegale || ""}`.trim();

      e._displayName = name;

      // 1) Détection du site web
      let website = null;
      try {
        website = await hasWebsite(name);
        e.website = website;
        console.log(`   • ${name} → ${website || "aucun site détecté"}`);
      } catch (err) {
        console.error("Erreur check site pour", name, err.message);
        e.website = null;
      }

      // 2) Extraction email + téléphone si site trouvé
      if (website) {
        try {
          const contacts = await extractContactsFromWebsite(website);
          e.email = contacts.email;
          e.phone = contacts.phone;
        } catch (err) {
          console.error("Erreur extraction contacts pour", name, err.message);
          e.email = null;
          e.phone = null;
        }
      } else {
        e.email = null;
        e.phone = null;
      }
    }

    res.json(dentists);

  } catch (err) {
    console.error("Erreur /api/dentistes :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// -----------------------------
// 4) Lancement du serveur
// -----------------------------
app.listen(3000, () => {
  console.log("🌐 Serveur lancé sur http://localhost:3000");
});
