import type { LandingPricingEnterprise, LandingPricingFeatureGroup, LandingPricingPlan } from "./pricing.types";

export const LANDING_PRICING_FEATURE_GROUPS: LandingPricingFeatureGroup[] = [
  {
    id: "cloud-storage",
    label: "Stockage Cloud",
    icon: "folder-check",
    background: "rgba(102, 102, 102, 0.6)",
    items: [{ label: "Gestionnaire de projet", icon: "folder-check" }],
  },
  {
    id: "mapping-3d",
    label: "Cartographie 3D HD",
    icon: "diamond",
    background: "rgba(182, 123, 40, 0.6)",
    items: [
      { label: "Cartographie 3D haute fidélité", icon: "diamond" },
      { label: "Analyse LIDAR 20cm", icon: "data" },
    ],
  },
  {
    id: "terrain-analysis",
    label: "Analyse du terrain",
    icon: "layers",
    background: "rgba(141, 84, 45, 0.6)",
    items: [
      { label: "Analyse des pentes", icon: "arrow-circle-up-right" },
      { label: "Analyse de l’altitude", icon: "layers" },
    ],
  },
  {
    id: "meteo-sunlight",
    label: "Météo et ensoleillement",
    icon: "cloud-sun",
    background: "rgba(63, 151, 234, 0.4)",
    items: [
      { label: "Simulation ensoleillement", icon: "sun" },
      { label: "Prévisions et tendances Météo", icon: "cloud-sun" },
      { label: "Vent en temps réel", icon: "wind" },
      { label: "Simulation de la neige en temps réel", icon: "snowflake" },
    ],
  },
  {
    id: "route-planning",
    label: "Création d’itinéraire avancée",
    icon: "route",
    background: "rgba(25, 116, 111, 0.5)",
    items: [
      { label: "Création d’itinéraire customisable", icon: "settings" },
      { label: "Comparaison d’itinéraire", icon: "route" },
    ],
  },
  {
    id: "route-analysis",
    label: "Analyse d’itinéraire",
    icon: "chart",
    background: "rgba(63, 86, 55, 0.6)",
    items: [
      { label: "Graphique customisable", icon: "chart" },
      { label: "Feuille de route et timeline exportables", icon: "layout-alt" },
      { label: "Export multi format", icon: "share" },
    ],
  },
  {
    id: "poi-management",
    label: "Gestion des Points d’Intérêts",
    icon: "pin",
    background: "rgba(83, 56, 158, 0.6)",
    items: [{ label: "Sélection et édition des POIs", icon: "pin" }],
  },
  {
    id: "pace-estimation",
    label: "Estimation du rythme",
    icon: "timer",
    background: "rgba(18, 18, 18, 0.6)",
    items: [{ label: "Pacing et gestion des pauses", icon: "timer" }],
  },
];

export const LANDING_PRICING_PLANS: LandingPricingPlan[] = [
  {
    id: "explorer",
    name: "Abonnement Explorer",
    price: "9.99€",
    priceSuffix: "/mois",
    badges: ["Sans engagement"],
    href: "/auth/signup",
    defaultExpandedGroupIds: ["mapping-3d"],
  },
  {
    id: "pro-6m",
    name: "Abonnement Pro",
    price: "14.99€",
    priceSuffix: "/mois",
    badges: ["Engagement de 6 mois", "-25%"],
    href: "/auth/signup",
    defaultExpandedGroupIds: ["cloud-storage"],
  },
  {
    id: "pro-monthly",
    name: "Abonnement Pro",
    price: "19.99€",
    priceSuffix: "/mois",
    badges: ["Sans engagement"],
    href: "/auth/signup",
    defaultExpandedGroupIds: ["cloud-storage"],
  },
];

export const LANDING_PRICING_ENTERPRISE: LandingPricingEnterprise = {
  title: "Solutions Entreprises",
  badge: "Sur demande",
  description:
    "Contactez-nous pour découvrir nos offres, du logiciel RedView au développement d’outils spécialement adaptés à vos besoins métier.",
};