import type { SVGProps } from "react";

export type LandingIconName =
  | "arrow-circle-up-right"
  | "arrow-up-right"
  | "chart"
  | "cloud-sun"
  | "data"
  | "database"
  | "diamond"
  | "folder-check"
  | "layout"
  | "layout-alt"
  | "layers"
  | "pin"
  | "route"
  | "settings"
  | "share"
  | "sliders"
  | "snowflake"
  | "sun"
  | "timer"
  | "wind";

type LandingIconProps = {
  icon: LandingIconName;
} & SVGProps<SVGSVGElement>;

export function LandingIcon({ icon, ...props }: LandingIconProps) {
  switch (icon) {
    case "diamond":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M6 9L12 3L18 9L12 21L6 9Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M6 9H18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "database":
    case "data":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <ellipse cx="12" cy="6" rx="6.5" ry="3" stroke="currentColor" strokeWidth="1.75" />
          <path d="M5.5 6V12C5.5 13.657 8.41 15 12 15C15.59 15 18.5 13.657 18.5 12V6" stroke="currentColor" strokeWidth="1.75" />
          <path d="M5.5 12V18C5.5 19.657 8.41 21 12 21C15.59 21 18.5 19.657 18.5 18V12" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "arrow-up-right":
    case "arrow-circle-up-right":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9 15L15 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M10 9H15V14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "layers":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M12 4L20 8L12 12L4 8L12 4Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M5.5 11.5L12 15L18.5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M5.5 15.5L12 19L18.5 15.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 2.5V5M12 19V21.5M21.5 12H19M5 12H2.5M18.7 5.3L16.9 7.1M7.1 16.9L5.3 18.7M18.7 18.7L16.9 16.9M7.1 7.1L5.3 5.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "cloud-sun":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M8 17.5H17C19.485 17.5 21.5 15.485 21.5 13C21.5 10.79 19.908 8.952 17.804 8.57C17.164 5.955 14.803 4 12 4C9.52 4 7.404 5.533 6.55 7.7C4.552 7.937 3 9.639 3 11.7C3 14.053 4.907 15.96 7.26 15.96" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 6.2V4.5M5.7 7.7L4.5 6.5M12.6 7.7L13.8 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "wind":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M3 9H14C15.657 9 17 7.657 17 6C17 4.895 16.105 4 15 4C13.895 4 13 4.895 13 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M3 13H18C19.657 13 21 14.343 21 16C21 17.105 20.105 18 19 18C17.895 18 17 17.105 17 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M3 17H11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "snowflake":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M12 2.5V21.5M4.5 7L19.5 17M19.5 7L4.5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M9.5 5L12 2.5L14.5 5M9.5 19L12 21.5L14.5 19M5.5 9.5L4.5 7L7 6.5M17 17.5L19.5 17L18.5 14.5M17 6.5L19.5 7L18.5 9.5M5.5 14.5L4.5 17L7 17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "sliders":
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M4 7H20M4 17H20M8 7V13M16 11V17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="8" cy="15.5" r="2" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="16" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "route":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M7 18C8.657 18 10 16.657 10 15C10 13.343 8.657 12 7 12C5.343 12 4 13.343 4 15C4 16.657 5.343 18 7 18Z" stroke="currentColor" strokeWidth="1.75" />
          <path d="M17 12C18.657 12 20 10.657 20 9C20 7.343 18.657 6 17 6C15.343 6 14 7.343 14 9C14 10.657 15.343 12 17 12Z" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9.8 13.3C11.2 11.3 12.7 10.4 14.2 9.8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="2.5 3" />
        </svg>
      );
    case "pin":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M12 20C12 20 18 14.2 18 9.5C18 6.462 15.538 4 12 4C8.462 4 6 6.462 6 9.5C6 14.2 12 20 12 20Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <circle cx="12" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "timer":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 13L15.5 10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M9.5 3.5H14.5M12 6V3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "layout":
    case "layout-alt":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M10 5V19M4 10H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M4 18H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M6 15L10 11L13 13.5L18 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.5 8H18V10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "folder-check":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M4 8.5C4 7.119 5.119 6 6.5 6H9L10.5 8H17.5C18.881 8 20 9.119 20 10.5V16.5C20 17.881 18.881 19 17.5 19H6.5C5.119 19 4 17.881 4 16.5V8.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M9 13L11 15L15 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "share":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M14 5H19V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14L19 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M19 13V18C19 19.105 18.105 20 17 20H6C4.895 20 4 19.105 4 18V7C4 5.895 4.895 5 6 5H11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}