import type { Metadata } from "next";
import { LandingFeedbackFormPage } from "@/features/landing/components/form/LandingFeedbackFormPage";

export const metadata: Metadata = {
  title: "Formulaire de retour utilisateur | RedView",
  description: "Questionnaire de feedback RedView.",
};

export default function FormulairePage() {
  return <LandingFeedbackFormPage />;
}