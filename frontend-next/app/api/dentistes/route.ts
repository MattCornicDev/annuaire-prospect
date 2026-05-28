import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = `https://api.insee.fr/api-sirene/3.11/siret?q=codePostalEtablissement:59* AND (denominationUniteLegale:DENT* OR nomUniteLegale:DENT*)&nombre=1000`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.INSEE_API_KEY}`,
      },
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Erreur API" }, { status: 500 });
  }
}
