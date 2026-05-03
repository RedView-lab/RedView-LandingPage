export type LandingNavigationItem = {
  id: string;
  label: string;
  href: string;
};

export type LandingAction = {
  label: string;
  href: string;
  variant: "ghost" | "primary";
  iconSrc?: string;
};

export type LandingHeaderContent = {
  brand: {
    label: string;
    href: string;
    logoSrc: string;
  };
  navigation: LandingNavigationItem[];
  actions: LandingAction[];
};

export type LandingHeroContent = {
  badge: string;
  headline: {
    prefix: string;
    emphasis: string;
  };
  supportingText?: string;
  imageSrc: string;
};

export type LandingFeatureId =
  | "cartographie-3d"
  | "lidar"
  | "pentes"
  | "altitude"
  | "ensoleillement"
  | "meteo"
  | "vent"
  | "neige"
  | "itineraire"
  | "comparaison"
  | "poi"
  | "rythme"
  | "timeline"
  | "graphique"
  | "projets";

export type LandingFeatureIcon =
  | "diamond"
  | "database"
  | "arrow-up-right"
  | "layers"
  | "sun"
  | "cloud-sun"
  | "wind"
  | "snowflake"
  | "sliders"
  | "route"
  | "pin"
  | "timer"
  | "layout"
  | "chart"
  | "folder-check";

export type LandingFeatureTile = {
  id: LandingFeatureId;
  title: string;
  titleLines?: string[];
  icon: LandingFeatureIcon;
  background: string;
  widthPx?: number;
  textWidthPx?: number;
};

export type LandingPageData = {
  header: LandingHeaderContent;
  hero: LandingHeroContent;
  featureTiles: LandingFeatureTile[];
};