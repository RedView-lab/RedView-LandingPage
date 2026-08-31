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
const MAX_CONTENT_LENGTH_BYTES = 12 * 1024 * 1024;
const MAX_ATTACHMENTS = 4;
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENTS_BYTES = 10 * 1024 * 1024;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_COUNTRY_LENGTH = 80;
const MAX_FEATURE_LENGTH = 120;
const MAX_ISSUE_TYPE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 4_000;
const MAX_SPORT_FIELD_LENGTH = 80;
const MAX_SPORT_ENTRIES = 8;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
]);

export const runtime = "nodejs";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

class HttpError extends Error {
  status: number;
  headers?: HeadersInit;

  constructor(status: number, message: string, headers?: HeadersInit) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.headers = headers;
  }
}

const globalRateLimitStore = globalThis as typeof globalThis & {
  __redviewFeedbackRateLimit?: Map<string, RateLimitEntry>;
};

const feedbackRateLimitStore =
  globalRateLimitStore.__redviewFeedbackRateLimit ??
  (globalRateLimitStore.__redviewFeedbackRateLimit = new Map<string, RateLimitEntry>());

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

function getAllowedOrigins(request: Request) {
  const allowed = new Set<string>([new URL(request.url).origin]);
  const configured = normalizeEnvValue(process.env.FEEDBACK_ALLOWED_ORIGINS);

  if (!configured) {
    return allowed;
  }

  for (const value of configured.split(",")) {
    const origin = normalizeEnvValue(value);
    if (origin) {
      allowed.add(origin);
    }
  }

  return allowed;
}

function assertTrustedOrigin(request: Request) {
  const allowedOrigins = getAllowedOrigins(request);
  const origin = normalizeEnvValue(request.headers.get("origin") ?? undefined);
  const referer = normalizeEnvValue(request.headers.get("referer") ?? undefined);

  if (origin && !allowedOrigins.has(origin)) {
    throw new HttpError(403, "Origine non autorisee.");
  }

  if (!origin && referer) {
    let refererOrigin = "";

    try {
      refererOrigin = new URL(referer).origin;
    } catch {
      throw new HttpError(403, "Referer non autorise.");
    }

    if (!allowedOrigins.has(refererOrigin)) {
      throw new HttpError(403, "Referer non autorise.");
    }
  }
}

function getRateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";

  return clientIp;
}

function enforceRateLimit(request: Request) {
  const now = Date.now();
  const key = getRateLimitKey(request);

  if (feedbackRateLimitStore.size > 2_000) {
    for (const [entryKey, entry] of feedbackRateLimitStore) {
      if (entry.resetAt <= now) {
        feedbackRateLimitStore.delete(entryKey);
      }
    }
  }

  const current = feedbackRateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    feedbackRateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));

    throw new HttpError(429, "Trop de tentatives. Reessayez dans quelques minutes.", {
      "Retry-After": String(retryAfterSeconds),
    });
  }

  current.count += 1;
}

function sanitizeText(value: string) {
  return value.replace(/\0/g, "").trim();
}

function getTextField(formData: FormData, name: string, maxLength: number, required = true) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    if (required) {
      throw new HttpError(400, `Champ manquant: ${name}.`);
    }

    return "";
  }

  const normalized = sanitizeText(value);

  if (required && !normalized) {
    throw new HttpError(400, `Champ manquant: ${name}.`);
  }

  if (normalized.length > maxLength) {
    throw new HttpError(400, `Le champ ${name} depasse la longueur autorisee.`);
  }

  return normalized;
}

function validateEmail(email: string) {
  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, "Adresse e-mail invalide.");
  }
}

