import type { LandingFeaturePresentation } from "@/features/landing/features/shared";

export const ensoleillementPresentation: LandingFeaturePresentation = {
  id: "ensoleillement",
  status: "ready",
  description: "Simulez l'evolution des zones d'ombre et du soleil.",
  bullets: [
    "Calcul dynamique base sur l'heure, la date et le relief environnant.",
    "Anticipation de l'heure exacte de la perte de lumiere dans une vallee.",
    "Optimisation de la gestion thermique (recherche d'ombre en ete, de soleil en hiver).",
  ],
  imageSrc: "/landing/features/ensoleillement/simulation-ensoleillement.png",
  imageAlt: "Simulation d'ensoleillement RedView sur un relief alpin avec trajectoire solaire.",
};