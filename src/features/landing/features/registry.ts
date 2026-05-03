import type { LandingFeatureId } from "@/features/landing/types/landing";
import type { LandingFeaturePresentation } from "@/features/landing/features/shared";
import { altitudePresentation } from "@/features/landing/features/altitude";
import { cartographie3dPresentation } from "@/features/landing/features/cartographie-3d";
import { comparaisonPresentation } from "@/features/landing/features/comparaison";
import { ensoleillementPresentation } from "@/features/landing/features/ensoleillement";
import { graphiquePresentation } from "@/features/landing/features/graphique";
import { itinerairePresentation } from "@/features/landing/features/itineraire";
import { lidarPresentation } from "@/features/landing/features/lidar";
import { meteoPresentation } from "@/features/landing/features/meteo";
import { neigePresentation } from "@/features/landing/features/neige";
import { pentesPresentation } from "@/features/landing/features/pentes";
import { poiPresentation } from "@/features/landing/features/poi";
import { projetsPresentation } from "@/features/landing/features/projets";
import { rythmePresentation } from "@/features/landing/features/rythme";
import { timelinePresentation } from "@/features/landing/features/timeline";
import { ventPresentation } from "@/features/landing/features/vent";

export const LANDING_FEATURE_PRESENTATIONS = {
  "cartographie-3d": cartographie3dPresentation,
  lidar: lidarPresentation,
  pentes: pentesPresentation,
  altitude: altitudePresentation,
  ensoleillement: ensoleillementPresentation,
  meteo: meteoPresentation,
  vent: ventPresentation,
  neige: neigePresentation,
  itineraire: itinerairePresentation,
  comparaison: comparaisonPresentation,
  poi: poiPresentation,
  rythme: rythmePresentation,
  timeline: timelinePresentation,
  graphique: graphiquePresentation,
  projets: projetsPresentation,
} satisfies Record<LandingFeatureId, LandingFeaturePresentation>;