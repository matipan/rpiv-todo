import { describe, expect, it } from "vitest";
import type { TaskState } from "../state/state.js";
import { applyGalponLink, applyGalponSettle, GALPON_METADATA_KEY } from "./galpon.js";

const initial = (): TaskState => ({
	tasks: [{ id: 1, subject: "Delegate implementation", status: "in_progress" }],
	nextId: 2,
});

const link = {
	schemaVersion: 1 as const,
	sessionId: "session",
	messageId: "message",
	operationId: "link-operation",
	todoId: 1,
	policy: "complete_on_success" as const,
	agentId: "child",
};

const settle = {
	schemaVersion: 1 as const,
	sessionId: "session",
	messageId: "message",
	operationId: "settle-operation",
	outcome: "succeeded" as const,
	resultMessageId: "result:message",
};

describe("Galpon delegation integration", () => {
	it("links a durable message to a task idempotently", () => {
		const first = applyGalponLink(initial(), link);
		expect(first.status).toBe("applied");
		expect(first.state.tasks[0]?.metadata?.[GALPON_METADATA_KEY]).toMatchObject({
			message: { messageId: "message", agentId: "child" },
		});
		expect(applyGalponLink(first.state, link).status).toBe("duplicate");
	});

	it("completes an explicitly linked task when the delegation succeeds", () => {
		const linked = applyGalponLink(initial(), link).state;
		const result = applyGalponSettle(linked, settle);
		expect(result.status).toBe("applied");
		expect(result.todoId).toBe(1);
		expect(result.state.tasks[0]?.status).toBe("completed");
		expect(applyGalponSettle(result.state, settle).status).toBe("duplicate");
	});

	it("annotates but does not complete when the policy is annotate", () => {
		const linked = applyGalponLink(initial(), { ...link, policy: "annotate" }).state;
		const result = applyGalponSettle(linked, settle);
		expect(result.state.tasks[0]?.status).toBe("in_progress");
	});

	it("does not complete a task when transport fails", () => {
		const linked = applyGalponLink(initial(), link).state;
		const result = applyGalponSettle(linked, { ...settle, outcome: "failed" });
		expect(result.state.tasks[0]?.status).toBe("in_progress");
	});

	it("cannot settle a numeric id that was reused after clear", () => {
		const linked = applyGalponLink(initial(), link).state;
		expect(linked.tasks[0]?.metadata).toBeDefined();
		const reused: TaskState = { tasks: [{ id: 1, subject: "New task", status: "in_progress" }], nextId: 2 };
		const result = applyGalponSettle(reused, settle);
		expect(result.status).toBe("rejected");
		expect(result.state.tasks[0]?.subject).toBe("New task");
	});

	it("rejects one message linked to two tasks", () => {
		const state: TaskState = {
			tasks: [
			{ id: 1, subject: "First", status: "in_progress" },
			{ id: 2, subject: "Second", status: "pending" },
		],
			nextId: 3,
		};
		const linked = applyGalponLink(state, link).state;
		const result = applyGalponLink(linked, { ...link, todoId: 2, operationId: "other" });
		expect(result.status).toBe("rejected");
	});
});