function parseSports(value: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new HttpError(400, "Payload sports invalide.");
  }

  if (!Array.isArray(parsed)) {
    throw new HttpError(400, "Payload sports invalide.");
  }

  if (parsed.length > MAX_SPORT_ENTRIES) {
    throw new HttpError(400, "Trop de sports renseignes.");
  }

  return parsed
    .filter((entry): entry is Partial<SportEntry> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      id: typeof entry.id === "string" ? sanitizeText(entry.id).slice(0, MAX_SPORT_FIELD_LENGTH) : "",
      sport: typeof entry.sport === "string" ? sanitizeText(entry.sport).slice(0, MAX_SPORT_FIELD_LENGTH) : "",
      level: typeof entry.level === "string" ? sanitizeText(entry.level).slice(0, MAX_SPORT_FIELD_LENGTH) : "",
      annualDistance:
        typeof entry.annualDistance === "string"
          ? sanitizeText(entry.annualDistance).slice(0, MAX_SPORT_FIELD_LENGTH)
          : "",
    }))
    .filter((entry) => entry.sport || entry.level || entry.annualDistance);
}

function sanitizeFilename(filename: string) {
  const cleaned = filename.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").trim();
  return cleaned || "attachment";
}

function sanitizeSubjectValue(value: string, fallback: string) {
  const cleaned = sanitizeText(value).replace(/[\r\n]+/g, " ");
  return cleaned.slice(0, MAX_FEATURE_LENGTH) || fallback;
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
  let totalBytes = 0;

  if (files.length > MAX_ATTACHMENTS) {
    throw new HttpError(400, `Vous pouvez joindre jusqu'a ${MAX_ATTACHMENTS} captures d'ecran.`);
  }

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      throw new HttpError(415, "Format de capture non autorise. Utilisez PNG, JPG ou GIF.");
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new HttpError(400, `Chaque capture doit rester sous ${Math.floor(MAX_ATTACHMENT_BYTES / (1024 * 1024))} Mo.`);
    }

    totalBytes += file.size;

    if (totalBytes > MAX_TOTAL_ATTACHMENTS_BYTES) {
      throw new HttpError(400, "Le poids total des captures depasse la limite autorisee.");
    }

    attachments.push({
      filename: sanitizeFilename(file.name),
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || "application/octet-stream",
    });
  }

  return attachments;
}

function jsonResponse(body: Record<string, unknown>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    enforceRateLimit(request);

    const contentType = normalizeEnvValue(request.headers.get("content-type") ?? undefined).toLowerCase();
    if (!contentType.startsWith("multipart/form-data")) {
      throw new HttpError(415, "Type de requete non supporte.");
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_CONTENT_LENGTH_BYTES) {
      throw new HttpError(413, "Le formulaire est trop volumineux.");
    }

    const resend = new Resend(getRequiredEnv("RESEND_API_KEY"));
    const from = normalizeEnvValue(process.env.FEEDBACK_EMAIL_FROM) || DEFAULT_RESEND_FROM;
    const to = normalizeEnvValue(process.env.FEEDBACK_EMAIL_TO) || FEEDBACK_RECIPIENT;
    const formData = await request.formData();

    const firstName = getTextField(formData, "firstName", MAX_NAME_LENGTH, false);
    const lastName = getTextField(formData, "lastName", MAX_NAME_LENGTH, false);
    const email = getTextField(formData, "email", MAX_EMAIL_LENGTH);
    const country = getTextField(formData, "country", MAX_COUNTRY_LENGTH, false);
    const feature = getTextField(formData, "feature", MAX_FEATURE_LENGTH, false);
    const issueType = getTextField(formData, "issueType", MAX_ISSUE_TYPE_LENGTH, false);
    const description = getTextField(formData, "description", MAX_DESCRIPTION_LENGTH);
    const sports = parseSports(getTextField(formData, "sports", 16_000));
    const attachments = await getAttachments(formData);

    validateEmail(email);

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `[RedView Feedback] ${sanitizeSubjectValue(feature, "general")} - ${sanitizeSubjectValue(issueType || country, "feedback")}`,
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

    return jsonResponse({ ok: true });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, error.headers);
    }

    const message = error instanceof Error ? error.message : "";

    return jsonResponse(
      {
        error:
          message.includes("resend.dev") || message.includes("verify a domain") || message.includes("own email")
            ? "Le domaine de test Resend fonctionne seulement avec l'adresse e-mail de votre compte Resend. Pour tester maintenant, mettez FEEDBACK_EMAIL_TO sur cette adresse. Pour envoyer vers redview.app@proton.me, verifiez ensuite votre domaine."
            : "Impossible d'envoyer le feedback pour le moment.",
      },
      500
    );
  }
}