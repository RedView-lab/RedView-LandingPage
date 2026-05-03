import { NextResponse } from "next/server";
import { Resend } from "resend";

type SportEntry = {
  id: string;
  sport: string;
  level: string;
  annualDistance: string;
};

type Attachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

const FEEDBACK_RECIPIENT = "redview.app@proton.me";
const DEFAULT_RESEND_FROM = "RedView Feedback <onboarding@resend.dev>";

export const runtime = "nodejs";

function getRequiredEnv(name: string) {
  const value = normalizeEnvValue(process.env[name]);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeEnvValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value.trim().replace(/^['\"]+|['\"]+$/g, "");
}

function getTextField(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    throw new Error(`Missing field: ${name}`);
  }

  return value.trim();
}

function parseSports(value: string) {
  const parsed = JSON.parse(value) as SportEntry[];

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid sports payload.");
  }

  return parsed.filter(
    (entry) =>
      typeof entry?.sport === "string" || typeof entry?.level === "string" || typeof entry?.annualDistance === "string"
  );
}

function renderTextBody(fields: {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  feature: string;
  issueType: string;
  description: string;
  sports: SportEntry[];
}) {
  const sportLines = fields.sports.length
    ? fields.sports
        .map(
          (entry, index) =>
            `${index + 1}. Sport: ${entry.sport || "-"}, Niveau: ${entry.level || "-"}, Moyenne annuelle: ${entry.annualDistance || "-"}`
        )
        .join("\n")
    : "Aucune pratique renseignee.";

  return [
    "Nouveau feedback RedView",
    "",
    `Prenom: ${fields.firstName || "-"}`,
    `Nom: ${fields.lastName || "-"}`,
    `Email: ${fields.email}`,
    `Pays: ${fields.country}`,
    `Fonctionnalite: ${fields.feature}`,
    `Type de probleme: ${fields.issueType || "-"}`,
    "",
    "Pratique:",
    sportLines,
    "",
    "Description:",
    fields.description,
  ].join("\n");
}

function renderHtmlBody(fields: {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  feature: string;
  issueType: string;
  description: string;
  sports: SportEntry[];
}) {
  const escapeHtml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const sportItems = fields.sports.length
    ? fields.sports
        .map(
          (entry) =>
            `<li><strong>${escapeHtml(entry.sport || "-")}</strong> · niveau ${escapeHtml(entry.level || "-")} · ${escapeHtml(entry.annualDistance || "-")}</li>`
        )
        .join("")
    : "<li>Aucune pratique renseignee.</li>";

  return `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <h2 style="margin: 0 0 16px;">Nouveau feedback RedView</h2>
      <p><strong>Prenom:</strong> ${escapeHtml(fields.firstName || "-")}</p>
      <p><strong>Nom:</strong> ${escapeHtml(fields.lastName || "-")}</p>
      <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
      <p><strong>Pays:</strong> ${escapeHtml(fields.country)}</p>
      <p><strong>Fonctionnalite:</strong> ${escapeHtml(fields.feature)}</p>
      <p><strong>Type de probleme:</strong> ${escapeHtml(fields.issueType || "-")}</p>
      <h3 style="margin: 20px 0 8px;">Pratique</h3>
      <ul>${sportItems}</ul>
      <h3 style="margin: 20px 0 8px;">Description</h3>
      <p style="white-space: pre-wrap;">${escapeHtml(fields.description)}</p>
    </div>
  `;
}

async function getAttachments(formData: FormData) {
  const files = formData.getAll("screenshots");
  const attachments: Attachment[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    attachments.push({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || "application/octet-stream",
    });
  }

  return attachments;
}
export async function POST(request: Request) {
  try {
    const resend = new Resend(getRequiredEnv("RESEND_API_KEY"));
    const from = normalizeEnvValue(process.env.FEEDBACK_EMAIL_FROM) || DEFAULT_RESEND_FROM;
    const to = normalizeEnvValue(process.env.FEEDBACK_EMAIL_TO) || FEEDBACK_RECIPIENT;
    const formData = await request.formData();

    const firstName = getTextField(formData, "firstName");
    const lastName = getTextField(formData, "lastName");
    const email = getTextField(formData, "email");
    const country = getTextField(formData, "country");
    const feature = getTextField(formData, "feature");
    const issueType = getTextField(formData, "issueType");
    const description = getTextField(formData, "description");
    const sports = parseSports(getTextField(formData, "sports"));
    const attachments = await getAttachments(formData);

    if (!email || !description) {
      return NextResponse.json({ error: "Les champs e-mail et description sont requis." }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `[RedView Feedback] ${feature} - ${issueType || country}`,
      text: renderTextBody({
        firstName,
        lastName,
        email,
        country,
        feature,
        issueType,
        description,
        sports,
      }),
      html: renderHtmlBody({
        firstName,
        lastName,
        email,
        country,
        feature,
        issueType,
        description,
        sports,
      }),
      attachments,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible d'envoyer le feedback pour le moment.";

    return NextResponse.json(
      {
        error:
          message.includes("resend.dev") || message.includes("verify a domain") || message.includes("own email")
            ? "Le domaine de test Resend fonctionne seulement avec l'adresse e-mail de votre compte Resend. Pour tester maintenant, mettez FEEDBACK_EMAIL_TO sur cette adresse. Pour envoyer vers redview.app@proton.me, verifiez ensuite votre domaine."
            : message,
      },
      { status: 500 }
    );
  }
}