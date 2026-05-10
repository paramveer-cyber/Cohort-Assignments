export const Role = Object.freeze({
    USER:  "user",
    ADMIN: "admin",
});

export const VALID_ROLES = new Set(Object.values(Role));
