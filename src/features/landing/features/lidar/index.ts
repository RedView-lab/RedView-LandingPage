import type { LandingFeaturePresentation } from "@/features/landing/features/shared";

export const lidarPresentation: LandingFeaturePresentation = {
	id: "lidar",
	status: "ready",
	description:
		"Obtenez une vue brute du sol avec 20cm de precision pour identifier les obstacles et verifier la praticabilite reelle d'un sentier.",
	bullets: [
		"Selectionnez et telechargez la zone souhaitee, et lancez le visualisateur LIDAR.",
		"Analysez les sentiers avec precision et decelez les difficultes avant de partir sur le terrain.",
	],
	imageSrc: "/landing/features/lidar/analyse-lidar.png",
	imageAlt: "Vue LIDAR haute precision de RedView avec une route de montagne et le panneau de tuiles telechargeables.",
};