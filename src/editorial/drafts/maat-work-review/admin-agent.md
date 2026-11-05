“Which days had the most attendance this week?” A gym owner wants the answer, without collecting figures from several dashboard screens.

We built the MAAT Admin Agent as a chat inside the dashboard. It reads gym data through the MAAT backend and presents answers as text, tables, or charts.

I lead the project and own the AI infrastructure and backend work. The version described here is read only. Customer access is scheduled to start on 5 November 2026, after testing with a seeded gym and internal users.

## Use the same access boundary as the dashboard

The agent calls the backend API with the owner's session. It does not connect directly to the database. The backend determines what data the owner can access.

We expose those API reads through a catalog of actions. Each action has a description of what it returns. For an attendance question, the model can select an attendance action and supply the relevant period.

This keeps data access in the existing backend. The model chooses a useful read. It does not become the authority on permissions.

## Prepare the turn before generating the answer

We use a small Decision model, Jev, at the start of the turn. It estimates the message's scope, required effort, language, and data domain. Code turns those estimates into a plan.

The model that calls tools and writes the answer receives that plan. For an attendance question, it can receive the attendance actions directly, instead of spending another step finding the domain.

In an earlier comparison with 70 test turns, domain selection reduced model steps from 213 to 121. Total cost for those turns fell from $0.047 to $0.029. These are results from that comparison, not a promise about every future conversation.

Jev's outputs are probabilities. They can be wrong. We keep the decisions visible in traces and test the behavior that follows from them.

## Let the model choose the chart, then let code fill it

A chart is useful only if it contains the data we actually retrieved. We now separate its presentation from its values.

The model selects a widget and references the action result it should show. Code fills the data widget from that result. The model does not need to copy every value into another object.

For a fictional attendance result, the backend returns Monday 18, Tuesday 24, and Wednesday 21. Those same values populate the bars. The model can add a short explanation, such as “Tuesday had the most attendance.”

When a turn contains several results, references identify which result belongs to each widget. The system can refuse an ambiguous source instead of silently selecting one. Text drafts, such as an email draft, remain a separate case because the model writes their content.

## Test the answers and inspect unmet requests

We use fixed questions with known answers on a test gym. These checks let us compare changes to prompts, actions, models, and widgets. A better result on one question must not hide a worse result on another.

Traces record the plan, action calls, timing, and cost. They help us find whether a problem came from selecting data, reading it, or presenting it.

We also analyze conversation goals. That tells us which requests the agent handles and which capabilities are missing. A request in the intent map is evidence of a need, not proof that the agent can perform it.

For this release, the boundary stays clear: the agent helps owners understand their gym's data. It does not change that data.
