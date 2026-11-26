# Brief contract / Contrato del brief

The agent converts natural language into a local JSON object. Planner input is at most 64 KiB, exact keys, no commands, HTML execution, remote assets, credentials or arbitrary output paths. Text is treated as data; escape it in any renderer. Validation does not establish asset rights or factual accuracy.

Required keys: brand (nonempty, max 100 characters), goal (showcase, contact, catalog), category (coffee, product, service), language (es, en), style (coffee, midnight, light), experience (auto, static, procedural, glb, video, local-ai), assets (array, max 12). Each asset has kind (image, glb, video), path (relative local path under public/, generated/, or inputs/; no traversal), rights (approved, unknown). Optional: notes (max 500 chars, never executable), localBackend (wan, comfy, blender; only for local-ai). Unverified assets are blockers for asset-dependent routes; omit or replace them with original artwork rather than publishing.

Example: coffee concept (no supplied media):
```json
{"brand":"The Grounds","goal":"showcase","category":"coffee","language":"es","style":"coffee","experience":"auto","assets":[]}
```
Example: product with a supplied model:
```json
{"brand":"Form","goal":"catalog","category":"product","language":"en","style":"midnight","experience":"glb","assets":[{"kind":"glb","path":"inputs/product.glb","rights":"approved"}]}
```
The planner never opens asset paths or executes a backend. An approved rights label is an assertion supplied by the agent/user, not a license audit. It intentionally has no publication flag or arbitrary command field. A route that needs authorization must remain in planning until separately authorized in the conversation.
