import { buildSessionEntries, createMockCtx, makeTodoToolResult, makeUserMessage } from "@juicesharp/rpiv-test-utils";
import { describe, expect, it } from "vitest";
import { __resetState, getNextId, getTodos, reconstructTodoState, type Task, type TaskDetails } from "./todo.js";

function buildBranch(snapshots: TaskDetails[]) {
	const messages = snapshots.map((s) => makeTodoToolResult(s));
	return buildSessionEntries([makeUserMessage("hi"), ...messages]);
}

const taskFixture = (id: number, subject: string, extra: Partial<Task> = {}): Task => ({
	id,
	subject,
	status: "pending",
	...extra,
});

describe("reconstructTodoState", () => {
	it("leaves state empty when branch has no todo toolResults", () => {
		__resetState();
		const ctx = createMockCtx({ branch: buildSessionEntries([makeUserMessage("hi")]) });
		reconstructTodoState(ctx);
		expect(getTodos()).toEqual([]);
		expect(getNextId()).toBe(1);
	});

	it("replays the last snapshot (last-write-wins)", () => {
		__resetState();
		const ctx = createMockCtx({
			branch: buildBranch([
				{
					action: "create",
					params: {},
					tasks: [taskFixture(1, "old")],
					nextId: 2,
				},
				{
					action: "create",
					params: {},
					tasks: [taskFixture(1, "old"), taskFixture(2, "new")],
					nextId: 3,
				},
			]),
		});
		reconstructTodoState(ctx);
		expect(getTodos()).toHaveLength(2);
		expect(getNextId()).toBe(3);
	});

	it("clones tasks so mutating the fixture does not mutate replayed state", () => {
		__resetState();
		const fixture: Task = taskFixture(1, "original");
		const ctx = createMockCtx({
			branch: buildBranch([{ action: "create", params: {}, tasks: [fixture], nextId: 2 }]),
		});
		reconstructTodoState(ctx);
		const replayed = getTodos()[0];
		expect(replayed).not.toBe(fixture);
		expect(replayed.subject).toBe("original");
	});

	it("resets both tasks and nextId even when branch is empty", () => {
		__resetState();
		const ctx1 = createMockCtx({
			branch: buildBranch([{ action: "create", params: {}, tasks: [taskFixture(1, "x")], nextId: 2 }]),
		});
		reconstructTodoState(ctx1);
		expect(getNextId()).toBe(2);

		const ctx2 = createMockCtx({ branch: buildSessionEntries([makeUserMessage("hi")]) });
		reconstructTodoState(ctx2);
		expect(getTodos()).toEqual([]);
		expect(getNextId()).toBe(1);
	});
});
