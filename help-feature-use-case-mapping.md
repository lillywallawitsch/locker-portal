# Help Feature — User Flow & Use Case Mapping

**Source material:** OOH User Archetypes (Figma, x9MoAjffoeDIemYsxEgtup / node 16-11975), GLS Locker Portal codebase  
**Date:** June 2026  
**Purpose:** Map each user archetype to the specific moments, needs, and use cases where the in-portal Help feature provides value — and define what "solving the need" looks like per archetype.

---

## How the Help Feature Currently Works

The Help panel lives as a persistent right-side chat panel on the Locker Detail and Parcel Detail pages, and as a floating FAB (bottom-right) on the Locker and Parcel Overview pages. When opened, it shows a contextual chat interface scoped to the current locker or parcel. The user can type a free-text question and receive a response.

The feature has direct access to the context of whatever the user is currently viewing — locker name, status, carrier/provider, compartment data, parcel history.

---

## Archetype Overview

| # | Archetype | Mental Model | Primary Portal Use | Help Urgency |
|---|-----------|--------------|-------------------|--------------|
| 1 | Country OOH Manager | Strategic Overseer | Spot checks on systemic issues | Low — escalation-triggered |
| 2 | Country OOH Network OPS | Router / Gatekeeper | Daily health checks, issue triage | High — daily operational |
| 3 | OOH Rollout & Activation | Builder / Coordinator | Activation, master data | Medium — go-live critical |
| 4 | OOH Ops Support & Solutions | Firefighter / Problem Solver | Issue diagnosis, depot support | High — reactive |
| 5 | Second-level IT Support | Investigator / Debugger | Integration health, log tracing | High — technical deep-dives |
| 6 | Regional OOH OPS | Builder / Controller | Daily parcel resolution, driver compliance | High — repetitive loops |

---

## Archetype 1 — Country OOH Manager

**Representative:** Jose Luis (ESP)  
**Mental model:** "I set the targets and my team executes. I only dive into tools when things escalate."

### When they open the portal
Only during escalations — when a systemic issue has been flagged by their team (e.g., booking cancellations across multiple lockers) and they need to verify it themselves before engaging a provider or partner.

### Help trigger points

**Trigger A — Verifying a systemic issue**
They land on a locker that was flagged by their team. They don't know the tool well enough to navigate it confidently and need orientation fast.

Use case: "What does this status mean and is it causing the booking problem my team reported?"

Help solves: Instant plain-language explanation of locker status, compartment availability state, and any active anomalies — without requiring them to read documentation.

**Trigger B — Escalation language**
They need to report an issue to a provider or internal team but want to describe it precisely.

Use case: "What's the exact technical state of this locker right now so I can escalate to the right person?"

Help solves: Generates a structured summary of the locker's current state (status, last activity, compartment breakdown) they can copy into an email or Teams message.

**Trigger C — Tool navigation**
They return to the portal rarely and forget where things are.

Use case: "Where do I find all lockers with booking cancellation issues?"

Help solves: Directs them to the right filter/view and explains what they're looking at.

### What "solved" looks like
They get the answer in one interaction, feel confident enough to escalate externally, and don't need to ask their team to do it for them.

---

## Archetype 2 — Country OOH Network OPS

**Representative:** Falk (DE), Manuel (DPD), Armin (AT)  
**Mental model:** "I am the human integration layer between systems that don't talk to each other."

### When they open the portal
Every morning during network health checks. Constantly throughout the day as issues are escalated from depots, regional managers, or provider tickets. They switch between the portal, provider tools (MyFlexbox, Keba), tracking systems, and email simultaneously.

### Help trigger points

**Trigger A — Anomaly spotted during morning scan**
They see a locker with an unexpected status or unusually low availability and need to understand why before deciding whether to act or escalate.

Use case: "Why is this locker showing 0% available? Is this a system sync issue or a real compartment problem?"

Help solves: Explains whether the availability drop matches parcel data or looks like a sync discrepancy. Points them to the right diagnostic path (provider portal vs. internal tool).

**Trigger B — Cross-system discrepancy**
They've already checked MyFlexbox and it shows a different state than the portal. They need to know which system is the source of truth for this locker.

