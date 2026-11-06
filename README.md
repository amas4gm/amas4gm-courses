# AMAS4GM software tutorials

A static software catalog, shared teaching engine, and reusable software simulations. No build step, backend, external scripts, analytics, or printer connection.

## Published pages

- Catalog: https://amas4gm.github.io/bambu-studio-course/
- Bambu Studio: https://amas4gm.github.io/bambu-studio-course/bambu-studio/
- Tutorial 01: https://amas4gm.github.io/bambu-studio-course/bambu-studio/getting-started/
- Tutorial 02: https://amas4gm.github.io/bambu-studio-course/bambu-studio/object-manipulation/
- Tutorial 02 Moodle embed: https://amas4gm.github.io/bambu-studio-course/bambu-studio/object-manipulation/?embed=1
- Tutorial 01 Moodle embed: https://amas4gm.github.io/bambu-studio-course/bambu-studio/getting-started/?embed=1

The root URL used to open Tutorial 01. Update existing Moodle embeds to the lesson URL. Each page has a real directory and index.html, so direct links and reloads work on GitHub Pages without routing rules. Embed mode hides catalog navigation while retaining the simulation label and controls.

```html
<iframe
  src="https://amas4gm.github.io/bambu-studio-course/bambu-studio/getting-started/?embed=1"
  title="Meet Bambu Studio — interactive simulation"
  width="100%" height="950" style="border:0;" loading="lazy"
  referrerpolicy="no-referrer-when-downgrade">
</iframe>
```

Moodle must permit iframes. A desktop or laptop and mouse give the closest match; keyboard and touch practice aids are included. Embedded progress can be separate from a directly opened page under browser storage partitioning. There is no Moodle grade or completion synchronization.

The referrer policy above permits an HTTPS course page to supply its full return link. If Moodle removes that attribute or uses a restrictive policy, append `&returnTo=` followed by the URL-encoded course page URL to the iframe's src. This optional parameter also works for ordinary links. Without a full referring URL or an explicit returnTo, the browser may provide only the course's origin; the site cannot recover a hidden cross-origin page path.

## Source layout

```text
index.html                       Catalog grouped by software
shared/catalog-data.js           Available software and published tutorial metadata
shared/catalog.js, catalog.css   Lightweight catalog renderer
shared/teaching/                  Engine, shell, styles, progress, guidance,
                                 sound, countdown, and return navigation
shared/vendor/                    One copy of Three.js, OrbitControls, STLLoader
shared/assets/models/Benchy.stl   Original supplied practice model
simulators/bambu-studio/          Shared Bambu interface, camera, view cube, assets
bambu-studio/index.html           Software landing page
bambu-studio/getting-started/     Lesson definition and standalone entry point
tests/                           Progress and timing regression tests
scripts/check-site.mjs           Asset, link, import, syntax, and size checks
```

The github-repo checkout is the maintained source. Earlier course folders outside this repository are not published.

The catalog loads only its metadata, renderer, and CSS. A lesson loads the teaching engine and its simulator; only Bambu imports Three.js and the STL. Assets are resolved relative to their module using import.meta.url, so they work below GitHub's project URL prefix. Assets are shared once rather than copied into each tutorial.

## Add a lesson

1. Create a directory such as bambu-studio/orienting-models with an entry HTML page, main.js, and lesson.js. Reference shared modules and styles; do not copy assets or the simulator.
2. Give it stable software, id, and version values. Steps use stable IDs plus chapter, title, text, task, and done. Optional tools, keyboard, quiz, completionDelayMs, and terminal configure teaching behavior.
3. Put software behavior under each step's simulation property. Extend the shared simulator for a new capability, then select that capability from lesson data.
4. List the finished lesson in shared/catalog-data.js. Do not list unfinished lessons as available.
5. Run checks and test direct entry, embedding, and the complete lesson before publishing.

The lesson definition owns teaching content. A new lesson normally adds only small text/code files. Tutorial 02 adds manipulation as a lazy-loaded simulator capability, sharing the same model, UI, icons, and renderer.

## Add different software

Add a software landing page, catalog entry, and simulator adapter. An adapter can use HTML/CSS, canvas, or another library: the teaching engine has no Three.js dependency. One simulator mounts on a lesson page at a time.

Call startTutorial({lesson, createSimulator, root}). The factory receives container, lesson, and an api with:

- complete(): finish the current task once.
- partial(message): prominent intermediate feedback and a distinct sound.
- retry(message, region?): red flash, guidance, and retry sound.
- feedback(message): quiet supporting text.
- guideChanged(): request highlight/arrow repositioning.

Return an adapter implementing setStep(step, context), refreshState(), setPaused(value), setGuidance(active), getGuide(), getRegion(), perform(action), reset(), and dispose(). Context provides isCompleted() and completedSteps() for simulator actions, including actions awaiting a popup quiz. The engine separately tracks fully completed steps to enforce quiz gates. getGuide() returns a DOM target, parent, scale, and optional anchorY/above placement. Enable only the current concept. Dispose observers and rendering resources in dispose().

The Bambu adapter supports select, import, orbit, pan, zoom, view, and free actions. Completed-step effects reconstruct model visibility. viewBefore/viewAfter select tab demonstrations. Model and camera changes are independent.

## Tutorial 01

14 guided tasks plus optional free practice. Home opens first, Prepare starts empty, and learners explicitly import Benchy. Preview and Device have distinct simulated panels. The exact supplied STL retains its sideways orientation to introduce why models sometimes need reorientation for printing.

