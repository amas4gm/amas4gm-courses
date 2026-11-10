# AMAS4GM software tutorials

A static software catalog, shared teaching engine, and reusable software simulations. No build step, backend, external scripts, analytics, or printer connection.

## Published pages

- Catalog: https://amas4gm.github.io/amas4gm-courses/
- Bambu Studio: https://amas4gm.github.io/amas4gm-courses/bambu-studio/
- Tutorial 01: https://amas4gm.github.io/amas4gm-courses/bambu-studio/getting-started/
- Tutorial 02: https://amas4gm.github.io/amas4gm-courses/bambu-studio/object-manipulation/
- Tutorial 02 Moodle embed: https://amas4gm.github.io/amas4gm-courses/bambu-studio/object-manipulation/?embed=1
- Tutorial 01 Moodle embed: https://amas4gm.github.io/amas4gm-courses/bambu-studio/getting-started/?embed=1

The root URL used to open Tutorial 01. Update existing Moodle embeds to the lesson URL. Each page has a real directory and index.html, so direct links and reloads work on GitHub Pages without routing rules. Embed mode hides catalog navigation while retaining the simulation label and controls.

```html
<iframe
  src="https://amas4gm.github.io/amas4gm-courses/bambu-studio/getting-started/?embed=1"
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

The catalog loads only its metadata, renderer, and CSS. A lesson loads the teaching engine and its simulator; Bambu and Blender share Three.js; only the chosen simulator and its models load. Assets are resolved relative to their module using import.meta.url, so they work below GitHub's project URL prefix. Assets are shared once rather than copied into each tutorial.

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

Return an adapter implementing setStep(step, context), refreshState(), setPaused(value), setGuidance(active), getGuide(), getRegion(), perform(action), reset(), and dispose(). Context provides isCompleted() and completedSteps() for simulator actions, including actions awaiting a popup quiz, limited to the current step and earlier checkpoints so future effects do not leak into a retry. The engine separately tracks fully completed steps to enforce quiz gates. getGuide() returns a DOM target, parent, scale, and optional anchorY/above placement. Enable only the current concept. Dispose observers and rendering resources in dispose().

The Bambu adapter supports select, import, orbit, pan, zoom, view, and free actions. Completed-step effects reconstruct model visibility. viewBefore/viewAfter select tab demonstrations. Model and camera changes are independent.

## Tutorial 01

14 guided tasks plus optional free practice. Home opens first, Prepare starts empty, and learners explicitly import Benchy. Preview and Device have distinct simulated panels. The exact supplied STL retains its sideways orientation to introduce why models sometimes need reorientation for printing.

Only current concepts are enabled. Arrows and pulsing highlights stop immediately on completion. Wrong actions give a red flash. Success audio is immediate. Every newly completed task pauses before the summary: three seconds to observe by default, or five seconds of continued interaction for steps declaring completionMode: "practice" (navigation, transforms, and layer inspection). The observation pause holds the result still; only practice pauses invite further interaction. A positive completionDelayMs can override either duration. Hidden tabs pause the countdown. Top-view snaps, Lay on face, one-click selections, and animations use observation pauses. Completion popups include the explanation and a reminder of the pre-step text, plus Previous step and Retry step. Retry removes only the active step’s action/quiz completion and reconstructs its starting checkpoint, retaining other progress. Navigation instructions describe mouse, touchpad, and touchscreen gestures instead of navigation helper buttons. Pinch and wheel zoom share camera-distance tracking. Quizzes belong to these popups, not separate steps. A correct answer is required before continuing; wrong answers provide red-flash and audio feedback inside the popup. Closing or reloading preserves an unanswered check without unlocking the next task. One zoom direction triggers a notification and partial-success sound prompting the other direction. Sound can be muted; there are no points or badges.

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

The site source is approximately 33 MB excluding .git and local authoring references, including one 11.26 MB Benchy STL, about 1.37 MB of Three.js code, and 8.38 MB of lossless native Blender UI captures. Git history is not part of the published site. New text-based lessons add little space; unique models, screenshots, videos, and duplicated bundles drive growth. Load only the chosen software and share media by URL.

npm run check reports size, detects duplicate media, and flags growth above a deliberate 100 MB review budget, well before the 1 GB Pages published-site limit. That review threshold is a project choice, not GitHub's limit. Host large video separately if needed. See [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Credits

See [credits](credits.html), [Three.js MIT license](shared/vendor/THREE-LICENSE.txt), and [Bambu AGPLv3 license](simulators/bambu-studio/BAMBU-LICENSE.txt). Bambu interface assets are unmodified originals. The cube follows camera-driven navigation described in [Bambu's GLCanvas3D source](https://github.com/bambulab/BambuStudio/blob/master/src/slic3r/GUI/GLCanvas3D.cpp). Benchy is credited to Creative Tools / 3DBenchy.com. Tutorial completion is not shop printing authorization.

## Tutorial 03: physical devices and material loading

`bambu-studio/material-installation/` uses the same teaching engine with a separate `simulators/bambu-lab/` adapter. Five tasks cover choosing Steve or Candus, releasing both AMS tabs, placing the roll, pressing the intake backward, and inserting filament. The final animated uptake must finish before completion. The selected device persists separately from step progress; checkpoints rebuild the physical state on resume/back. Keyboard and touch use projected buttons anchored to the 3D objects. Reduced-motion settings shorten transitions and omit spool spinning. No model/video download is needed: the scene is procedural and shares the existing Three.js library.

Moodle embed: `bambu-studio/material-installation/?embed=1`. The provided 120 MB reference video remains outside the repository and published site.


## Tutorial 04: slicing, supports, and print cost

`bambu-studio/slicing-and-printing/` extends the shared Bambu Studio adapter with an optional printing workflow. Fourteen guided tasks cover the Device selector, matching project filament 1 to green A1 Bambu PLA Basic through its material dropdown, a first unsupported slice, the vertical upper-layer slider, the roof overhang, Prepare → Support → Enable support, a second slice and comparison, calculator practice, and a simulated print. The physical printer animation reuses the lab scene and supported toolpaths; no duplicate path asset or video is shipped.

Device and Support controls were checked against the open desktop Bambu Studio project on November 6, 2026. X2D / 0.4 mm / 0.08 mm High Quality: without supports, 3.89 m / 11.80 g, material cost $0.24, total time 1h40m; with Enable support, tree(auto), Default style, 15° threshold, 4.20 m / 12.72 g, $0.25, 1h50m. Both previews have 599 layers, 0.20 mm first layer, 48.04 mm top. Support geometry now comes from the actual supported slice generated by Bambu Studio 02.08.02.61 from the supplied Benchy.3mf on November 9, 2026. It reproduces paths through the doorway to the roof underside. Both body previews now use the real wall, infill, surface, and bridge toolpaths from the supported and unsupported slices. The printer animation uses the supported body paths too; nozzle motion and elapsed time are illustrative.

The selected physical device from Tutorial 03 is a reminder, not a requirement. Either Steve or Candus is accepted. The final price check opens the real AMAS calculator in a new tab and fetches its current `pricing.xml`, using a copy of its parser and calculation module (source: https://github.com/amas4gm/print-cost-calculator). The supported job currently rounds to $1.10. Current rates must load before an answer can pass; failure shows a retry message. The learner acknowledges checking the practice bill; the lesson does not inspect the calculator tab. Filling out the calculator does not charge them. Printing or saving a bill is not required. Zero staff labor applies only to the stated practice inputs.

Moodle embed: `bambu-studio/slicing-and-printing/?embed=1`. Allow new-tab links in the embed configuration so learners can open the calculator while retaining the lesson.


### Rebuilding the reference supports

The original project and sliced G-code remain outside this public repository in the parent course folder. Slice `Benchy.3mf` with its saved settings using Bambu Studio, then export a sliced 3MF (a normal saved project may omit G-code). Extract `Metadata/plate_1.gcode` from the sliced archive and run:

```sh
node scripts/extract-supports.mjs path/to/plate_1.gcode simulators/bambu-studio/assets/benchy-support-paths.bin
```

The extractor keeps only positive-extrusion Support and Support interface moves, including G2/G3 arcs tessellated to 0.015 mm chord error. Travel, retraction, wipe moves, machine commands, and project metadata are omitted. This reference is centered at Bambu plate coordinates 128/128; update the extractor options if using another placement. Float32 millimeter segments preserve the real width/height comments. The renderer uses rectangular beads with a 0.015 mm join overlap, not arbitrary tree cylinders. The manifest beside the binary records the source hash, settings, and segment counts. Regenerate and visually verify alignment whenever the model, placement, or slicing settings change.

The 2.40 MB support asset loads only with Tutorial 04. Its 75,107 segments use one instanced draw call, share layer clipping, and are reused in the final printing animation. The whole project/G-code is not shipped to learners. Run `node --test tests/*.test.mjs` and `node scripts/check-site.mjs` after rebuilding.


### Real body slices and layer inspection

Tutorial 04 uses two actual Bambu Studio slices, with support enabled and disabled; all other settings and model placement are preserved. Prepare retains the original solid STL. Preview hides that STL and renders only deposited paths: outer/inner walls, sparse/solid infill, top/bottom surfaces, bridges, gap infill, overhang walls, and floating vertical shells. Layer heights come from the reference's 0.20 mm first layer and 598 subsequent 0.08 mm layers. Paths above the selected height are excluded, so the empty spaces between walls and infill are visible. Travel, startup, and wiping paths are excluded.

After extracting each G-code file from its sliced archive, rebuild the body assets:

```sh
node scripts/extract-body-paths.mjs path/to/supported.gcode simulators/bambu-studio/assets/benchy-body-supported.bin.gz
node scripts/extract-body-paths.mjs path/to/unsupported.gcode simulators/bambu-studio/assets/benchy-body-unsupported.bin.gz
```

The two compressed assets total 5.01 MB, decoded with the browser's native DecompressionStream. Each contains about 251,000 deposited segments, rendered with instancing and sorted by height so lowering the slider also reduces drawing work. Only one body variant is visible at a time. The printing animation shares the supported path data, and uses a height limit as the build plate lowers. Browser support for WebGL and DecompressionStream is required. The estimated full site is 20.7 MB, comfortably within the 100 MB review budget and 1 GB Pages limit.

## Blender native-interface course

Course: https://amas4gm.github.io/amas4gm-courses/blender/

Four tutorials, 59 actions: getting-started (14), setup-for-printing (11), object-manipulation (15), edit-mode (19). The deliverable is a 100 × 70 × 18 mm desktop tray, with 3 mm walls and floor and a 0.6 mm outer rim bevel. Real `.blend` checkpoints and a dimension-checked STL support following along in Blender and saving separate experiments.

The Blender adapter places a live WebGL viewport behind complete native Blender 5.2.2 LTS captures. A luminance mask makes the viewport transparent while preserving the original surrounding UI pixels. Regular captures are 2400 × 1494 from the maximized application. Lossless WebP preserves their pixels. Full native menus, popovers, file browsers, transform previews, axis constraints, mode indicators, and status bars remain visible. Transparent named controls admit only the current exercise's interaction. The shared Bambu-style lesson card stays in a left sidebar in both regular and expanded mode. Expanded mode removes the page header and fits Blender into the space to the right, keeping the current instructions, feedback, and lesson controls beside it.

A separate 1000 × 1000 capture sequence teaches horizontal scrolling of a crowded editor header using the wheel or middle-mouse dragging. Orbit and pan are continuous, with Blender’s middle-button and Shift+middle-button controls. Wheel zoom uses Blender’s 1.2× increment. Selection raycasts the live mesh. Numeric transforms, inset, extrusion and bevel previews use actual geometry rather than camera frame sequences. Modal input previews mouse movement and editable numeric values continuously, with Enter/left-click confirmation and Escape/right-click cancellation. Three visual transform exercises teach Move, Rotate, Scale and Shift precision (one-tenth movement). Keycaps show input sequences, the native-style top entry record is highlighted, and incorrect attempts receive animated key/mouse guidance. The hand and magnifier use Blender’s native drag locations; orbit is available by dragging the axes. Three second-pass checkpoints explicitly practice common shortcuts. Existing menu paths remain available in the preceding steps. Numeric dimension fields also preview while typing. Extrusion cancellation deliberately requires Ctrl+Z to remove the geometry left at zero distance. These are checkpoint exercises, not a general-purpose Blender implementation.

`native-state.js` maps lesson boundaries to native frames; `native-modal.js` defines the admitted modal entry sequences; `native-simulator.js` supplies the interaction layer. `source-reference.json` pins original SVG icons, the Inter font, menu draw functions, keymaps, and relevant C++ source to upstream v5.2.2 / d13f752e3b9c. Asset notices and upstream license texts are included. The Blender adapter reuses the existing shared Three.js module, renders on demand, and does not run a perpetual animation loop. Eight tiny geometry files load once; the three added Blender-generated bevel variants total 4,272 bytes. Removed navigation frame sequences cut packaged UI media from 16.12 MB to 8.38 MB. `live-state.js` resolves geometry and selection; `live-viewport.js` renders the transparent opening and handles the camera. `assets/live/viewport-reference.json` records the native projection, camera and studio lights used for comparison. Bambu tutorials keep their existing adapters and shared teaching engine.

Rebuild model artifacts with Blender `--background --factory-startup --python scripts/generate-blender-course.py`. Model hashes, topology checks, and STL roundtrip measurements are in `simulators/blender/assets/manifest.json`. Physical printing has not been validated. Rebuild the small live bevel variants with `--background --factory-startup --python scripts/generate-blender-live.py`.

Rebuild native UI states in a separate Blender session with `--factory-startup -M --python scripts/capture-blender-ui.py`. Use an isolated `BLENDER_USER_CONFIG` for authoring. The narrow sequence uses `-p 50 50 1000 1000` and script argument `--narrow`; retain the regular capture manifest. The script also accepts explicit capture requests for manually verified menus and modal states. Raw PNGs stay in the ignored `simulators/blender/reference/` authoring directory. `python scripts/package-blender-ui.py` packages the lossless frames and exact menu crops, with geometry and SHA-256 provenance in `assets/ui/manifest.json`. Publish only the packaged assets.

Before the live-viewport release, native Blender UI checks covered E/-15/Escape/Ctrl+Z, Ctrl+B/0.6/wheel segment changes/Enter, and wheel zoom. A measured zoom changed distance 185 to 154.166656 (185 / 1.2). Browser checks cover the live camera, mesh picking, modal previews and expanded instructions. Solid shading is a browser rendering approximation; surrounding captured UI remains native.

Validation includes native asset integrity, full-frame coverage for every step and admitted modal value, evaluated Blender dimensions, closed manifold model topology, STL dimensions, numeric units, and progress/quiz persistence. Run `node --test tests/*.test.mjs`, `node scripts/check-site.mjs`, and a browser walkthrough after changing interaction code. The ignored `.qa` pages expose authored checkpoints for development; production retains the shared engine's observation pauses and quiz gates.

## Repository rename and embed migration

Renamed from bambu-studio-course to amas4gm-courses on November 9, 2026. Bambu lesson paths are unchanged below the new prefix. Update OpenLearn iframe URLs to `https://amas4gm.github.io/amas4gm-courses/bambu-studio/<lesson>/?embed=1`. Do not depend on old Pages URLs redirecting. Browser progress keys remain unchanged on the same origin. External OpenLearn course pages have not been edited.

Blender embeds: `https://amas4gm.github.io/amas4gm-courses/blender/getting-started/?embed=1`, and corresponding object-manipulation/edit-mode paths. An iframe height of 1100 px includes the follow-along downloads.


## Blender printing setup and input demonstrations

The separate `blender/setup-for-printing/` tutorial starts with no unit system. Eleven guided steps cover Scene Properties, Units, Metric, Unit Scale 0.001, Millimeters, the viewport Sidebar and View tab, Clip Start 0.1 mm, End 10000 mm, and File > Defaults > Save Startup File with its native confirmation. The template retains Cube, Camera, and Light. Clipping is saved for the Layout viewport; other workspaces retain their own view settings. `printing-setup.blend` is an optional scene template, never an automatic installer of user preferences. Its settings were checked by reopening the file in Blender 5.2.2.

Setup screenshots were captured from an isolated Blender profile in `.qa/blender-setup-config`. `scripts/capture-blender-setup.py` records the configuration states from an open VIEW_3D editor; manually verified Scene/Sidebar/dropdown/pop-up captures supply the remaining frames. `scripts/package-blender-setup.py` packages those native pixels and their hashes. Reference behavior: [Scene units](https://docs.blender.org/manual/en/5.0/scene_layout/scene/properties.html), [startup defaults](https://docs.blender.org/manual/en/dev/getting_started/configuration/defaults.html), and the installed Blender `VIEW3D_PT_view3d_properties` panel in `space_view3d.py`.

Meet Blender now requires the Sidebar menu first, then practices N. `input-demo.js` sequences target-specific mouse input, mouse fade-out, and in-workspace keycap presses with release/fade between keys. Numeric entry includes every digit and Enter; visual transforms show free pointer movement, Shift precision, and LMB confirmation. Demonstrations never perform the user's interaction. Reduced-motion mode displays the complete ordered sequence without animation. New and revised passages use one ElevenLabs Bella recording each.


The November 10 feedback revision removes the repeated Frame Selected and Save As drills and the orbit quiz. Numpad navigation remains optional. Apply Scale and Edit Mode require the menu first and the keyboard route second. Vertex selection now raycasts visible projected corners, replaces the selection on plain click, and toggles membership on Shift-click; point, edge, and face highlights follow the selected vertices. This matches the installed Blender keymap's `view3d.select` toggle behavior. The source highlight's inherited background no longer makes native text fields transparent. The Z axis is excluded from orbit pointer capture so its click reaches Top View. A retired step ID resumes at the next unfinished task rather than returning to the beginning.

The tray handoff reuses the Bambu Studio simulator and loads the exported STL. Learners select all four outer rim edges before beveling. Live bevel widths are interpolated from native Blender geometry with explicit profile 0.5, independently checked against Blender samples at 0.1, 1.2, and 2.4 mm for each segment count.

Course collections are labeled BambuLab Level 1 and Blender Level 1. Existing URLs and progress keys stay stable; each follow-on course advances to the next level, with its tutorials grouped within that level.
