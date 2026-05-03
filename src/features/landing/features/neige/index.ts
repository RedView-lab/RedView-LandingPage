import type { LandingFeaturePresentation } from "@/features/landing/features/shared";

export const neigePresentation: LandingFeaturePresentation = {
  id: "neige",
  status: "ready",
  description:
    "Evitez les routes bloquees. Une modelisation physique haute definition identifie les zones d'accumulation de neige sur votre parcours.",
  bullets: [
    "Donnees Meteo France (1km/1km) mises a jour toutes les heures, combinees a un calcul de repartition selon la pente et l'exposition.",
  ],
  imageSrc: "/landing/features/neige/neige.png",
  imageAlt: "Simulation de la neige en temps reel RedView avec comparaison des couches neigeuses.",
};