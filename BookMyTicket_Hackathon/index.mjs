import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/auth.routes.js";
import pool from "./common/db/db.js";
import verifyJWT from "./common/middleware/verifyJWT.js";
import errorHandler from "./common/middleware/errorHandler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080;

const app = new express();

app.use(express.json());
// app.use(cors()); I have commented this out as this project doesn't have a separate frontend and same origin requests dont need cors headers. Thus i have opted for this safer route.
app.use(cookieParser());
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/seats", verifyJWT, async (req, res, next) => {
    try {
        const result = await pool.query("select * from seats ORDER BY seat_no");
        res.send(result.rows);
    } catch (ex) {
        next(ex);
    }
});

app.put("/:id/:name", verifyJWT, async (req, res) => {
    const conn = await pool.connect();
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const name = req.params.name;

        await conn.query("BEGIN");

        const sql = "SELECT * FROM seats WHERE id = $1 AND isbooked = 0 FOR UPDATE";
        const result = await conn.query(sql, [id]);

        if (result.rowCount === 0) {
            await conn.query("ROLLBACK");
            return res.status(409).json({ success: false, message: "Seat already booked" });
        }

        const sqlU = "UPDATE seats SET isbooked = 1, name = $2, booked_by = $3 WHERE id = $1 RETURNING *";
        const updateResult = await conn.query(sqlU, [id, name, userId]);

        await conn.query("COMMIT");
        res.status(200).json({ success: true, message: "Seat booked!", data: updateResult.rows[0] });
    } 
    catch (ex) {
        await conn.query("ROLLBACK").catch(() => {});
        console.error(ex);
        next(ex);
    }
    finally {
        conn.release();
    }
});

app.use(errorHandler);

app.listen(port, () => console.log("Server starting on port: " + port));
