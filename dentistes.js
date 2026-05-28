const { hasWebsite } = require("./checkWebsite");

for (const e of dentists) {
  const name =
    e.uniteLegale?.denominationUniteLegale ||
    `${e.uniteLegale?.prenom1UniteLegale || ""} ${e.uniteLegale?.nomUniteLegale || ""}`.trim();

  e.website = await hasWebsite(name);
}