Use case: "MyFlexbox shows this locker as active but the portal shows it as inactive — which is correct and what should I do?"

Help solves: Explains the data flow between GLS NXT and provider tools, which field takes precedence, and what action resolves the discrepancy.

**Trigger C — Routing an incoming escalation**
A depot has reported an issue they can't resolve. The OPS person needs to quickly determine whether it's a carrier-side, provider-side, or platform issue before routing.

Use case: "A driver says parcels aren't scanning into this locker. Is the issue on our side?"

Help solves: Surfaces last scan events, any error logs visible in the portal, and suggests the correct escalation path (GLS NXT, provider, depot).

**Trigger D — Explaining a locker state to a depot**
They need to tell a depot worker what to do, in plain language, without spending 20 minutes investigating themselves.

Use case: "What should I tell the depot about this locker — what's wrong and what can they do?"

Help solves: Generates a clear, non-technical explanation of the locker's state and a recommended next action for the depot.

### What "solved" looks like
They route the issue to the right party in under 5 minutes, without having to open a second tool to verify. They reduce their role as "human integration layer."

---

## Archetype 3 — OOH Rollout & Activation

**Representatives:** Theo (DE), Jose Carlos (ESP), Christian (AT), Francesco (IT)  
**Mental model:** "My job is to get lockers from 'deployed' to 'live' across fragmented systems."

### When they open the portal
Throughout the activation pipeline — verifying that a newly configured locker has been correctly activated, checking that master data matches across PSMS/UNIQ/GLS NXT, and handling post-go-live issues in the first days after a locker goes live.

### Help trigger points

**Trigger A — Activation status verification**
They've triggered activation in one system and need to confirm it propagated correctly to the portal.

Use case: "This locker was just activated in PSMS — why does the portal still show it as inactive?"

Help solves: Explains the sync delay between systems, what fields confirm a successful activation in the portal, and what to check if the status hasn't propagated.

**Trigger B — Master data discrepancy**
A field in the portal (address, compartment count, carrier ID) doesn't match what was configured in the source system.

Use case: "The compartment count in the portal doesn't match what was configured — where does this data come from and who can fix it?"

Help solves: Identifies which system owns each data field and the correct escalation path to fix it.

**Trigger C — Go-live checklist**
Before handing off a locker to operations, they want to confirm it's correctly configured.

Use case: "What does a fully ready-to-go-live locker look like in the portal?"

Help solves: Provides a clear checklist of what fields, statuses, and compartment states indicate a locker is fully activated and ready for parcels.

**Trigger D — Post-go-live issue in first 48 hours**
First parcels fail to book or scan. They need to quickly determine whether the issue is in the portal data or an integration problem.

Use case: "This locker went live yesterday but bookings are being rejected — what does the portal show?"

Help solves: Surfaces rejection reasons visible in the portal (compartment state, booking status, integration errors) and points to the correct team.

### What "solved" looks like
Deployment targets are met on time. They don't waste go-live days waiting for answers from multiple teams.

---

## Archetype 4 — OOH Ops Support & Solutions

**Representatives:** Gabriel (IT), Laura (IT)  
**Mental model:** "Find the information, fix the problem, keep depots unblocked."

### When they open the portal
When a depot reports an issue they can't resolve themselves. When customer service escalates a consignee complaint. During and after go-live testing phases. This archetype is the heaviest day-to-day portal user for issue resolution.

### Help trigger points

**Trigger A — Depot can't access a compartment**
A depot worker is physically at the locker and can't open a compartment or retrieve a parcel.

Use case: "Depot says compartment 7B is locked and won't open. What does the portal show for this compartment?"

Help solves: Surfaces the compartment's current status, last booking/parcel event, and any lock state visible in the portal. Suggests next steps (remote reset, provider contact, consignee re-notification).

**Trigger B — Consignee complaint — parcel not accessible**
A customer can't pick up their parcel. The support person needs to diagnose quickly across parcel tracking and locker state.

Use case: "Consignee says their pickup code doesn't work. The parcel shows as delivered. What's the locker state?"

Help solves: Correlates parcel delivery status with compartment availability, checks if the booking is still valid, and flags if the parcel is at risk of expiring.

**Trigger C — Ghost parcel / sync discrepancy**
A parcel appears in the portal as "in locker" but the locker physically doesn't have it.

