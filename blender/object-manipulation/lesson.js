export default {
  "id": "object-manipulation",
  "software": "blender",
  "version": 2,
  "title": "Build a precise tray blank",
  "subtitle": "Move, rotate, dimension, and save an object for printing.",
  "eyebrow": "Blender Level 1 / 3D PRINTING",
  "simulatorLabel": "SIMULATED BLENDER",
  "simulationNote": "Native Blender 5.2.2 UI · live 3D practice",
  "follow": "Open real Blender alongside this lesson. Download a checkpoint to catch up. Save often.",
  "steps": [
    {
      "id": "select",
      "title": "Select the mesh",
      "text": "The selected object receives your changes. Click the cube itself, rather than empty space.",
      "task": "Click the cube in the viewport.",
      "done": "The orange outline identifies the active object, the last object you selected. Select the cube so Blender knows which object should receive your edits.",
      "simulation": {
        "action": "select-object",
        "asset": "cube",
        "selected": false
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, click the object you want to edit and look for its orange outline. Save your file before experimenting."
    },
    {
      "id": "visual-move",
      "title": "Move by eye with precision",
      "chapter": "BLENDER / VISUAL TRANSFORMS",
      "text": "G starts the Move command. Move the pointer to judge the result visually. Hold Shift while moving for slow and precise movement, then release Shift to return to normal speed. Left-click or Enter confirms the movement; Escape cancels. This is practice; the next movement exercise starts fresh.",
      "task": "Press `G`, move the pointer, then hold `Shift` and move again. Left-click or press `Enter` to confirm.",
      "keys": [
        "G",
        "Shift",
        "Enter"
      ],
      "inputHint": "Move without holding a mouse button after starting the operation. Hold Shift for fine control. Try Escape to cancel and restart.",
      "done": "You practiced visual transformation and Shift precision. The next checkpoint restores the cube for a new exercise.",
      "simulation": {
        "action": "move",
        "asset": "cube",
        "visual": true
      },
      "follow": "Try the same visual transform in real Blender. Save a new copy before experimenting."
    },
    {
      "id": "visual-rotate",
      "title": "Rotate by eye",
      "chapter": "BLENDER / VISUAL TRANSFORMS",
      "text": "R starts the Rotate command. Move the pointer to judge the rotation visually. Hold Shift for smaller changes, then release Shift to rotate at normal speed. Left-click or Enter confirms the rotation. Escape cancels. This is practice. The next exercise starts fresh.",
      "task": "Press `R`, move the pointer, then hold `Shift` and move again. Left-click or press `Enter` to confirm.",
      "keys": [
        "R",
        "Shift",
        "Enter"
      ],
      "inputHint": "Move without holding a mouse button after starting the operation. Hold Shift for fine control. Try Escape to cancel and restart.",
      "done": "You practiced visual transformation and Shift precision. The next checkpoint restores the cube for a new exercise.",
      "simulation": {
        "action": "rotate",
        "asset": "cube",
        "visual": true
      },
      "follow": "Try the same visual transform in real Blender. Save a new copy before experimenting."
    },
    {
      "id": "visual-scale",
      "title": "Scale by eye",
      "chapter": "BLENDER / VISUAL TRANSFORMS",
      "text": "S starts the Scale command. Move the pointer to judge the size visually. Hold Shift for smaller changes, then release Shift to scale at normal speed. Left-click or Enter confirms the new size. Escape cancels. This is practice. The next exercise starts fresh.",
      "task": "Press `S`, move the pointer, then hold `Shift` and move again. Left-click or press `Enter` to confirm.",
      "keys": [
        "S",
        "Shift",
        "Enter"
      ],
      "inputHint": "Move without holding a mouse button after starting the operation. Hold Shift for fine control. Try Escape to cancel and restart.",
      "done": "You practiced visual transformation and Shift precision. The next checkpoint restores the cube for a new exercise.",
      "simulation": {
        "action": "scale",
        "asset": "cube",
        "visual": true
      },
      "follow": "Try the same visual transform in real Blender. Save a new copy before experimenting."
    },
    {
      "id": "move",
      "title": "Move along X",
      "text": "In the last three steps, you moved, rotated, and scaled by eye from the current view. To constrain a transform to one axis, press X, Y, or Z after starting the command. For a precise distance, type a number and check the live preview before pressing Enter. Here, G starts Move and X restricts it to the X axis.",
      "task": "Click the viewport. Press `G` → `X` → `1` → `Enter`. Watch the preview before Enter.",
      "done": "The object moved 1 mm along X. The view and object dimensions stayed unchanged.",
      "simulation": {
        "action": "move",
        "asset": "cube",
        "value": 1
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The object moved 1 mm along X. The view and object dimensions stayed unchanged. Save your own real Blender file before experimenting.",
      "keys": [
        "G",
        "X",
        "1",
        "Enter"
      ],
      "inputHint": "Watch the highlighted numeric record at the top of the viewport. Backspace edits the value; Escape cancels."
    },
    {
      "id": "return",
      "title": "Return to the center",
      "text": "An absolute Location value describes where the origin is, not how far to move.",
      "task": "Double-click Location X to 0 mm, then press Enter.",
      "done": "The object returned to X = 0.",
      "simulation": {
        "action": "field",
        "asset": "cube",
        "field": "x",
        "value": 0,
        "values": {
          "x": 1
        }
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The object returned to X = 0. Save your own real Blender file before experimenting.",
      "keys": [
        "0",
        "Enter"
      ],
      "inputHint": "Double-click the named field first. Watch the live size or position as you type; Enter confirms and Escape restores it."
    },
    {
      "id": "rotate",
      "title": "Rotate around Z",
      "text": "Z is vertical. Rotation around Z turns the object in the horizontal plane. The mesh previews while you move the pointer and while you type. The numeric entry record near the top of the viewport shows your input before you confirm.",
      "task": "Click the viewport. Press `R` → `Z` → `4` → `5` → `Enter`. Watch the preview before Enter.",
      "done": "The mesh changed orientation; the view stayed fixed.",
      "simulation": {
        "action": "rotate",
        "asset": "cube",
        "value": 45
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The mesh changed orientation; the view stayed fixed. Save your own real Blender file before experimenting.",
      "keys": [
        "R",
        "Z",
        "4",
        "5",
        "Enter"
      ],
      "inputHint": "Watch the highlighted numeric record at the top of the viewport. Backspace edits the value; Escape cancels."
    },
    {
      "id": "straighten",
      "title": "Restore the orientation",
      "text": "We want axis-aligned dimensions while building the tray.",
      "task": "Double-click Rotation Z to 0, then press Enter.",
      "done": "The cube is aligned with X and Y again.",
      "simulation": {
        "action": "field",
        "asset": "cube",
        "field": "rz",
        "value": 0,
        "values": {
          "rz": 45
        }
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The cube is aligned with X and Y again. Save your own real Blender file before experimenting.",
      "keys": [
        "0",
        "Enter"
      ],
      "inputHint": "Double-click the named field first. Watch the live size or position as you type; Enter confirms and Escape restores it."
    },
    {
      "id": "width",
      "title": "Set the tray width",
      "text": "This checkpoint pulls the view back to leave room for a 100 × 70 × 18 mm tray. Dimensions changes the size of the selected object in Object Mode.",
      "task": "Double-click Dimensions X to 100 mm, then press Enter.",
      "done": "X is now 100 mm. The other dimensions have not changed.",
      "simulation": {
        "action": "field",
        "asset": "cube",
        "field": "dx",
        "value": 100
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "X is now 100 mm. The other dimensions have not changed. Save your own real Blender file before experimenting.",
      "keys": [
        "1",
        "0",
        "0",
        "Enter"
      ],
      "inputHint": "Double-click the named field first. Watch the live size or position as you type; Enter confirms and Escape restores it."
    },
    {
      "id": "depth",
      "title": "Set the tray depth",
      "text": "Independent dimensions let us turn the cube into a rectangular blank.",
      "task": "Double-click Dimensions Y to 70 mm, then press Enter.",
      "done": "The footprint is now 100 × 70 mm.",
      "simulation": {
        "action": "field",
        "asset": "cube",
        "field": "dy",
        "value": 70,
        "values": {
          "dx": 100
        }
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The footprint is now 100 × 70 mm. Save your own real Blender file before experimenting.",
      "keys": [
        "7",
        "0",
        "Enter"
      ],
      "inputHint": "Double-click the named field first. Watch the live size or position as you type; Enter confirms and Escape restores it."
    },
    {
      "id": "height",
      "title": "Set the tray height",
      "text": "The outside height is 18 mm. The cavity will be cut into this volume in Edit Mode.",
      "task": "Double-click Dimensions Z to 18 mm, then press Enter.",
      "done": "The tray blank now measures 100 × 70 × 18 mm.",
      "simulation": {
        "action": "field",
        "asset": "cube",
        "field": "dz",
        "value": 18,
        "values": {
          "dx": 100,
          "dy": 70
        }
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The tray blank now measures 100 × 70 × 18 mm. Save your own real Blender file before experimenting.",
      "keys": [
        "1",
        "8",
        "Enter"
      ],
      "inputHint": "Double-click the named field first. Watch the live size or position as you type; Enter confirms and Escape restores it."
    },
    {
      "id": "apply",
      "title": "Apply scale",
      "text": "As we changed the dimensions in the Item sidebar, did you notice how the scale fields also changed? Apply Scale makes the current size part of the mesh and resets each scale field to 1. In Object Mode, Ctrl+A opens the Apply menu, which offers Scale alongside options for applying Location or Rotation.",
      "task": "Choose Object → Apply → Scale. You can also press `Ctrl` + `A` in the viewport to open the Apply menu, then choose Scale.",
      "done": "The blank keeps its dimensions. Scale is now 1 on every axis and the original scale can no longer be recovered by entering 1 in the scale fields in the Item sidebar.",
      "simulation": {
        "action": "apply-scale",
        "asset": "cube",
        "values": {
          "dx": 100,
          "dy": 70,
          "dz": 18,
          "sx": 50,
          "sy": 35,
          "sz": 9
        },
        "target": "object"
      },
      "quiz": {
        "prompt": "What should Apply Scale preserve?",
        "answers": [
          "The visible size and shape.",
          "The original two-millimeter dimensions."
        ],
        "correct": 0,
        "retry": "Think about what changed in this step. Try again.",
        "success": "Correct. Carry that distinction into real Blender."
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, check that the blank keeps its dimensions and the Item sidebar shows 1 for each scale field.",
      "keys": [
        "Ctrl+A"
      ],
      "inputHint": "Open Object, hover over Apply, then click Scale. Ctrl+A opens the same Apply menu in the viewport."
    },
    {
      "id": "ground",
      "title": "Place the bottom at zero",
      "text": "Let's move the tray blank up so it sits on the XY plane. With the bottom at Z = 0, the grid gives us a clear reference for the surface that will sit on the print bed. The blank is 18 mm tall and its origin is at its center, so set the center to Z = 9 mm.",
      "task": "Double-click Location Z, enter 9 mm, then press Enter.",
      "done": "The bottom is now at zero. The next checkpoint preserves the blank as actual Blender geometry.",
      "simulation": {
        "action": "field",
        "asset": "cube",
        "field": "z",
        "value": 9,
        "values": {
          "dx": 100,
          "dy": 70,
          "dz": 18
        },
        "after": "blank"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The bottom is now at zero. The next checkpoint preserves the blank as actual Blender geometry. Save your own real Blender file before experimenting.",
      "keys": [
        "9",
        "Enter"
      ],
      "inputHint": "Double-click the named field first. Watch the live size or position as you type; Enter confirms and Escape restores it."
    },
    {
      "id": "save",
      "title": "Save the sized blank",
      "text": "Before editing topology, save a separate checkpoint. You can return to it if an experiment goes wrong. In real Blender, Ctrl+S saves the current named file; Ctrl+Shift+S creates a separately named version.",
      "task": "Choose File → Save As, or press `Ctrl` + `Shift` + `S`, then confirm the filename.",
      "done": "In real Blender, save desk-tray-02-sized.blend. The Blank download below is available if you need to catch up.",
      "simulation": {
        "action": "save",
        "asset": "blank",
        "target": "file",
        "filename": "desk-tray-02-sized.blend"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, save desk-tray-02-sized.blend. The Blank download below is available if you need to catch up. Save your own real Blender file before experimenting.",
      "keys": [
        "Ctrl+Shift+S"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "complete",
      "title": "Continue in real Blender",
      "chapter": "TUTORIAL COMPLETE",
      "text": "You completed this tutorial. Orbit, pan, and zoom the live model here, then download the checkpoint and continue in real Blender. Save a new version before experimenting.",
      "task": "Download a checkpoint, or return to the course.",
      "done": "Save your real Blender project before leaving.",
      "terminal": true,
      "simulation": {
        "action": "free",
        "asset": "blank"
      }
    }
  ]
};
