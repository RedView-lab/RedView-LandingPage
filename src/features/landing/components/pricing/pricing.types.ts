import type { LandingIconName } from "@/features/landing/components/shared/LandingIcon";

export type LandingPricingFeatureItem = {
  label: string;
  icon: LandingIconName;
};

export type LandingPricingFeatureGroup = {
  id: string;
  label: string;
  icon: LandingIconName;
  background: string;
  items: LandingPricingFeatureItem[];
};

export type LandingPricingPlan = {
  id: string;
  name: string;
  price: string;
  priceSuffix: string;
  badges: string[];
  href: string;
  defaultExpandedGroupIds?: string[];
};

export type LandingPricingEnterprise = {
  title: string;
  badge: string;
  description: string;
};