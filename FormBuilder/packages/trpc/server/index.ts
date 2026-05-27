import { router } from "./trpc";
import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { formsRouter } from "./routes/forms/route";
import { publicRouter } from "./routes/public/route";
import { analyticsRouter } from "./routes/analytics/route";
import { responsesRouter } from "./routes/responses/route";
import { userRouter } from "./routes/user/route";
import { adminRouter } from "./routes/admin/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  forms: formsRouter,
  public: publicRouter,
  analytics: analyticsRouter,
  responses: responsesRouter,
  user: userRouter,
  admin: adminRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
