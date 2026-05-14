import { db } from "../../db/index.js";
import { responses, answers } from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export const getResponseCount = async (pollId) => {
    const [row] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(responses)
        .where(eq(responses.pollId, pollId));
    return row?.count ?? 0;
};

export const getOptionCounts = async (pollId) => {
    return db
        .select({
            questionId:       answers.questionId,
            selectedOptionId: answers.selectedOptionId,
            count:            sql`count(*)`.mapWith(Number),
        })
        .from(answers)
        .innerJoin(responses, eq(answers.responseId, responses.id))
        .where(eq(responses.pollId, pollId))
        .groupBy(answers.questionId, answers.selectedOptionId);
};

export const getParticipationOverTime = async (pollId) => {
    return db
        .select({
            hour:  sql`date_trunc('hour', ${responses.submittedAt})`,
            count: sql`count(*)`.mapWith(Number),
        })
        .from(responses)
        .where(
            and(
                eq(responses.pollId, pollId),
                sql`${responses.submittedAt} > now() - interval '7 days'`
            )
        )
        .groupBy(sql`date_trunc('hour', ${responses.submittedAt})`)
        .orderBy(sql`date_trunc('hour', ${responses.submittedAt})`);
};
