import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔐 Basic Auth (client_id + client_secret)
    const auth = Buffer.from(
      `${process.env.INSEE_CLIENT_ID}:${process.env.INSEE_CLIENT_SECRET}`
    ).toString("base64");

    // 🔎 Requête INSEE (exemple : dentistes du 59)
    const url =
      "https://api.insee.fr/entreprises/sirene/V3/siret?q=activitePrincipaleUniteLegale:8623Z AND codePostalEtablissement:59*&nombre=1000";

    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      next: { revalidate: 86400 }, // 24h de cache côté serveur
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "INSEE API error", status: res.status },
        { status: res.status }
      );
    }

    const json = await res.json();

    // 🧹 Normalisation des données
    const etablissements = json.etablissements?.map((e: any) => ({
      _displayName: e.uniteLegale?.denominationUniteLegale || "—",
      siret: e.siret,
      adresseEtablissement: e.adresseEtablissement,
      website: null,
      email: null,
      phone: null,
    })) || [];

    return NextResponse.json(etablissements);
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
