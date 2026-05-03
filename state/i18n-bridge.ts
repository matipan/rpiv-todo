/**
 * i18n bridge for rpiv-todo — single thin import surface so every call site
 * routes through one module. Backed by `@juicesharp/rpiv-i18n`'s SDK.
 *
 * - `t(key, fallback)` is `scope("@juicesharp/rpiv-todo")`.
 * - `formatStatusLabel(status)` resolves a TaskStatus to its locale-aware
 *   label via the canonical `status.*` namespace, with the English literal
 *   as fallback so nothing renders blank if the namespace isn't registered.
 *   This is the SINGLE point of localization for status words — overlay,
 *   /todos header, /todos render-call all route through here.
 *
 * Strings are registered ONCE at extension load (see ../index.ts). Call sites
 * MUST use this module at render time — never bake the result into a top-level
 * `const X = formatStatusLabel(...)`.
 */

import { scope } from "@juicesharp/rpiv-i18n";
import type { TaskStatus } from "../tool/types.js";

export const I18N_NAMESPACE = "@juicesharp/rpiv-todo";

export const t = scope(I18N_NAMESPACE);

const STATUS_LABEL_PENDING = "pending";
const STATUS_LABEL_IN_PROGRESS = "in progress";
const STATUS_LABEL_COMPLETED = "completed";
const STATUS_LABEL_DELETED = "deleted";

export function formatStatusLabel(status: TaskStatus): string {
	switch (status) {
		case "pending":
			return t("status.pending", STATUS_LABEL_PENDING);
		case "in_progress":
			return t("status.in_progress", STATUS_LABEL_IN_PROGRESS);
		case "completed":
			return t("status.completed", STATUS_LABEL_COMPLETED);
		case "deleted":
			return t("status.deleted", STATUS_LABEL_DELETED);
	}
}