Use case: "This parcel shows occupied but the locker is empty. How do I resolve this?"

Help solves: Explains the ghost parcel scenario, which system needs to be updated, and the correct manual resolution path.

**Trigger D — Training support for depot workers**
They're training a new depot worker remotely and want to explain what a screen shows without being physically present.

Use case: "How do I explain to a depot worker what 'reserved' means for a compartment?"

Help solves: Generates a plain-language explanation of portal states they can relay verbatim.

**Trigger E — Testing a new integration**
Post-go-live, they're verifying that a new locker is behaving as expected.

Use case: "What events should I see in the portal after a successful first booking?"

Help solves: Describes the expected event sequence for a healthy booking flow so they can identify where it broke.

### What "solved" looks like
They resolve depot issues in one call without escalating to GLS NXT or the provider. Consignees get their parcel. Ghost parcels are cleared without creating backlog.

---

## Archetype 5 — Second-level IT Support

**Representatives:** Matteo (IT), Dario (IT), GLS/NXT  
**Mental model:** "Three systems that should match but often don't. The truth is somewhere in the logs."

### When they open the portal
When a ServiceNow incident arrives from 1st-level customer service. When a colleague escalates via Teams. They perform three-system verification (portal, WAS, provider tool) and need the portal to surface as much technical detail as possible.

### Help trigger points

**Trigger A — Three-system verification**
They're cross-referencing the portal against WAS (Italy OOH Platform) and a provider tool and need to know what the portal's data represents technically.

Use case: "The portal shows this locker as 'active' but WAS shows a different state. What does 'active' mean technically in the portal's data model?"

Help solves: Explains the exact meaning of status fields, the data source behind each, and any known sync lag between systems.

**Trigger B — API event tracing**
A booking was rejected but there's no visible error in the portal UI. They need to understand what event or API response caused it.

Use case: "Booking was rejected at 14:32. What events does the portal show around that time for this locker?"

Help solves: Surfaces the relevant timeline of events visible in the portal (last activities, booking state changes) and identifies which API endpoint would have been involved.

**Trigger C — Opening a GLS NXT Jira ticket**
They need to write a precise bug report. The portal is the most user-facing system and they need to document its state accurately.

Use case: "What exact field values should I include in the Jira ticket for this locker issue?"

Help solves: Generates a structured technical snapshot (locker ID, carrier/provider, status, compartment state, last events, timestamps) ready to paste into Jira.

**Trigger D — Pattern identification**
They've seen the same issue on multiple lockers and want to confirm it's systemic.

Use case: "Is this issue affecting multiple lockers or just this one?"

Help solves: Can't query across lockers directly, but explains how to use the portal's filter and search to spot the same pattern across the overview.

### What "solved" looks like
They reduce the time from ServiceNow ticket to Jira escalation. They don't re-escalate back to 1st-level for missing information.

---

## Archetype 6 — Regional OOH OPS

**Representative:** Daniel (GER)  
**Mental model:** "Every afternoon is a verification loop until everything turns green."

### When they open the portal
Throughout the day in rapid loops — morning export from Qlik, then status checks every 30–60 minutes across 17 depots. They've built custom Excel workarounds because no official tool gives them exactly what they need. The portal is one of several tools they cycle through.

### Help trigger points

**Trigger A — Parcel status not matching expectation**
Their Excel tracking shows a parcel should be collected, but the portal shows it's still in the locker.

Use case: "This parcel has been in the locker since yesterday. Why hasn't it been collected and is it at risk?"

Help solves: Shows parcel age, whether it's approaching the expiry window, last collection attempt, and what action is needed (re-notify consignee, driver pickup).

**Trigger B — Locker not accepting parcels**
A depot reports that the locker is rejecting new parcel placements. Daniel needs to diagnose without going through HQ.

Use case: "Why is this locker rejecting new parcels from drivers?"

Help solves: Identifies whether the locker is full (compartment availability), has a booking conflict, or has a carrier/provider status issue blocking new placements.

**Trigger C — Driver compliance issue**
A driver didn't pick up a parcel or delivered it to the wrong place. Daniel needs to understand the locker state to know how to follow up.

