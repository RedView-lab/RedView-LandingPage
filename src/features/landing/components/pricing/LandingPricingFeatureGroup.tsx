"use client";

import { useId } from "react";
import { LandingIcon } from "@/features/landing/components/shared/LandingIcon";
import type { LandingPricingFeatureGroup as LandingPricingFeatureGroupContent } from "./pricing.types";
import styles from "./LandingPricingSection.module.css";

type LandingPricingFeatureGroupProps = {
  group: LandingPricingFeatureGroupContent;
  isExpanded: boolean;
  onToggle: () => void;
};

export function LandingPricingFeatureGroup({ group, isExpanded, onToggle }: LandingPricingFeatureGroupProps) {
  const panelId = useId();

  return (
    <div className={styles.featureGroup} data-expanded={isExpanded ? "true" : "false"}>
      <button
        aria-controls={panelId}
        aria-expanded={isExpanded}
        className={styles.featureGroupToggle}
        onClick={onToggle}
        style={{ "--pricing-feature-color": group.background } as React.CSSProperties}
        type="button"
      >
        <LandingIcon className={styles.featureGroupIcon} icon={group.icon} />
        <span className={styles.featureGroupLabel}>{group.label}</span>
        <span aria-hidden="true" className={styles.featureGroupGlyph} data-expanded={isExpanded ? "true" : "false"}>
          <span className={styles.featureGroupGlyphHorizontal} />
          <span className={styles.featureGroupGlyphVertical} />
        </span>
      </button>

      <div className={styles.featureGroupBody} id={panelId}>
        <div className={styles.featureGroupBodyInner}>
          {group.items.map((item) => (
            <div className={styles.featureGroupItem} key={`${group.id}-${item.label}`}>
              <LandingIcon className={styles.featureGroupItemIcon} icon={item.icon} />
              <span className={styles.featureGroupItemLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}