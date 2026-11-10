# Tutorial narration

All seven tutorials use pre-generated ElevenLabs narration with the Bella voice
(`hpp4J3VqNfWAUOO0d1Us`) and `eleven_v4`. The learner's browser plays local MP3
files; it never contacts ElevenLabs or needs an API key.

`manifest.json` maps each lesson/step/text field to a content-addressed MP3.
The stored display text must exactly match the lesson before the player uses it.
Each clip retains its spoken script, provider generation ID, and duration.
Identical passages share a recording.

The shared player automatically reads description, device controls (when
present), then the task. Opening the summary cancels that queue and plays only
the after-step summary. The original description and any quiz prompt have
manual replay controls. Pausing, seeking, or changing playback speed never
changes tutorial progress. Autoplay and speed preferences persist locally.
Browser autoplay restrictions are handled with a Play prompt; no muted-audio
or permission workaround is used.

After lesson wording changes, run `node scripts/prepare-narration.mjs` to refresh
the script manifest. Existing matching audio metadata is retained. Generate one
new recording for each new content ID using the same voice, download it as the
specified MP3 filename, and record `generationId` and `duration` before shipping.
Do not regenerate existing IDs or publish missing clips. Run `npm ci`, `npm test`,
and `npm run check` before publication.
