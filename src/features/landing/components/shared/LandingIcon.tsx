import Image, { type ImageProps } from "next/image";

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
} & Omit<ImageProps, "alt" | "src" | "width" | "height">;

const LANDING_ICON_ASSET_MAP: Record<LandingIconName, string | null> = {
  "arrow-circle-up-right": "/landing/icons/slope-analysis.svg",
  "arrow-up-right": "/landing/icons/slope-analysis.svg",
  chart: "/landing/icons/line-chart.svg",
  "cloud-sun": "/landing/icons/weather.svg",
  data: "/landing/icons/lidar-analysis.svg",
  database: "/landing/icons/lidar-analysis.svg",
  diamond: "/landing/icons/diamond.svg",
  "folder-check": "/landing/icons/folder.svg",
  layout: "/landing/icons/spreadsheet.svg",
  "layout-alt": "/landing/icons/spreadsheet.svg",
  layers: "/landing/icons/multi-layer.svg",
  pin: "/landing/icons/poi-pin.svg",
  route: "/landing/icons/itinerary.svg",
  settings: "/landing/icons/settings.svg",
  share: null,
  sliders: "/landing/icons/settings.svg",
  snowflake: "/landing/icons/snowflake.svg",
  sun: "/landing/icons/sun.svg",
  timer: "/landing/icons/stopwatch.svg",
  wind: "/landing/icons/wind.svg",
};

export function LandingIcon({ icon, ...props }: LandingIconProps) {
  const assetPath = LANDING_ICON_ASSET_MAP[icon];
  const svgAriaHidden = props["aria-hidden"] === false || props["aria-hidden"] === "false" ? undefined : "true";

  if (assetPath) {
    return (
      <Image
        {...props}
        alt=""
        aria-hidden={props["aria-hidden"] ?? true}
        height={20}
        src={assetPath}
        style={{ objectFit: "contain", ...(props.style ?? {}) }}
        unoptimized
        width={20}
      />
    );
  }

  switch (icon) {
    case "share":
      return (
        <svg aria-hidden={svgAriaHidden} className={props.className} style={props.style} viewBox="0 0 24 24" fill="none">
          <path d="M14 5H19V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14L19 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M19 13V18C19 19.105 18.105 20 17 20H6C4.895 20 4 19.105 4 18V7C4 5.895 4.895 5 6 5H11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}