/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { beforeAll, describe, expect, it, vi } from "vitest";
import { app } from "@azure/functions";
import { z } from "zod";
import { requestHandler } from "../handler/handlerWrapper.mjs";
import { sendFollowUpCmdSchema } from "../schema/sendFollowUpCmdSchema.mjs";
import { shareQuestionCmdSchema } from "../schema/shareQuestionCmdSchema.mjs";

const registrations = new Map<string, any>();
let postInvocation;
let document;

beforeAll(async () => {
  vi.spyOn(app, "http").mockImplementation((name, options) => void registrations.set(name, options));
  vi.spyOn(app.hook, "postInvocation").mockImplementation((handler) => void (postInvocation = handler) as any);
  await import("../route.mjs");

  const [, docOptions] = [...registrations].find(([, options]) => options.route === "openapi-3.1.0.json");
  const request = { url: "http://localhost:7071/openapi-3.1.0.json", headers: new Headers() };
  const context = { log: () => {}, warn: () => {} };
  const hookContext = { inputs: [request], result: await docOptions.handler(request, context) };
  postInvocation(hookContext);
  document = JSON.parse(hookContext.result.body);
});

describe("OpenAPI document", () => {
  it("keeps the existing Azure Function names, routes and methods", () => {
    const routes = Object.fromEntries([...registrations].map(([name, o]) => [name, `${o.methods} ${o.route}`]));
    expect(routes).toMatchObject({
      CreateQuestion: "POST question",
      GetQuestionById: "GET question/{id}",
      UpdateQuestionById: "PUT question/{id}",
      PatchQuestionById: "PATCH question/{id}",
      AddAnswer: "POST question/{id}/answer",
      GetAnswerById: "GET question/{id}/answer/{answerId}",
      GetQuestionListByUser: "GET questions",
      GetAnswerListByQuestionId: "GET question/{id}/answers",
      ShareQuestion: "POST question/{id}/share",
      GetSharedQuestionList: "GET sharedQuestions",
      SendFollowUpCmd: "POST sendFollowUpCmd",
      ShareQuestionCmd: "POST shareQuestionCmd",
      getEventByCorrelationId: "GET getEventByCorrelationId/{name}/{correlationId}",
    });
    expect([...registrations.values()].every((o) => o.authLevel === "anonymous")).toBe(true);
  });

  it("documents HTTP paths without the library's default api prefix", () => {
    expect(document.openapi).toBe("3.1.0");
    expect(Object.keys(document.paths).sort()).toEqual(
      [
        "/getEventByCorrelationId/{name}/{correlationId}",
        "/question",
        "/question/{id}",
        "/question/{id}/answer",
        "/question/{id}/answer/{answerId}",
        "/question/{id}/answers",
        "/question/{id}/share",
        "/questions",
        "/sendFollowUpCmd",
        "/shareQuestionCmd",
        "/sharedQuestions",
      ].sort()
    );
  });

  it("allows microsoftOAuth OR bearerAuth", () => {
    const scope = `api://${process.env.CLIENT_ID}/access_as_user`;
    const { microsoftOAuth, bearerAuth } = document.components.securitySchemes;
    expect(microsoftOAuth.flows.authorizationCode.authorizationUrl).toBe(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize`
    );
    expect(Object.keys(microsoftOAuth.flows.authorizationCode.scopes)).toEqual([scope]);
    expect(bearerAuth).toEqual({ type: "http", scheme: "bearer", bearerFormat: "JWT" });
    expect(document.security).toEqual([{ microsoftOAuth: [scope] }, { bearerAuth: [] }]);
  });

  it("never asks clients for server-generated values", () => {
    const requestBodies = JSON.stringify(
      Object.values(document.paths).flatMap((path: any) => Object.values(path).map((op: any) => op.requestBody ?? {}))
    );
    const schemas = JSON.stringify(document.components.schemas);
    for (const field of ["userData", "profileId", "externalId", "correlationId", "customParams"]) {
      expect(requestBodies).not.toContain(`"${field}"`);
    }
    expect(schemas).toContain('"ShareQuestionCmd"');
    expect(document.components.schemas.ShareQuestionCmd.properties).not.toHaveProperty("profileId");
  });
});

describe("requestHandler validation", () => {
  const call = (handler, body, contentType = "application/json") =>
    handler(
      {
        method: "POST",
        url: "http://localhost/test",
        headers: new Headers({ "content-type": contentType }),
        json: async () => JSON.parse(body),
      },
      { invocationId: "test", functionName: "ValidationTest" }
    );
  const echo = async (request) => ({ return: request.clientParams });

  it("validates every schema, not just the first", async () => {
    const handler = requestHandler(echo, {
      requireAuth: false,
      schemas: [z.object({ a: z.string() }), z.object({ b: z.string() })],
    });
    const response = await call(handler, JSON.stringify({ a: "x" }));
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({ success: false, message: "Validation failed: b: Invalid input: expected string, received undefined" });
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await call(requestHandler(echo, { requireAuth: false }), "{");
    expect(response.status).toBe(400);
  });

  it("passes parsed data to the business handler", async () => {
    const body = { newQuestionId: "985953ea-77d4-4b64-b11c-764d51c93b73", receiverIds: ["d520b3fb-f2ce-4d08-b865-6d813812b7c3"] };
    const response = await call(requestHandler(echo, { requireAuth: false, schemas: [shareQuestionCmdSchema] }), JSON.stringify(body));
    expect(response.status).toBe(200);
    expect(response.jsonBody.return).toEqual(body);
  });
});

describe("command schemas keep the old Joi contract", () => {
  const id = "985953ea-77d4-4b64-b11c-764d51c93b73";
  const followUp = { newQuestionId: id, question: [{ questionId: id, option: ["1"] }] };

  it.each([
    [sendFollowUpCmdSchema, followUp, true],
    [sendFollowUpCmdSchema, { ...followUp, isSave: true }, true],
    [sendFollowUpCmdSchema, { ...followUp, extra: 1 }, false],
    [sendFollowUpCmdSchema, { ...followUp, newQuestionId: "not-a-uuid" }, false],
    [sendFollowUpCmdSchema, { ...followUp, newQuestionId: "985953ea-77d4-1b64-b11c-764d51c93b73" }, false],
    [sendFollowUpCmdSchema, { ...followUp, question: [{ questionId: id, option: [] }] }, false],
    [sendFollowUpCmdSchema, { ...followUp, question: [{ questionId: id, option: [""] }] }, false],
    [sendFollowUpCmdSchema, { ...followUp, question: [{ questionId: id, option: [1] }] }, false],
    [sendFollowUpCmdSchema, { ...followUp, question: [{ questionId: id, option: ["1"], x: 1 }] }, false],
    [sendFollowUpCmdSchema, { ...followUp, question: [] }, false],
    [shareQuestionCmdSchema, { newQuestionId: id, receiverIds: [id] }, true],
    [shareQuestionCmdSchema, { newQuestionId: id, receiverIds: [] }, false],
    [shareQuestionCmdSchema, { newQuestionId: id, receiverIds: [id], profileId: id }, false],
    [shareQuestionCmdSchema, {}, false],
  ])("case %#", (schema, input, valid) => {
    expect(schema.safeParse(input).success).toBe(valid);
  });
});
