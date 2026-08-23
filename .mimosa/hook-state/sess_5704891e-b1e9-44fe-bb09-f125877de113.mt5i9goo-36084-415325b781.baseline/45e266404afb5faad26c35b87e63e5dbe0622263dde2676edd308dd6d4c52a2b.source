import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import type { ZodType } from "zod";

interface ApiContext {
  request: Request;
  locals: Astro.locals;
  params?: Record<string, string | undefined>;
}

type Handler<T> = (data: T, ctx: ApiContext & { env: any; db: any; requestId: string; start: number }) => Promise<Response>;

export function withHandler<T>(schema: ZodType<T>, handler: Handler<T>): APIRoute {
  return async (ctx) => {
    const start = Date.now();
    const requestId = randomUUID();
    const route = new URL(ctx.request.url).pathname;

    const env = ctx.locals.runtime.env;
    const db = env.DB;

    let body: unknown;
    try {
      body = await ctx.request.json();
    } catch {
      console.log(JSON.stringify({ request_id: requestId, route, status: 400, duration_ms: Date.now() - start, reason: "invalid_json" }));
      return new Response(JSON.stringify({ error: "invalid_json" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.log(JSON.stringify({ request_id: requestId, route, status: 400, duration_ms: Date.now() - start, reason: "validation_error" }));
      return new Response(JSON.stringify({ error: "validation_error", issues: parsed.error.issues }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(parsed.data, { ...ctx, env, db, requestId, start });
  };
}
