"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { LandingAction, LandingHeaderContent } from "@/features/landing/types/landing";
import styles from "./LandingHeader.module.css";

type LandingHeaderProps = {
  content: LandingHeaderContent;
};

function PlayCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.actionIcon}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.2 6.9L13.1 10L8.2 13.1V6.9Z" fill="currentColor" />
    </svg>
  );
}

function HeaderAction({ action }: { action: LandingAction }) {
  const actionClassName = action.variant === "primary" ? styles.primaryAction : styles.ghostAction;

  return (
    <Link className={`${styles.action} ${actionClassName}`} href={action.href}>
      {action.iconSrc ? (
        <Image
          alt=""
          aria-hidden="true"
          className={styles.actionIcon}
          height={20}
          src={action.iconSrc}
          unoptimized
          width={20}
        />
      ) : (
        <PlayCircleIcon />
      )}
      <span>{action.label}</span>
    </Link>
  );
}

export function LandingHeader({ content }: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll(); // initialise au chargement
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.inner}>
        <Link aria-label={content.brand.label} className={styles.brand} href={content.brand.href}>
          <Image
            alt="RedView"
            className={styles.logo}
            height={33}
            priority
            src={content.brand.logoSrc}
            unoptimized
            width={163}
          />
        </Link>

        <div className={styles.headerRight}>
          <nav aria-label="Navigation principale" className={styles.desktopNav}>
            <ul className={styles.navList}>
              {content.navigation.map((item) => (
                <li key={item.id}>
                  <Link className={styles.navLink} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.desktopActions}>
            {content.actions.map((action) => (
              <HeaderAction action={action} key={action.label} />
            ))}
          </div>
        </div>

        <details className={styles.mobileMenu}>
          <summary className={styles.mobileSummary}>Menu</summary>
          <div className={styles.mobilePanel}>
            <nav aria-label="Navigation mobile">
              <ul className={styles.mobileNavList}>
                {content.navigation.map((item) => (
                  <li key={item.id}>
                    <Link className={styles.mobileNavLink} href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={styles.mobileActions}>
              {content.actions.map((action) => (
                <HeaderAction action={action} key={action.label} />
              ))}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}