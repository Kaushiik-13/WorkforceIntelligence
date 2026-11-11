---
id: e835df07-43f3-493d-b271-9cd4ccc3bd01
projectId: 7a35f38f-55ff-4eb0-b4f8-9c1d1065863c
title: Where should approved project context be stored?
type: decision
status: approved
updatedAt: '2026-11-11'
owner: Kaushiik-13
question: >-
  How should ContextOps store project context so teammates and their AI
  assistants can share it?
summary: >-
  Store approved context as Markdown files in the context/ folder of the
  connected GitHub repository. Use Supabase for ContextOps account, project
  connection, and proposal draft data.
rationale: >-
  GitHub keeps approved context alongside the project and preserves its history.
  Supabase lets ContextOps save drafts separately before they are approved.
tags:
  - 'contextops, architecture, github, storage'
constraints:
  - Drafts must stay out of the approved context library.
  - A person must approve a proposal in ContextOps before it is published.
  - The MVP connects one project per user.
alternatives:
  - Store all context in Supabase.
  - Create a separate GitHub repository just for context.
discussionSummary: >-
  We chose the project’s existing GitHub repository for approved context so the
  project and its AI assistants can share it. Supabase stores ContextOps drafts
  and connection details.
sourceReferences: []
---

