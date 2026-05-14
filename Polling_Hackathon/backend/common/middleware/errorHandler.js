import ApiError from "../utils/api-error.js";

export const errorHandler = (err, req, res, _next) => {
    if (err.name === "ZodError" && Array.isArray(err.errors)) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
        });
    }

    if (err instanceof ApiError && err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    console.error("[ErrorHandler] Unhandled error:", err);

    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : err.message,
    });
};