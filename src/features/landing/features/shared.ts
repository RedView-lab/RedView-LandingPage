import type { LandingFeatureId } from "@/features/landing/types/landing";

export type LandingFeaturePresentationMapCardItem = {
  id: string;
  label: string;
  value?: string;
  featured?: boolean;
};

export type LandingFeaturePresentationMapCard = {
  title: string;
  items: LandingFeaturePresentationMapCardItem[];
};

export type LandingFeaturePresentation = {
  id: LandingFeatureId;
  status: "ready" | "coming-soon";
  description?: string;
  bullets?: string[];
  imageSrc?: string;
  imageAlt?: string;
  mapCard?: LandingFeaturePresentationMapCard;
};

export function createComingSoonLandingFeaturePresentation(
  id: LandingFeatureId,
  title: string,
): LandingFeaturePresentation {
  return {
    id,
    status: "coming-soon",
    description: `${title} sera détaillée prochainement dans cette section.`,
    bullets: ["La structure est prête pour accueillir la maquette et le contenu final."],
  };
}