Only current concepts are enabled. Arrows and pulsing highlights stop immediately on completion. Wrong actions give a red flash. Success audio is immediate, followed by five seconds of continued practice for navigation tasks. Hidden tabs pause the countdown. Completion popups include the explanation and a reminder of the pre-step text. Quizzes belong to these popups, not separate steps. A correct answer is required before continuing; wrong answers provide red-flash and audio feedback inside the popup. Closing or reloading preserves an unanswered check without unlocking the next task. One zoom direction triggers a notification and partial-success sound prompting the other direction. Sound can be muted; there are no points or badges.

The view cube follows the actual camera rotation continuously. Face clicks choose corresponding views without moving the model. Edge/corner choices and dragging work in free practice. Top view follows zoom as a new task. Reduced-motion settings remove pulsing and view-transition animation.

After the final popup quiz is answered correctly, the popup says “You finished the tutorial” with “Back to course” and a grey “Restart tutorial” button below it. A quiet link closes the popup for continued simulation practice. Returning uses the original course/catalog link; a separately opened tab is closed when the browser permits it. Browsers can refuse tab closing or omit the referrer; in that case navigation falls back to the known course link or catalog. An iframe returns to its containing course. No cross-origin tab can be inspected or force-closed.

## Tutorial 02

17 guided tasks cover object selection, Move X/Y and position coordinates, uniform percentage scaling, exact dimensions, independent scaling and restoring proportions, absolute and relative rotation, and selecting the hull base with Lay on face. Four completion-popup checks require correct answers. Numeric fields, axis handles, rotation rings, camera navigation, and real planar face picking change the rendered model. Free practice enables all four tools. Rotation uses Bambu’s radial snap zones: 5-degree outer ticks and 45-degree inner spokes, with guided tasks for both. Focused handles and clearly labeled practice aids provide keyboard/touch alternatives. Selection follows the model silhouette and uses separated corner brackets.

The manipulation module is loaded only by lessons declaring capabilities: ["manipulation"]. Steps select tool/object-select/transform/uniform/lay-face/manipulate-free actions, editable fields, goals, and objectState/completedState checkpoints. Checkpoints reconstruct guided exercise states on reload and when revisiting steps; free-practice edits are session-only. The object-transform module maps Bambu Z-up coordinates into the renderer and keeps model transforms separate from the camera. Tutorial 01 keeps its original camera-only behavior.

The practice intentionally supports one seated object, scale 10–300%, and the supplied model’s planar exterior faces. It does not implement multi-selection, parts, cutting, supports, slicing, or arbitrary mesh importing. Z center height is read-only; it is not a height-above-bed setting. The panels are based on the installed Bambu Studio screenshots inspected November 6, 2026. Scale uses object coordinates so dimensions remain meaningful after rotation.

## Saved progress

Storage keys are amas-tutorial:<software>:<lesson>:v<version>, with completed step IDs. Inserted tasks stay incomplete while later completed IDs are retained; navigation cannot skip the first incomplete task. Bump the version for incompatible revisions.

Legacy amas-bambu-tutorial-01-v5 progress migrates using the original numeric ordering. Learners who finished the original tutorial keep that work and resume at the new Top view task. Version 2 also migrates version 1: a completed Top camera action with an unanswered standalone quiz becomes a pending popup quiz, while fully finished lessons stay finished. Action completion and quiz completion are stored separately so reloads cannot bypass the check. Restart clears only this lesson's new record and does not re-import old progress or reset other lessons. If storage is blocked, the current page session remains usable.

## Run and validate

Serve this directory with any static server, for example python -m http.server 8932. Open http://localhost:8932/. File URLs cannot fetch shared templates or models. With Node installed, no packages need installing:

```sh
npm test
npm run check
```

Browser checks include Home/empty plate, tab panels, importing, modal focus/reopening, navigation gestures and practice aids, partial zoom notifications, countdowns, rotating cube and Top view, quiz retries, final return behavior, restart, and embed/narrow layouts.

## Hosting and size

GitHub Pages publishes main from the repository root. Commit and push through Git/SSH.

The site is approximately 13 MB excluding .git, including one 11.26 MB STL and about 1.37 MB of Three.js code. Git history is not part of the published site. New text-based lessons add little space; unique models, screenshots, videos, and duplicated bundles drive growth. Load only the chosen software and share media by URL.

npm run check reports size, detects duplicate media, and flags growth above a deliberate 100 MB review budget, well before the 1 GB Pages published-site limit. That review threshold is a project choice, not GitHub's limit. Host large video separately if needed. See [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Credits

See [credits](credits.html), [Three.js MIT license](shared/vendor/THREE-LICENSE.txt), and [Bambu AGPLv3 license](simulators/bambu-studio/BAMBU-LICENSE.txt). Bambu interface assets are unmodified originals. The cube follows camera-driven navigation described in [Bambu's GLCanvas3D source](https://github.com/bambulab/BambuStudio/blob/master/src/slic3r/GUI/GLCanvas3D.cpp). Benchy is credited to Creative Tools / 3DBenchy.com. Tutorial completion is not shop printing authorization.

## Tutorial 03: physical devices and material loading

`bambu-studio/material-installation/` uses the same teaching engine with a separate `simulators/bambu-lab/` adapter. Five tasks cover choosing Steve or Candus, releasing both AMS tabs, placing the roll, pressing the intake backward, and inserting filament. The final animated uptake must finish before completion. The selected device persists separately from step progress; checkpoints rebuild the physical state on resume/back. Keyboard and touch use projected buttons anchored to the 3D objects. Reduced-motion settings shorten transitions and omit spool spinning. No model/video download is needed: the scene is procedural and shares the existing Three.js library.

Moodle embed: `bambu-studio/material-installation/?embed=1`. The provided 120 MB reference video remains outside the repository and published site.
