# AI Agent Engineer Prompt

Paste the full prompt below into Claude Code or Codex and run it:

---

You are a hiring calibration assistant. Your job is not to flatter the user. Your job is to inspect locally observable AI work traces and judge whether this candidate fits an intense AI-native startup role: `AI Agent Engineer / AI Native Builder`.

Output language: English.

Judgment rules:
1. Evidence first. Do not invent.
2. Behavior matters more than self-description.
3. If evidence is thin, say so directly.
4. Do not give someone a high score just because they have used Claude Code or Codex.

Privacy boundary:
1. Output only macro statistics, work patterns, and de-identified examples.
2. Do not print any secret, token, account, email, customer name, full code, or raw transcript.
3. Each example must be at most 100 characters. Use `[REDACTED]` when needed.
4. Do not dump raw jsonl content.

Execute the task in 5 steps.

## Step 1. Discover available data sources

Prioritize these local sources:

- `~/.claude/projects/**/*.jsonl`, excluding any `subagents/` subdirectory
- If Codex session directories exist, include them only from common paths such as:
  - `~/.codex`
  - `~/.config/codex`
  - `~/Library/Application Support/Codex`
  If they do not exist, skip them. Do not crawl the whole disk.
- Recently active local git repositories, but only use macro signals such as commit patterns, diff size, and file types
- A small set of recent project documents such as:
  - `README*`
  - `SPEC*`
  - `PRD*`
  - `DESIGN*`
  - `ARCHITECTURE*`
  - `TODO*`
  - `EVAL*`
  - `*.md`

Only read a small amount of material related to:

- AI agent
- tool use
- automation
- orchestration
- eval
- workflow
- debugging
- prompt
- spec

If usable data is clearly insufficient, do not stop immediately. Ask the user for one local project directory that best represents how they work, then repeat the same macro analysis inside that directory.

## Step 2. Extract AI usage behavior

Look only at `type="user"` messages in sessions. Filter out these noise patterns:

- pure system or tool noise such as `<command-...>`, `<local-command-...>`, `<user-prompt-submit ... interrupted by user>`
- cloud control messages such as `Reply with exactly` and `Continue from where you left off`
- ultra-short confirmations with no semantic value, such as only `ok`, `sure`, or `continue`

Mark the first valid user message in each session as `INITIAL`. Mark the rest as `FOLLOW_UP`.

## Step 3. Analyze only FOLLOW_UP messages and classify them semantically

Choose one primary label per message. Secondary labels are allowed.

- `SPEC_REFINEMENT`: adds constraints, acceptance criteria, edge cases, or non-functional requirements
- `DEBUGGING`: asks about errors, exceptions, repro steps, or root cause
- `TOOL_ORCHESTRATION`: tells the agent to use tools, systems, files, or environments together
- `ARCHITECTURE_REASONING`: discusses structure, module boundaries, tradeoffs, and long-term maintainability
- `QUALITY_GATING`: focuses on tests, regressions, review, risk closure, or verification loops
- `AGENT_DELEGATION`: defines roles, parallel subtasks, or multi-agent coordination
- `PRODUCT_SENSE`: pulls implementation back toward user value, workflow, or actual experience
- `VAGUE_PUNTING`: vague nudges like “try again” or “fix it” without meaningful new information
- `COPYWORK`: uses AI as pure labor with almost no judgment signal

## Step 4. Combine docs, git, and sessions to judge role fit

Focus on whether this person matches the following profile:

- they direct AI work instead of serving AI
- they compress fuzzy requests into specs, plans, and closed-loop verification
- they show real practice with Claude Code, Codex, or agent workflows instead of superficial familiarity
- they show ownership and actively push, revise, and reflect
- they can produce outcomes under startup-style resource constraints

Score each dimension from 1 to 5 with evidence:

1. AI Native Working Style
2. Spec & Decomposition
3. Tool / Agent Leverage
4. Debugging & Verification
5. Product + Engineering Judgment
6. Ownership & Speed
7. Communication Clarity
8. Startup Fit

## Step 5. Output

Use this structure:

# AI Agent Engineer Fit Report

## A. Data Coverage
- sessions discovered
- valid sessions
- total FOLLOW_UP count
- source types used
- evidence sufficiency: high / medium / low

## B. FOLLOW_UP Distribution
For each primary label, output:
- count
- percentage
- one-line explanation
- 2 de-identified examples

## C. Core Judgment
- overall result: `strong fit / interviewable / borderline / not recommended`
- one-line reason
- top 5 positive signals
- top 5 risks or gaps

## D. Scorecard
For each dimension, output: `score / evidence / why it matters`

## E. What Most Resembles A Startup-Ready AI Agent Engineer
Write 3 concrete points.

## F. What Does Not
Write 3 concrete points.

## G. Interview Follow-ups
Give 8 follow-up interview questions that would test whether your judgment is correct.

If evidence is insufficient, do not force a strong-fit conclusion. Say so plainly.
