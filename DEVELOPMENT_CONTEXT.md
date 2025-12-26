### The "Master Context" Handover Prompt for Copilot

**Role:** You are a Lead Full-Stack Engineer finalizing a "Mechanic Inspection Pro" application.
**Stack:** Next.js 14 (App Router), Supabase (Auth/SSR), Prisma ORM, Tailwind CSS, Shadcn UI.
**Core Objective:** Replace a physical multi-point inspection form with a digital workflow where a mechanic can manage clients, multiple vehicles per client, and detailed JSON-based inspections.

---

### 1. The Domain Model & Database

We are using Prisma with Supabase. The schema follows this hierarchy:

* **Client:** (One-to-Many with Vehicles).
* **Vehicle:** (One-to-Many with Inspections).
* **Inspection:** Contains a `results` JSONB field.
* **JSON Structure:** `{ "item_id": { "status": "green" | "yellow" | "red", "value": "string", "notes": "string" } }`.



**Existing Prisma Schema Logic:**

```prisma
model Client {
  id       String    @id @default(cuid())
  vehicles Vehicle[]
}
model Vehicle {
  id          String       @id @default(cuid())
  clientId    String
  client      Client       @relation(fields: [clientId], references: [id])
  inspections Inspection[]
}
model Inspection {
  id           String   @id @default(cuid())
  vehicleId    String
  vehicle      Vehicle  @relation(fields: [vehicleId], references: [id])
  results      Json
  status       String   @default("DRAFT") // DRAFT or COMPLETED
}

```

---

### 2. The Inspection Content (The "Paper Form" Logic)

The app must render five distinct categories based on the standard inspection form:

1. **Under the Car:** Items 1-9 (Status only), Items 10-11 (Brake pads mm), Item 12 (Tire pressure).
2. **Under the Hood:** Items 13-20 (Fluid levels and belt condition).
3. **Car Exterior:** Items 21-24 (Lights, body, wipers).
4. **Road Test:** Items 25-31 (Performance and safety).
5. **Tire Tread Depth:** A specific 2x2 grid representing LF, RF, LR, and RR tires with status toggles and 32nd-inch measurements.

---

### 3. Immediate Technical Debt & Bug Fixes

I need you to help me fix the following high-priority issues:

* **CRITICAL - Client Creation Error:** `/protected/clients/new` is throwing `Unhandled promise rejection: Error: Not found`. This likely happens in the Server Action during the redirect or database insertion. Investigate the `db.client.create` logic and the response handling.
* **Report Rendering:** The `/protected/reports/[id]` page is currently blank. We need to:
1. Fetch the Inspection including Vehicle and Client relations.
2. Map the `results` JSON back to the UI categories.
3. Ensure the page is print-friendly for the customer.


* **Draft Logic:** The "Save as Draft" button is inactive. It should trigger the same Server Action as "Finalize" but keep the `status` as `"DRAFT"` and provide a success toast without redirecting away.
* **Session Management:** Implement a Logout button in the header using `supabase.auth.signOut()` and ensure it clears all local cookies/cache.

---

### 4. Production Standards

For every piece of code you generate:

1. **Error Handling:** Use `try/catch` in Server Actions and return `{ success: boolean, data?: any, error?: string }`.
2. **UI Feedback:** Use `sonner` toasts for every database mutation.
3. **Loading States:** Use `useFormStatus` or `useTransition` to prevent double-submissions on buttons.
4. **Validation:** Use `zod` for all form inputs, especially when adding new vehicles to an existing client.
5. **Responsiveness:** Ensure the checklist is easy to tap on a mobile tablet.

---

### Instructions for Copilot:

1. Start by analyzing the `/protected/clients/new` page and its associated Server Action to fix the "Not Found" error.
2. Then, move to the Report page to ensure data is fetching and rendering correctly from the JSON blob.
3. Suggest a component for the "User Menu" in the header that includes the Logout functionality.