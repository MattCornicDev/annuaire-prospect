"use client";

import { useEffect, useState } from "react";

interface Adresse {
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

export default function HomePage() {
  const [data, setData] = useState<Dentiste[]>([]);
  const [loading, setLoading] = useState(true);

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
    .then(res => res.json())
    .then(d => {
      setData(d);
      localStorage.setItem("dentistes", JSON.stringify(d));
      localStorage.setItem("dentistes_timestamp", Date.now().toString());
    })
    .finally(() => setLoading(false));
}, []);


  const total = data.length;
  const withWebsite = data.filter(d => d.website).length;
  const withoutWebsite = total - withWebsite;
  const withEmail = data.filter(d => d.email).length;

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10">

      {/* HERO */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-4xl font-light text-white mb-3">
          Tableau de bord — Annuaire Dentistes 59
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Vue d’ensemble des cabinets dentaires du Nord.  
          Analyse automatique : sites web, emails, téléphones, opportunités de prospection.
        </p>

        <a
          href="/dentistes"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
        >
          Accéder à l’annuaire complet →
        </a>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="text-slate-400 text-sm">
          Chargement des données…
        </div>
      )}

      {!loading && (
        <>
          {/* STATS */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
              <p className="text-xs uppercase text-slate-400 mb-2">Total cabinets</p>
              <p className="text-3xl font-semibold text-white">{total}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
              <p className="text-xs uppercase text-slate-400 mb-2">Avec site web</p>
              <p className="text-3xl font-semibold text-emerald-400">{withWebsite}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
              <p className="text-xs uppercase text-slate-400 mb-2">Sans site web</p>
              <p className="text-3xl font-semibold text-amber-400">{withoutWebsite}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
              <p className="text-xs uppercase text-slate-400 mb-2">Avec email</p>
              <p className="text-3xl font-semibold text-sky-400">{withEmail}</p>
            </div>
          </section>

          {/* OPPORTUNITÉS */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow">
            <h2 className="text-lg font-medium text-white mb-4">
              Cabinets sans site web (opportunités)
            </h2>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {data
                .filter(d => !d.website)
                .slice(0, 20)
                .map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm text-slate-200 border-b border-slate-800/60 pb-2 last:border-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{d._displayName}</span>
                      <span className="text-xs text-slate-400">
                        {d.adresseEtablissement?.libelleCommuneEtablissement || "Ville inconnue"}
                      </span>
                    </div>

                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/40">
                      À prospecter
                    </span>
                  </div>
                ))}
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Liste tronquée aux 20 premiers.  
              La liste complète est disponible dans la page “Dentistes”.
            </p>
          </section>

          {/* CTA */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-white mb-1">
                Passer à l’action
              </h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Utilise l’annuaire pour cibler les cabinets sans site ou mal sécurisés  
                et propose tes services web & cybersécurité.
              </p>
            </div>

            <a
              href="/dentistes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Voir les cabinets →
            </a>
          </section>
        </>
      )}
    </div>
  );
}
