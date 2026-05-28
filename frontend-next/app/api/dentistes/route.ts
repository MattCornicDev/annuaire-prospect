import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url =
      "https://api.insee.fr/entreprises/sirene/V3/siret?q=activitePrincipaleUniteLegale:8623Z AND codePostalEtablissement:59*&nombre=2000";

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.IINSEE_API_KEY}`,
      },
    });

    const data = await res.json();

    const formatted = data.etablissements.map((e: any) => ({
      _displayName: e.uniteLegale.denominationUniteLegale,
      adresseEtablissement: e.adresseEtablissement,
      siret: e.siret,
      website: null,
      email: null,
      phone: null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: "Erreur API" }, { status: 500 });
  }
}
