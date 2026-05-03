import type { LandingFeaturePresentation } from "@/features/landing/features/shared";

export const cartographie3dPresentation: LandingFeaturePresentation = {
  id: "cartographie-3d",
  status: "ready",
  description:
    "Naviguez dans un environnement 3D avec une résolution d'élévation à 40cm, contre 10 à 30m sur les outils standards.",
  bullets: [
    "Modélisation 3D adaptative (optimisée selon la puissance de votre machine).",
    "Couverture ultra-précise incluant la France, la Corse, la Réunion et la Suisse.",
    "Navigation et manipulation de la carte fluides en temps réel.",
  ],
  imageSrc: "/landing/features/cartographie-3d/cartographie-3d.png",
  imageAlt: "Vue RedView d'une vallée alpine en cartographie 3D haute fidélité.",
};