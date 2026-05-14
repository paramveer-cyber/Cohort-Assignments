import { nanoid } from "nanoid";

export const generateSlug = (title) => {
    const base = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);

    return `${base}-${nanoid(6)}`;
};