Use case: "Driver reported they couldn't access compartment 3A. What does the portal show?"

Help solves: Shows the compartment's last event and booking state. Confirms whether the access code was valid and when it was issued.

**Trigger D — End-of-day sweep**
Before closing out the day, Daniel verifies no lockers are in a bad state. He finds one he can't interpret.

Use case: "This locker shows 'INACTIVE' but three parcels are assigned to it — what does that mean?"

Help solves: Explains the state combination, whether parcels are at risk, and what the correct resolution is (escalate to HQ vs. let it auto-resolve).

### What "solved" looks like
His afternoon verification loop runs faster. He catches at-risk parcels before end of day without escalating to Falk. His custom Excel workarounds become less necessary over time.

---

## Cross-Archetype Use Case Clusters

Grouping the help use cases above into functional clusters reveals where the feature needs the most capability:

### Cluster 1 — Status interpretation
"What does this state mean?" Covers 100% of archetypes. Every user encounters portal states they don't fully understand. Help needs to explain every locker and parcel status in plain language, with context.

Affected archetypes: All 6

### Cluster 2 — Cross-system discrepancy diagnosis
"The portal shows X but [other system] shows Y." This is the deepest pain point across OPS archetypes. The portal can only explain its own state, but Help can tell the user which system is the source of truth and what the reconciliation path is.

Affected archetypes: 2 (Network OPS), 5 (IT Support), 4 (Ops Support)

### Cluster 3 — Escalation routing
"Who do I contact and what do I tell them?" Multiple archetypes know something is wrong but don't know whether it's a portal issue, a provider issue, or a GLS NXT integration issue.

Affected archetypes: 1 (Manager), 2 (Network OPS), 4 (Ops Support), 5 (IT Support)

### Cluster 4 — Parcel / compartment resolution
"What happened to this specific parcel and what do I do?" Operational archetypes need fast answers about parcel state to unblock depot workers and consignees.

Affected archetypes: 4 (Ops Support), 6 (Regional OPS), 2 (Network OPS)

### Cluster 5 — Activation and go-live verification
"Is this locker correctly set up?" Rollout archetype-specific but high stakes — a wrong answer here delays deployment targets.

Affected archetypes: 3 (Rollout & Activation)

### Cluster 6 — Documentation and reporting
"Give me a summary I can send or paste." Manager and IT Support need structured, shareable outputs rather than just answers.

Affected archetypes: 1 (Manager), 5 (IT Support)

---

## Help Feature Capability Requirements by Cluster

| Cluster | Capability needed | Portal data available | Gap |
|---------|------------------|-----------------------|-----|
| 1. Status interpretation | Plain-language explanation of all status values | Locker status, compartment status, parcel status | None — fully answerable from portal data |
| 2. Cross-system discrepancy | Source-of-truth routing + reconciliation guidance | Portal state only | Partial — Help can explain portal side but not live provider data |
| 3. Escalation routing | Decision logic for which team owns which problem | Locker carrier/provider, status, event history | Partial — routing rules need to be embedded in Help |
| 4. Parcel/compartment resolution | Event timeline, parcel age, expiry risk, next action | Last activities, parcel assignments, compartment state | Mostly covered — expiry logic needs explicit surfacing |
| 5. Activation verification | Go-live checklist, sync delay explanation | Activation status, master data fields | Mostly covered — sync delay timings need to be documented in Help |
| 6. Documentation/reporting | Structured snapshot generation | All visible locker/parcel fields | None — Help can generate this from available context |

---

## Priority Recommendation

Based on frequency of use and number of archetypes affected:

1. **Status interpretation** (Cluster 1) — highest priority, broadest reach, fully achievable with existing portal data.
2. **Parcel/compartment resolution** (Cluster 4) — highest urgency per user; depot workers are blocked in real time.
3. **Escalation routing** (Cluster 3) — reduces the biggest time sink for OPS archetypes (figuring out who to call).
4. **Documentation/reporting** (Cluster 6) — unlocks the Manager and IT Support archetypes who currently don't benefit from Help.
5. **Activation verification** (Cluster 5) — targeted but high-stakes for the Rollout archetype.
6. **Cross-system discrepancy** (Cluster 2) — partial coverage possible now; full coverage requires integration-layer data.
