import ApiError from "../utils/apiError.js";

function errorHandler(err, req, res, next) {
    if (err instanceof ApiError && err.isOperational) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
}

export default errorHandler;