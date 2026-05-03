import type { StaticImageData } from "next/image";
import simonPhoto from "../../../../../simon.png";
import victorPhoto from "../../../../../victor.png";

export type LandingFounderPersona = {
  label: string;
  background: string;
};

export type LandingFounderProfile = {
  name: string;
  image: StaticImageData;
  imageAlt: string;
  imagePosition?: string;
  bio: string;
  socialLabel: string;
};

export const LANDING_FOUNDER_PERSONAS: LandingFounderPersona[] = [
  {
    label: "Exploration",
    background: "rgba(168, 98, 221, 0.4)",
  },
  {
    label: "Bikepacking",
    background: "rgba(144, 54, 188, 0.5)",
  },
  {
    label: "Ultra-distance",
    background: "rgba(142, 37, 168, 0.4)",
  },
  {
    label: "Gravel",
    background: "rgba(81, 40, 118, 0.4)",
  },
  {
    label: "VTT",
    background: "rgba(118, 40, 118, 0.4)",
  },
  {
    label: "Route",
    background: "rgba(141, 27, 99, 0.4)",
  },
];

export const LANDING_FOUNDER_STORY = {
  title: "Créer le standard que nous ne trouvions nulle part ailleurs.",
  description:
    "RedView met fin à la frustration des préparations éclatées entre des outils déconnectés et imprécis. Nous avons fusionné nos visions pour créer un environnement unique, pensé pour les athlètes qui veulent planifier leurs aventures outdoor dans le moindre détail.",
};

export const LANDING_FOUNDER_PROFILES: LandingFounderProfile[] = [
  {
    name: "Victor Bouscavet",
    image: victorPhoto,
    imageAlt: "Victor Bouscavet pendant une épreuve d'ultra-distance.",
    imagePosition: "center 58%",
    bio:
      "Victor est un cycliste d'ultra-endurance animé par un besoin constant de création et d'exploration. Designer de formation, il aborde chaque projet avec une exigence radicale et une attention absolue au détail. Pour remporter ses courses, il a dû développer ses propres outils et stratégies logistiques afin d'optimiser chaque paramètre de sa préparation. Après des années de compétition et plus de 20 000 kilomètres de bikepacking, RedView est l'aboutissement de cette démarche. C'est le moyen de partager enfin avec la communauté l'expertise et la précision qu'il a accumulées sur le terrain.",
    socialLabel: "Instagram",
  },
  {
    name: "Simon Farina",
    image: simonPhoto,
    imageAlt: "Simon Farina à vélo sur une route côtière.",
    imagePosition: "center 42%",
    bio:
      "Simon est là pour bousculer les standards. À seulement 17 ans, il est l'architecte technique et le développeur derrière RedView. Tout est parti d'un constat frustrant : avoir accès à de la donnée géographique brute d'une valeur inestimable, mais aucun outil pour l'exploiter efficacement et éviter les erreurs de navigation en montagne. Refusant le compromis habituel entre accessibilité et précision, il a conçu un moteur capable de traiter des données topographiques au demi-mètre près directement dans un navigateur standard.",
    socialLabel: "Instagram",
  },
];