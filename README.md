# AMAS4GM Bambu Studio course

Tutorial 01: workspace orientation and 3D navigation. Clearly labeled simulation; no printer connection, slicing, or printing.

The interface is reconstructed from the installed Bambu Studio Home, Prepare, Preview, and Device workspaces. New learners start on Home and select Prepare to reveal an empty plate. Preview displays its slicing summary and inactive layer/toolpath sliders; Device displays simulated monitoring and control panels with no live connection. Learners explicitly return to Prepare. After the interface tour, a simulated file picker teaches Add model → Benchy.stl → Open. The exact supplied STL keeps its original sideways orientation to illustrate how imported models can need reorientation for printing; the next tutorial teaches model orientation. Only the current learning concept is interactive. Camera navigation uses left drag on empty space, right/middle drag to pan, and wheel zoom. Keyboard and touch practice buttons are supplied outside the slicer UI.

Translucent arrows and pulsing green highlights guide clicks and stop as soon as a task is complete, including when revisiting completed steps. Each completed step opens a focused summary overlay with its explanation and Continue button. Learners can dismiss it to review the workspace and reopen the summary without losing progress. Add model uses a transparent hit area over one native toolbar icon. Reset view is an optional free-practice control, not a lesson step. Incorrect controls, navigation gestures, and quiz answers give a brief local red flash with text guidance. Reduced-motion preferences keep highlights steady. Short synthesized success, retry, and completion sounds have an on/off toggle. There are no points or badges. Plate controls are rendered in the plate's 3D plane so their perspective and scale follow navigation.

## Run
Serve this directory with any static HTTP server. Open index.html. Local file URLs cannot fetch the STL. No build step or external scripts required.

## Scope
14 guided steps plus free navigation practice. Other course lessons and assessment policies are not implemented here. Completion is browser-local practice progress, not a Moodle grade or shop printing authorization. Model editing and print controls remain disabled. The expanded import sequence uses a new progress version; old tutorial progress does not skip the new exercises.

## Hosting
Publish main from repository root in GitHub Pages. Embed its HTTPS URL in OpenLearn Create where iframes are permitted. A desktop or laptop and mouse are recommended for the native-size interface.

## Credits
See credits.html, THREE-LICENSE.txt, and BAMBU-LICENSE.txt. UI assets are from Bambu Lab/BambuStudio (AGPLv3). Three.js r170 is MIT licensed. Benchy is credited to Creative Tools / 3DBenchy.com.
