import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import bcrypt from "bcryptjs";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  const { usersTable, themesTable, formsTable, formFieldsTable, formResponsesTable } =
    await import("./schema");
  const { sql, eq } = await import("drizzle-orm");

  console.log("Seeding database...");

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash("Demo1234!", salt);

  const [demoUser] = await db
    .insert(usersTable)
    .values({
      name: "Demo Creator",
      email: "demo@formcraft.app",
      username: "democreator",
      salt,
      passwordHash,
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  const userId =
    demoUser?.id ??
    (
      await db.select().from(usersTable).where(eq(usersTable.email, "demo@formcraft.app")).limit(1)
    )[0]!.id;

  const themeRows = [
    {
      name: "Classic Craft",
      description: "Default Minecraft dark — stone & obsidian",
      primaryColor: "#5aaa38",
      backgroundColor: "#0e0e0e",
      textColor: "#e8e8e8",
      fontFamily: "var(--font-mc), monospace",
      isDefault: true,
    },
    {
      name: "Nether Fortress",
      description: "Deep crimson — netherrack and magma",
      primaryColor: "#ff4422",
      backgroundColor: "#1a0808",
      textColor: "#ffd0b0",
      fontFamily: "var(--font-mc), monospace",
      isDefault: false,
    },
    {
      name: "Ocean Monument",
      description: "Deep sea — prismarine and dark water",
      primaryColor: "#20d4e8",
      backgroundColor: "#050f1a",
      textColor: "#b0f0ff",
      fontFamily: "var(--font-mc), monospace",
      isDefault: false,
    },
    {
      name: "End Cities",
      description: "Void purple — endstone and chorus",
      primaryColor: "#b060ff",
      backgroundColor: "#0a0512",
      textColor: "#e8d0ff",
      fontFamily: "var(--font-mc), monospace",
      isDefault: false,
    },
    {
      name: "Forest Biome",
      description: "Overgrown green — oak and leaves",
      primaryColor: "#3a9828",
      backgroundColor: "#0a1408",
      textColor: "#d0f0b0",
      fontFamily: "var(--font-mc), monospace",
      isDefault: false,
    },
    {
      name: "Desert Temple",
      description: "Warm sandstone — mesa and gold",
      primaryColor: "#e8a020",
      backgroundColor: "#1a1408",
      textColor: "#f5e8cc",
      fontFamily: "var(--font-mc), monospace",
      isDefault: false,
    },
    {
      name: "Ice Plains",
      description: "Frozen tundra — packed ice and snow",
      primaryColor: "#88ccff",
      backgroundColor: "#0a0e14",
      textColor: "#d0eeff",
      fontFamily: "var(--font-mc), monospace",
      isDefault: false,
    },
  ];

  const insertedThemes = await db
    .insert(themesTable)
    .values(themeRows)
    .onConflictDoNothing()
    .returning();
  const themeMap = new Map(insertedThemes.map((t) => [t.name, t.id]));

  const existingThemes = await db.select().from(themesTable);
  existingThemes.forEach((t) => themeMap.set(t.name, t.id));

  const animeFormId = crypto.randomUUID();
  const startupFormId = crypto.randomUUID();
  const devFormId = crypto.randomUUID();

  const animeSlug = "anime-personality-quiz-" + Date.now().toString(36);
  const startupSlug = "startup-market-fit-survey-" + Date.now().toString(36);
  const devSlug = "developer-experience-survey-" + Date.now().toString(36);

  const animeForm = await db
    .insert(formsTable)
    .values({
      id: animeFormId,
      creatorId: userId,
      title: "Anime Personality Quiz",
      slug: animeSlug,
      description: "Discover which anime archetype matches your personality!",
      status: "published",
      visibility: "public",
      themeId: themeMap.get("Sakura") ?? null,
      successMessage: "Sugoi! Your anime personality has been revealed!",
      responseCount: 0,
      viewCount: 47,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isTemplate: true,
    })
    .onConflictDoNothing()
    .returning();

  const startupForm = await db
    .insert(formsTable)
    .values({
      id: startupFormId,
      creatorId: userId,
      title: "Startup Market Fit Survey",
      slug: startupSlug,
      description: "Help us understand if we've achieved product-market fit",
      status: "published",
      visibility: "public",
      themeId: themeMap.get("Midnight") ?? null,
      successMessage: "Thanks! Your feedback shapes our product roadmap.",
      responseCount: 0,
      viewCount: 83,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      isTemplate: true,
    })
    .onConflictDoNothing()
    .returning();

  const devForm = await db
    .insert(formsTable)
    .values({
      id: devFormId,
      creatorId: userId,
      title: "Developer Experience Survey",
      slug: devSlug,
      description: "Rate your experience with popular dev tools and frameworks",
      status: "published",
      visibility: "unlisted",
      themeId: themeMap.get("Matrix") ?? null,
      successMessage: "Stack acknowledged. May your builds be green.",
      responseCount: 0,
      viewCount: 31,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    })
    .onConflictDoNothing()
    .returning();

  const animeFieldRows = [
    {
      formId: animeFormId,
      label: "What is your name?",
      fieldType: "short_text" as const,
      required: true,
      orderIndex: 0,
      placeholder: "Enter your name",
    },
    {
      formId: animeFormId,
      label: "Favorite anime genre?",
      fieldType: "single_select" as const,
      required: true,
      orderIndex: 1,
      config: { options: ["Shonen", "Seinen", "Shoujo", "Isekai", "Mecha", "Slice of Life"] },
    },
    {
      formId: animeFormId,
      label: "Pick your battle style",
      fieldType: "single_select" as const,
      required: true,
      orderIndex: 2,
      config: { options: ["Brute force", "Strategy", "Magic", "Stealth", "Teamwork"] },
    },
    {
      formId: animeFormId,
      label: "How many episodes do you watch per week?",
      fieldType: "rating" as const,
      required: false,
      orderIndex: 3,
      config: { max: 10 },
    },
    {
      formId: animeFormId,
      label: "Describe your ideal anime world",
      fieldType: "long_text" as const,
      required: false,
      orderIndex: 4,
      placeholder: "Describe in detail...",
    },
    {
      formId: animeFormId,
      label: "Your email (get results)",
      fieldType: "email" as const,
      required: false,
      orderIndex: 5,
      placeholder: "anime@fan.com",
    },
  ];

  const startupFieldRows = [
    {
      formId: startupFormId,
      label: "What best describes you?",
      fieldType: "single_select" as const,
      required: true,
      orderIndex: 0,
      config: { options: ["Founder", "Investor", "Employee", "Customer", "Advisor"] },
    },
    {
      formId: startupFormId,
      label: "How disappointed would you be if we shut down?",
      fieldType: "single_select" as const,
      required: true,
      orderIndex: 1,
      config: { options: ["Very disappointed", "Somewhat disappointed", "Not disappointed"] },
    },
    {
      formId: startupFormId,
      label: "What is the main benefit you get from us?",
      fieldType: "long_text" as const,
      required: true,
      orderIndex: 2,
      placeholder: "Be specific...",
    },
    {
      formId: startupFormId,
      label: "What type of person would benefit most?",
      fieldType: "short_text" as const,
      required: false,
      orderIndex: 3,
      placeholder: "e.g. early-stage founders",
    },
    {
      formId: startupFormId,
      label: "Overall satisfaction (1-10)",
      fieldType: "rating" as const,
      required: true,
      orderIndex: 4,
      config: { max: 10 },
    },
    {
      formId: startupFormId,
      label: "Which features do you use most?",
      fieldType: "multi_select" as const,
      required: false,
      orderIndex: 5,
      config: { options: ["Form creation", "Analytics", "Sharing", "Templates", "API"] },
    },
    {
      formId: startupFormId,
      label: "Your email",
      fieldType: "email" as const,
      required: false,
      orderIndex: 6,
    },
  ];

  const devFieldRows = [
    {
      formId: devFormId,
      label: "Primary programming language?",
      fieldType: "single_select" as const,
      required: true,
      orderIndex: 0,
      config: { options: ["TypeScript", "Python", "Rust", "Go", "Java", "C++", "Other"] },
    },
    {
      formId: devFormId,
      label: "Years of experience",
      fieldType: "number" as const,
      required: true,
      orderIndex: 1,
      validationRules: { min: 0, max: 50 },
    },
    {
      formId: devFormId,
      label: "Rate your current dev tooling (1-10)",
      fieldType: "rating" as const,
      required: true,
      orderIndex: 2,
      config: { max: 10 },
    },
    {
      formId: devFormId,
      label: "Frameworks you use",
      fieldType: "multi_select" as const,
      required: false,
      orderIndex: 3,
      config: {
        options: ["React", "Next.js", "Vue", "Svelte", "Express", "Fastify", "Django", "FastAPI"],
      },
    },
    {
      formId: devFormId,
      label: "Biggest pain point?",
      fieldType: "long_text" as const,
      required: true,
      orderIndex: 4,
      placeholder: "Tell us what slows you down...",
    },
    {
      formId: devFormId,
      label: "Remote or in-office?",
      fieldType: "single_select" as const,
      required: false,
      orderIndex: 5,
      config: { options: ["Fully remote", "Hybrid", "In-office"] },
    },
  ];

  const animeFields = await db
    .insert(formFieldsTable)
    .values(animeFieldRows)
    .onConflictDoNothing()
    .returning();
  const startupFields = await db
    .insert(formFieldsTable)
    .values(startupFieldRows)
    .onConflictDoNothing()
    .returning();
  const devFields = await db
    .insert(formFieldsTable)
    .values(devFieldRows)
    .onConflictDoNothing()
    .returning();

  const animeFieldIds = animeFields.map((f) => f.id);
  const startupFieldIds = startupFields.map((f) => f.id);
  const devFieldIds = devFields.map((f) => f.id);

  const animeResponses = [
    {
      answers: {
        [animeFieldIds[0]!]: "Naruto Fan",
        [animeFieldIds[1]!]: "Shonen",
        [animeFieldIds[2]!]: "Brute force",
        [animeFieldIds[3]!]: 8,
        [animeFieldIds[5]!]: "naruto@leaf.jp",
      },
      submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [animeFieldIds[0]!]: "Rem Simp",
        [animeFieldIds[1]!]: "Isekai",
        [animeFieldIds[2]!]: "Magic",
        [animeFieldIds[3]!]: 10,
        [animeFieldIds[4]!]: "A world with subaru and rem",
        [animeFieldIds[5]!]: "rem@rezero.com",
      },
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [animeFieldIds[0]!]: "Light Yagami Jr",
        [animeFieldIds[1]!]: "Seinen",
        [animeFieldIds[2]!]: "Strategy",
        [animeFieldIds[3]!]: 7,
      },
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [animeFieldIds[0]!]: "Mecha Pilot",
        [animeFieldIds[1]!]: "Mecha",
        [animeFieldIds[2]!]: "Teamwork",
        [animeFieldIds[3]!]: 9,
      },
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [animeFieldIds[0]!]: "Slice Queen",
        [animeFieldIds[1]!]: "Slice of Life",
        [animeFieldIds[2]!]: "Stealth",
        [animeFieldIds[3]!]: 6,
      },
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const startupResponses = [
    {
      answers: {
        [startupFieldIds[0]!]: "Founder",
        [startupFieldIds[1]!]: "Very disappointed",
        [startupFieldIds[2]!]: "Form builder that doesn't suck",
        [startupFieldIds[4]!]: 9,
        [startupFieldIds[5]!]: ["Analytics", "Form creation"],
      },
      submittedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [startupFieldIds[0]!]: "Customer",
        [startupFieldIds[1]!]: "Somewhat disappointed",
        [startupFieldIds[2]!]: "Easy sharing and embed",
        [startupFieldIds[4]!]: 7,
        [startupFieldIds[5]!]: ["Sharing", "Templates"],
      },
      submittedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [startupFieldIds[0]!]: "Investor",
        [startupFieldIds[1]!]: "Very disappointed",
        [startupFieldIds[2]!]: "Type-safe form APIs",
        [startupFieldIds[4]!]: 10,
        [startupFieldIds[5]!]: ["API", "Analytics"],
      },
      submittedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [startupFieldIds[0]!]: "Employee",
        [startupFieldIds[1]!]: "Very disappointed",
        [startupFieldIds[2]!]: "Best DX for form builders",
        [startupFieldIds[4]!]: 8,
      },
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [startupFieldIds[0]!]: "Advisor",
        [startupFieldIds[1]!]: "Not disappointed",
        [startupFieldIds[2]!]: "Nice to have for demos",
        [startupFieldIds[4]!]: 5,
      },
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [startupFieldIds[0]!]: "Founder",
        [startupFieldIds[1]!]: "Very disappointed",
        [startupFieldIds[2]!]: "Handles all our onboarding forms",
        [startupFieldIds[4]!]: 9,
        [startupFieldIds[5]!]: ["Form creation", "Sharing"],
      },
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const devResponses = [
    {
      answers: {
        [devFieldIds[0]!]: "TypeScript",
        [devFieldIds[1]!]: 5,
        [devFieldIds[2]!]: 8,
        [devFieldIds[3]!]: ["React", "Next.js", "Fastify"],
        [devFieldIds[4]!]: "Type errors in monorepos",
        [devFieldIds[5]!]: "Fully remote",
      },
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [devFieldIds[0]!]: "Python",
        [devFieldIds[1]!]: 3,
        [devFieldIds[2]!]: 6,
        [devFieldIds[3]!]: ["Django", "FastAPI"],
        [devFieldIds[4]!]: "Dependency management",
        [devFieldIds[5]!]: "Hybrid",
      },
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      answers: {
        [devFieldIds[0]!]: "Rust",
        [devFieldIds[1]!]: 7,
        [devFieldIds[2]!]: 9,
        [devFieldIds[3]!]: [],
        [devFieldIds[4]!]: "Borrow checker learning curve was steep but worth it",
        [devFieldIds[5]!]: "Fully remote",
      },
      submittedAt: new Date(),
    },
  ];

  for (const r of animeResponses) {
    await db
      .insert(formResponsesTable)
      .values({ formId: animeFormId, answers: r.answers, submittedAt: r.submittedAt });
  }
  for (const r of startupResponses) {
    await db
      .insert(formResponsesTable)
      .values({ formId: startupFormId, answers: r.answers, submittedAt: r.submittedAt });
  }
  for (const r of devResponses) {
    await db
      .insert(formResponsesTable)
      .values({ formId: devFormId, answers: r.answers, submittedAt: r.submittedAt });
  }

  await db
    .update(formsTable)
    .set({ responseCount: animeResponses.length })
    .where(eq(formsTable.id, animeFormId));
  await db
    .update(formsTable)
    .set({ responseCount: startupResponses.length })
    .where(eq(formsTable.id, startupFormId));
  await db
    .update(formsTable)
    .set({ responseCount: devResponses.length })
    .where(eq(formsTable.id, devFormId));

  console.log("✓ Seed complete");
  console.log(`  Demo user: demo@formcraft.app / Demo1234!`);
  console.log(`  Anime form slug: ${animeSlug}`);
  console.log(`  Startup form slug: ${startupSlug}`);
  console.log(`  Dev form slug: ${devSlug}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
