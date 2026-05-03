# rpiv-todo

<div align="center">
  <a href="https://github.com/juicesharp/rpiv-mono/tree/main/packages/rpiv-todo">
    <picture>
      <img src="https://raw.githubusercontent.com/juicesharp/rpiv-mono/main/packages/rpiv-todo/docs/cover.png" alt="rpiv-todo cover" width="50%">
    </picture>
  </a>
</div>

[![npm version](https://img.shields.io/npm/v/@juicesharp/rpiv-todo.svg)](https://www.npmjs.com/package/@juicesharp/rpiv-todo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Give the model a todo list it can keep across long sessions. `rpiv-todo` adds the `todo` tool, the `/todos` slash command, and a live overlay above the editor to [Pi Agent](https://github.com/badlogic/pi-mono) — tasks survive `/reload` and conversation compaction, so the model picks up where it left off.

![Todo overlay widget above the Pi editor](https://raw.githubusercontent.com/juicesharp/rpiv-mono/main/packages/rpiv-todo/docs/overlay.jpg)

## Features

- **Live overlay above the editor** — see the model's plan at all times; auto-hides when empty.
- **Survives `/reload` and compaction** — tasks replay from the conversation branch, not disk.
- **Status states** — pending, in_progress, completed, plus a deleted tombstone for audit.
- **Dependency tracking** — `blockedBy` with cycle detection, so the model can sequence work.
- **Smart truncation** — 12-line collapse threshold; completed tasks drop first, pending tasks stay visible last.

## Install

```bash
pi install npm:@juicesharp/rpiv-todo
```

Then restart your Pi session.

### Optional: language picker + `--locale` flag

The overlay and `/todos` command auto-detect your UI locale from `LANG` / `LC_ALL` and fall back to English; with that alone, a user whose shell is set to e.g. `pt_BR.UTF-8` already sees Portuguese without any extra step. To **change locale interactively** (`/languages` slash command) or **pin one at startup** (`pi --locale uk`), also install the SDK that owns those surfaces:

```bash
pi install npm:@juicesharp/rpiv-i18n
```

Without it, locale detection still works via `~/.config/rpiv-i18n/locale.json` (hand-edit `{"locale":"uk"}` and restart) and your shell environment — only the picker and flag are missing. Users who installed via `pi install npm:@juicesharp/rpiv-pi` + `/rpiv-setup` get the SDK automatically.

## Tool

- **`todo`** — create / update / list / get / delete / clear tasks. 4-state
  machine (pending → in_progress → completed, plus deleted tombstone).
  Supports `blockedBy` dependency tracking with cycle detection. Tasks persist
  via branch replay — survive session compact and `/reload`.

## Commands

- **`/todos`** — print the current todo list grouped by status.

## Overlay

The aboveEditor widget auto-renders whenever any non-deleted tasks exist.
12-line collapse threshold; completed tasks drop first on overflow, pending
tasks truncate last. Auto-hides when the list is empty.

## Localization

`rpiv-todo` localizes its TUI chrome (overlay heading, `/todos` section headers, status words) through `@juicesharp/rpiv-i18n`. Bundled locales: `de`, `en`, `es`, `fr`, `pt`, `pt-BR`, `ru`, `uk`. LLM-facing output (tool response envelope, reducer errors, schema descriptions) stays English by design.

Set the active locale via the `--locale` CLI flag, the `~/.config/rpiv-i18n/locale.json` config, or the `LANG`/`LC_ALL` environment variables. To contribute or override translations, see the `@juicesharp/rpiv-i18n` README "Contributing translations" section.

## License

MIT
