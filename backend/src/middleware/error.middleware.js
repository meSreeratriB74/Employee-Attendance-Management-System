export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

export const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(
            (error) => error.message
        );

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyPattern || {})[0];

        return res.status(409).json({
            success: false,
            message: `${duplicateField || "Field"} already exists`
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : err.message || "Internal server error"
    });
};