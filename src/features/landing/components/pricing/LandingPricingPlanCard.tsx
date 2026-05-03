"use client";

import Link from "next/link";
import { useState } from "react";
import { LandingPricingFeatureGroup } from "./LandingPricingFeatureGroup";
import type { LandingPricingFeatureGroup as LandingPricingFeatureGroupContent, LandingPricingPlan } from "./pricing.types";
import styles from "./LandingPricingSection.module.css";

type LandingPricingPlanCardProps = {
  groups: LandingPricingFeatureGroupContent[];
  plan: LandingPricingPlan;
  cardIndex: number;
};

export function LandingPricingPlanCard({ groups, plan, cardIndex }: LandingPricingPlanCardProps) {
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>(plan.defaultExpandedGroupIds ?? []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((currentIds) =>
      currentIds.includes(groupId) ? currentIds.filter((currentId) => currentId !== groupId) : [...currentIds, groupId],
    );
  };

  return (
    <article className={styles.planCard} style={{ "--pricing-card-index": cardIndex } as React.CSSProperties}>
      <div className={styles.planCardContent}>
        <header className={styles.planCardHeader}>
          <div className={styles.planHeadingBlock}>
            <h3 className={styles.planName}>{plan.name}</h3>
            <p className={styles.planPrice}>
              <span>{plan.price}</span>
              <span>{plan.priceSuffix}</span>
            </p>
          </div>

          <div className={styles.planBadgeRow}>
            {plan.badges.map((badge) => (
              <span className={styles.planBadge} key={badge}>
                {badge}
              </span>
            ))}
          </div>
        </header>

        <div className={styles.planDivider} />

        <div className={styles.planFeatureGroups}>
          {groups.map((group) => (
            <LandingPricingFeatureGroup
              group={group}
              isExpanded={expandedGroupIds.includes(group.id)}
              key={`${plan.id}-${group.id}`}
              onToggle={() => toggleGroup(group.id)}
            />
          ))}
        </div>
      </div>

      <Link className={styles.planButton} href={plan.href}>
        Choisir cet abonnement
      </Link>
    </article>
  );
}