# 🎯 TaskLinex
> **☕ Platform designed for your team.**

**TaskLinex** is a focus-first productivity system that eliminates cognitive overload by surfacing only what matters now. By prioritizing team-centric communication, we slash meeting times and reclaim your peak performance.

---

## 🧠 Core Philosophy
> **Clarity before complexity. Execution before organization.**

TaskLinex is built around the **Pulse**, a central interface designed to answer three questions at a glance:
1. **What am I working on right now?**
2. **How far along am I?**
3. **What should I do next?**

---

## ⚡ Pulse (The Core Interface)
Pulse is the main interaction surface—intentionally minimal and distraction-free.

* **Current Focus:** A glanceable view of your active task with a visual progress indicator (0–100%).
* **Up Next:** The immediate next task with a short rationale explaining *why* it’s next.
* **Minimalist Design:** If it does not help you execute the current task, it does not belong here.

---

## 📂 Structure
Each page is designed to specialize in one responsibility only.

| Page | Status | Responsibility |
| :--- | :--- | :--- |
| **Pulse (Home)** | ✅ Visually Complete | Execution-focused overview and active task management. |
| **Roadmap** | ✅ Visually Complete | Broader task and project overview. |
| **Analytics** | 📅 Planned | Performance insights and progress patterns (no vanity metrics). |
| **Settings** | 📅 Planned | User preferences and configuration. |

---

## 🛠️ Tech Stack
The project focuses on UI correctness and structure before introducing backend complexity.

* **Frontend:** [Next.js](https://nextjs.org/) (App Router), React, [Tailwind CSS](https://tailwindcss.com/)
* **State:** Component-driven UI with mocked data variables
* **Backend (Planned):** FastAPI with AI-assisted prioritization logic

---

## ✨ Design Principles
* **Focus > Flexibility:** Fewer decisions, clearer defaults.
* **One Primary Task:** Designed to eliminate context switching.
* **Visual Feedback:** Visual progress indicators over raw data tables.
* **Static First:** Establishing solid foundations before adding adaptive logic.

---

## 🚀 Roadmap
- [x] UI structure and layout foundations
- [x] Collapsible sidebar navigation
- [x] Finalize Pulse UI (Current Focus + Progress Bar)
- [ ] Implement consistent task data schema
- [ ] Introduce FastAPI backend API
- [ ] Add adaptive task prioritization logic
- [ ] Expand Analytics with actionable insights

---

## 🚫 Non-Goals
TaskLinex is intentionally opinionated and does **not** aim to:
* Replace Notion or become a document/wiki system.
* Support infinite customization at the cost of clarity.
* Optimize for aesthetic "vanity" dashboards over execution.