"use client";

import { useEffect, useState } from "react";

interface Adresse {
  numeroVoieEtablissement?: string;
  typeVoieEtablissement?: string;
  libelleVoieEtablissement?: string;
  codePostalEtablissement?: string;
  libelleCommuneEtablissement?: string;
}

interface Dentiste {
  _displayName: string;
  adresseEtablissement?: Adresse;
  siret: string;
  website?: string;
  email?: string;
  phone?: string;
}

export default function DentistesPage() {
  // 🟧 HOOKS (doivent être tout en haut)
  const [data, setData] = useState<Dentiste[]>([]);
  const [ville, setVille] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // 🟧 CACHE + FETCH
  useEffect(() => {
    const cached = localStorage.getItem("dentistes");
    const timestamp = localStorage.getItem("dentistes_timestamp");
    const expired =
      !timestamp || Date.now() - Number(timestamp) > 24 * 60 * 60 * 1000;

    if (cached && !expired) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    fetch("http://localhost:3000/api/dentistes")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        localStorage.setItem("dentistes", JSON.stringify(d));
        localStorage.setItem("dentistes_timestamp", Date.now().toString());
      })
      .finally(() => setLoading(false));
  }, []);

  // 🟧 LISTE DES VILLES
  const villes = [...new Set(
    data.map((e) => e.adresseEtablissement?.libelleCommuneEtablissement)
  )]
    .filter(Boolean)
    .sort();

  // 🟧 FILTRE
  const filtered = ville
    ? data.filter(
        (e) =>
          e.adresseEtablissement?.libelleCommuneEtablissement === ville
      )
    : data;

  return (
    <div className="container mx-auto px-4 md:px-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-light">Annuaire des cabinets dentaires du 59</h1>
          <p className="text-[var(--muted)] text-sm">
            Analyse automatique des sites, emails et téléphones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-[rgba(15,23,42,0.9)] border border-[var(--border)] px-4 py-2 rounded-full">
          <label className="text-sm text-[var(--muted)]">Ville :</label>
          <select
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="bg-[var(--card)] border border-[var(--border)] rounded-full px-3 py-1 text-sm outline-none"
          >
            <option value="">Toutes</option>
            {villes.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CARD */}
      <div className="bg-[rgba(15,23,42,0.95)] border border-[var(--border)] rounded-2xl p-4 md:p-6 shadow-[0_18px_40px_rgba(0,0,0,0.6)] overflow-x-auto">

        {loading && (
          <div className="text-[var(--muted)] text-sm">Chargement des données…</div>
        )}

        {!loading && (
          <table className="min-w-[900px] w-full border-collapse text-[13px]">
            <thead className="bg-[rgba(15,23,42,0.9)]">
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>CP</th>
                <th>Ville</th>
                <th>SIRET</th>
                <th>Site</th>
                <th>Email</th>
                <th>Téléphone</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((e, i) => {
                const addr = e.adresseEtablissement || {};
                const address = `${addr.numeroVoieEtablissement || ""} ${
                  addr.typeVoieEtablissement || ""
                } ${addr.libelleVoieEtablissement || ""}`.trim();

                return (
                  <tr key={i} className="hover:bg-[rgba(15,23,42,0.7)]">
                    <td>{e._displayName}</td>
                    <td>{address}</td>
                    <td>{addr.codePostalEtablissement}</td>
                    <td>{addr.libelleCommuneEtablissement}</td>
                    <td>{e.siret}</td>

                    <td>
                      {e.website ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-[11px] font-medium bg-[rgba(34,197,94,0.1)] text-[var(--success)] border border-[rgba(34,197,94,0.4)]">
                          🟢 {e.website}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-[11px] font-medium bg-[rgba(239,68,68,0.08)] text-[var(--danger)] border border-[rgba(239,68,68,0.4)]">
                          🔴 Aucun site
                        </span>
                      )}
                    </td>

                    <td className="break-all text-[11px] md:text-[12px]">
                      {e.email || <span className="text-[var(--muted)]">—</span>}
                    </td>

                    <td className="break-all text-[11px] md:text-[12px]">
                      {e.phone || <span className="text-[var(--muted)]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
