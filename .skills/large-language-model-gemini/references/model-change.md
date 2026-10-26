# Model changes without renaming the Skill

## Target experience

The user prefers updating just `model`, with the same Skill and interface identity. Keep `large-language-model-gemini` stable and do not create `-change` variants. A compatible model upgrade is not a reason to rename the Skill or reuse another Skill's IDs.

## Current proven route

Native Vertex has `/models/MODEL:streamGenerateContent` in its URL. Putting a new `model` into a native JSON body alone does not establish routing to that model. The current package validates an app `model` against the active configuration and sends the native request without that field. A mismatch is an error, not a silent old-model answer.

For this first release, change `assets/model-config.json` -> `model` and the platform's upstream model path together. Update the API-ID annotated model paths in `assets/server.mjs` and `scripts/generate_text.py`, and their active-model guards/tests, in the same change. Regenerate deployed copies of model-config.json/UI from this source; uploading a ZIP does not update old apps. Update the reference API path when publishing new documentation. No Skill-name or assigned API-ID change is needed for this compatible in-place update; actual backend binding must be confirmed.

## Requirement for a genuine body-only model switch

A fixed endpoint must accept `model` and route it to the corresponding native Vertex path on the server, preserving authentication, project, routing header and real streaming. Verify this before using it. If platform routing supports a dynamic model path, validate the actual platform capability and allowed model set; do not assume `customInputMerge` rewrites URL paths.

Google also documents an OpenAI-compatible fixed chat endpoint, but its documented authentication uses Google Cloud OAuth credentials. A probe with the supplied project API key did not obtain an HTTP response (SSL EOF at connection stage). This does not prove the endpoint rejects that key, but it is not evidence of compatibility. Do not replace the working native endpoint or switch this package's parser based on that inconclusive probe.

Sources: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/openai

If RD provides a tested stable routing endpoint later, bind this same Skill/API to it and use the `model` request field end-to-end. Verify the response model identity, incremental output, errors, budget/usage and billing for each supported model. Do not announce “only change model” as implemented before that routing layer exists.
