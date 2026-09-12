'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function LandingPage() {
  const [formData, setFormData] = useState({
    nomEtablissement: "",
    nomContact: "",
    email: "",
    telephone: "",
    message: "",
  });
  const [statut, setStatut] = useState<"idle" | "envoi" | "succes" | "erreur">("idle");
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

  // Animation au scroll (Intersection Observer)
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatut('envoi');

  try {
    const res = await fetch('/api/demandes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Erreur lors de l\'envoi');
    }

    setStatut('succes');
    setFormData({
      nomEtablissement: '',
      nomContact: '',
      email: '',
      telephone: '',
      message: '',
    });
  } catch {
    setStatut('erreur');
  }
};

  const fadeClass = (id: string) =>
    `transition-all duration-700 ease-out ${
      isVisible[id]
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8"
    }`;

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* ========== NAVBAR ========== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg transition group-hover:scale-105">
              E
            </div>
            <span className="text-xl font-bold tracking-tight">
              Edu<span className="text-indigo-600">Soutenance</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#fonctionnalites" className="hover:text-indigo-600 transition">
              Fonctionnalités
            </a>
            <a href="#comment-ca-marche" className="hover:text-indigo-600 transition">
              Comment ça marche
            </a>
            <a href="#roles" className="hover:text-indigo-600 transition">
              Pour qui ?
            </a>
            <a href="#demande" className="hover:text-indigo-600 transition">
              Demander un compte
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
            >
              Connexion
            </Link>
            <a
              href="#demande"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition hover:scale-[1.02]"
            >
              Demander un accès
            </a>
          </div>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        {/* Décoration animée */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute top-40 -left-20 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Texte */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                </span>
                Conçu pour les universités en Côte d&apos;Ivoire
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] leading-tight">
                Centralisez la gestion des{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  mémoires de soutenance
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl max-w-xl mx-auto lg:mx-0">
                EduSoutenance automatise tout le cycle de vie d&apos;un mémoire :
                attribution, suivi, dépôt PDF, planification des soutenances et notation.
                Fini les emails, les clés USB et les plannings papier.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <a
                  href="#demande"
                  className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200/60 hover:bg-indigo-700 transition hover:scale-[1.03] active:scale-[0.98]"
                >
                  Demander un compte établissement
                </a>
                <a
                  href="#comment-ca-marche"
                  className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Voir le fonctionnement
                </a>
              </div>
            </div>

            {/* Image Hero */}
<div className="relative mx-auto w-full max-w-lg lg:max-w-none">
  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl shadow-indigo-200/50 ring-1 ring-slate-200/60">
    <Image
      src="/images/hero-soutenance.png"
      alt="Étudiants en soutenance"
      fill
      className="object-cover transition duration-700 hover:scale-105"
      priority
      sizes="(max-width: 1024px) 100vw, 50vw"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
    
    <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 backdrop-blur p-4 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">Tableau de bord en temps réel</p>
      <p className="text-xs text-slate-500 mt-0.5">Étudiants • Mémoires • Soutenances • Notes</p>
    </div>
  </div>

  {/* Floating badges */}
  <div className="absolute -left-4 top-8 animate-bounce rounded-xl bg-white px-4 py-2 shadow-lg ring-1 ring-slate-100" style={{ animationDuration: "3s" }}>
    <p className="text-xs font-bold text-emerald-600">✓ PDF déposé</p>
  </div>
  <div className="absolute -right-2 bottom-24 animate-bounce rounded-xl bg-white px-4 py-2 shadow-lg ring-1 ring-slate-100" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>
    <p className="text-xs font-bold text-indigo-600">📅 Soutenance planifiée</p>
  </div>
</div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Acteurs connectés", value: "4 rôles" },
              { label: "Workflow complet", value: "8 étapes" },
              { label: "Dépôt de livrable", value: "PDF sécurisé" },
              { label: "Planification", value: "Salles & Jury" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5 text-center shadow-sm transition hover:shadow-md hover:-translate-y-1"
              >
                <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PROBLÈME ========== */}
      <section className="border-y border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            id="probleme"
            data-animate
            className={`mx-auto max-w-2xl text-center ${fadeClass("probleme")}`}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Le chaos des soutenances, c&apos;est fini
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Aujourd&apos;hui, la plupart des établissements gèrent encore les mémoires
              avec des outils dispersés. Résultat : retards, documents perdus et charge
              administrative énorme en fin d&apos;année.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Documents dispersés",
                desc: "Emails, clés USB, Drive partagés… Impossible de savoir où se trouve la dernière version du mémoire.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                title: "Planning chaotique",
                desc: "Conflits de salles, double booking de jury, convocations envoyées trop tard.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: "Pas de traçabilité",
                desc: "Qui a validé ? Quand ? Quelles remarques ont été faites ? Tout reste dans les têtes.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={item.title}
                id={`pb-${i}`}
                data-animate
                className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 ${fadeClass(`pb-${i}`)}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FONCTIONNALITÉS ========== */}
      <section id="fonctionnalites" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            id="feat-title"
            data-animate
            className={`mx-auto max-w-2xl text-center ${fadeClass("feat-title")}`}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Tout ce dont votre établissement a besoin
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Une plateforme unique pour les administrateurs, les étudiants, les encadreurs et le jury.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {[
              {
                title: "Gestion centralisée des étudiants & projets",
                desc: "Créez les comptes étudiants, attribuez les sujets de mémoire et suivez l’avancement en temps réel depuis un tableau de bord unique.",
              },
              {
                title: "Dépôt sécurisé du livrable PDF",
                desc: "L’étudiant dépose son mémoire final en un clic. L’encadreur et le jury y accèdent immédiatement, sans échange de fichiers.",
              },
              {
                title: "Validation & remarques de l’encadreur",
                desc: "L’encadreur annote, valide ou rejette le mémoire. L’étudiant est notifié et peut corriger avant la soutenance.",
              },
              {
                title: "Planification des soutenances & salles",
                desc: "Créez des salles (physiques ou virtuelles), planifiez les créneaux et évitez les conflits d’horaires.",
              },
              {
                title: "Composition du jury & rôles",
                desc: "Affectez Président, Rapporteur et Examinateurs à chaque soutenance en quelques clics.",
              },
              {
                title: "Notation écrite + orale",
                desc: "Le jury saisit les notes et observations. La note finale est calculée et visible par l’étudiant.",
              },
            ].map((feat, i) => (
              <div
                key={feat.title}
                id={`feat-${i}`}
                data-animate
                className={`flex gap-4 ${fadeClass(`feat-${i}`)}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{feat.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== RÔLES ========== */}
      <section id="roles" className="border-y border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            id="roles-title"
            data-animate
            className={`mx-auto max-w-2xl text-center ${fadeClass("roles-title")}`}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Un espace dédié pour chaque acteur
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                role: "Administrateur",
                color: "bg-indigo-600",
                items: ["Gestion étudiants & projets", "Attribution encadreurs", "Planification & salles", "Composition du jury"],
              },
              {
                role: "Étudiant",
                color: "bg-emerald-600",
                items: ["Voir son sujet", "Remarques de l’encadreur", "Dépôt du PDF final", "Date & note de soutenance"],
              },
              {
                role: "Encadreur",
                color: "bg-amber-500",
                items: ["Liste des projets suivis", "Lecture du PDF", "Ajout de remarques", "Validation ou rejet"],
              },
              {
                role: "Membre du Jury",
                color: "bg-slate-800",
                items: ["Soutenances affectées", "Rôle (Président…)", "Note écrite + orale", "Observations"],
              },
            ].map((card, i) => (
              <div
                key={card.role}
                id={`role-${i}`}
                data-animate
                className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:-translate-y-2 ${fadeClass(`role-${i}`)}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`mb-4 inline-flex rounded-lg ${card.color} px-3 py-1 text-xs font-bold uppercase tracking-wider text-white`}>
                  {card.role}
                </div>
                <ul className="space-y-2.5">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMMENT ÇA MARCHE ========== */}
      <section id="comment-ca-marche" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            id="how-title"
            data-animate
            className={`mx-auto max-w-2xl text-center ${fadeClass("how-title")}`}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Un workflow simple, de la demande d&apos;accès jusqu&apos;à la note finale.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-indigo-100 sm:left-1/2 sm:-translate-x-px" />

            {[
              {
                step: "01",
                title: "Demande d’accès à l’établissement",
                desc: "L’établissement remplit le formulaire de demande. L'Admi crée le compte et envoie les identifiants.",
              },
              {
                step: "02",
                title: "Création des comptes internes",
                desc: "L’administrateur de l’établissement crée les comptes étudiants, encadreurs et membres du jury.",
              },
              {
                step: "03",
                title: "Attribution des sujets",
                desc: "Chaque étudiant reçoit son projet de mémoire et un encadreur.",
              },
              {
                step: "04",
                title: "Dépôt du livrable",
                desc: "L’étudiant téléverse le PDF final de son mémoire.",
              },
              {
                step: "05",
                title: "Validation par l’encadreur",
                desc: "Remarques, validation ou demande de corrections.",
              },
              {
                step: "06",
                title: "Planification de la soutenance",
                desc: "Choix de la salle, du créneau et composition du jury.",
              },
              {
                step: "07",
                title: "Jour de la soutenance",
                desc: "Le jury note (écrit + oral) et saisit ses observations.",
              },
              {
                step: "08",
                title: "Note finale disponible",
                desc: "L’étudiant consulte sa note et le procès-verbal.",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                id={`step-${index}`}
                data-animate
                className={`relative mb-10 flex items-start gap-6 ${
                  index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                } ${fadeClass(`step-${index}`)}`}
              >
                <div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-200">
                  {item.step}
                </div>
                <div
                  className={`flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${
                    index % 2 === 0 ? "sm:text-left" : "sm:text-right"
                  }`}
                >
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FORMULAIRE DEMANDE ========== */}
      <section id="demande" className="bg-indigo-600 py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-violet-300 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Demander un compte pour votre établissement
            </h2>
            <p className="mt-4 text-lg text-indigo-100">
              Remplissez le formulaire ci-dessous. Le Administrateur créera votre espace et vous enverra les identifiants par email.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nom de l’établissement *
                </label>
                <input
                  type="text"
                  name="nomEtablissement"
                  required
                  value={formData.nomEtablissement}
                  onChange={handleChange}
                  placeholder="Ex: Université Félix Houphouët-Boigny"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nom du contact *
                </label>
                <input
                  type="text"
                  name="nomContact"
                  required
                  value={formData.nomContact}
                  onChange={handleChange}
                  placeholder="Prénom et Nom"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@universite.ci"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Message (optionnel)
              </label>
              <textarea
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Nombre approximatif d’étudiants, année académique concernée..."
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition resize-none"
              />
            </div>

            {statut === "succes" && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-medium">
                ✓ Votre client mail s’est ouvert. Envoyez le message pour finaliser la demande.
              </div>
            )}
            
            {statut === 'erreur' && (
  <p className="text-sm text-red-600 text-center">
    L&apos;envoi a échoué. Réessayez ou contactez-nous à azizcherif151@gmail.com
  </p>
)}

            <button
              type="submit"
              disabled={statut === "envoi"}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
            >
              {statut === "envoi" ? "Ouverture de votre boîte mail..." : "Envoyer la demande"}
            </button>

            <p className="text-center text-xs text-slate-500">
              Après validation par l'Administrateur, vous recevrez vos identifiants par email.
            </p>
          </form>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                E
              </div>
              <span className="text-lg font-bold text-slate-900">
                Edu<span className="text-indigo-600">Soutenance</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 text-center">
              © {new Date().getFullYear()} EduSoutenance — Plateforme de gestion des mémoires de soutenance
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/login" className="hover:text-indigo-600 transition">
                Connexion
              </Link>
              <a href="#demande" className="hover:text-indigo-600 transition">
                Demander un accès
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}