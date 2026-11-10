export default {
  "id": "object-manipulation",
  "software": "blender",
  "version": 2,
  "title": "Build a precise tray blank",
  "subtitle": "Move, rotate, dimension, and save an object for printing.",
  "eyebrow": "INTRODUCTION TO BLENDER FOR 3D PRINTING",
  "simulatorLabel": "SIMULATED BLENDER",
  "simulationNote": "Native Blender 5.2.2 UI · live 3D practice",
  "follow": "Open real Blender alongside this lesson. Download a checkpoint to catch up. Save often.",
  "steps": [
    {
      "id": "select",
      "title": "Select the mesh",
      "text": "The selected object receives your changes. Click the cube itself, rather than empty space.",
      "task": "Click the cube in the viewport.",
      "done": "The orange outline identifies the active object.",
      "simulation": {
        "action": "select-object",
        "asset": "cube",
        "selected": false
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The orange outline identifies the active object. Save your own real Blender file before experimenting."
    },
    {
      "id": "visual-move",
      "title": "Move by eye with precision",
      "chapter": "BLENDER / VISUAL TRANSFORMS",
      "text": "G starts Move. Move the pointer to judge the result visually. Hold Shift while moving for one-tenth-speed precision, then release Shift to return to normal speed. Left-click or Enter confirms; Escape cancels. This is a practice copy; the next exercise starts from a fresh cube.",
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
      "text": "R starts Rotate. Move the pointer to judge the result visually. Hold Shift while moving for one-tenth-speed precision, then release Shift to return to normal speed. Left-click or Enter confirms; Escape cancels. This is a practice copy; the next exercise starts from a fresh cube.",
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
      "text": "S starts Scale. Move the pointer to judge the result visually. Hold Shift while moving for one-tenth-speed precision, then release Shift to return to normal speed. Left-click or Enter confirms; Escape cancels. This is a practice copy; the next exercise starts from a fresh cube.",
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
      "text": "G starts Blender’s Move operation. X constrains it to the X axis. Numeric entry sets the distance, and Enter confirms. Escape or right-click cancels the operation. The mesh previews while you move the pointer and while you type. The numeric entry record near the top of the viewport shows your input before you confirm.",
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
      "text": "Changing dimensions in Object Mode changes scale. Apply Scale preserves the visible size while making the scale values 1. This gives dimension-sensitive mesh tools a consistent starting point.",
      "task": "Choose Object → Apply → Scale. Use the menu here; you will practice Ctrl+A next.",
      "done": "The blank keeps its dimensions. Scale is now 1 on every axis.",
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
        "target": "object",
        "menuOnly": true
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
      "follow": "The blank keeps its dimensions. Scale is now 1 on every axis. Save your own real Blender file before experimenting.",
      "keys": [],
      "inputHint": "Open Object, hover over Apply, then click Scale. The next step teaches Ctrl+A."
    },
    {
      "id": "apply-shortcut",
      "title": "Practice Apply Scale",
      "text": "The same starting checkpoint is restored so you can practice the keyboard route. Changing dimensions in Object Mode changes scale. Apply Scale preserves the visible size while making the scale values 1. This gives dimension-sensitive mesh tools a consistent starting point.",
      "task": "Focus the viewport and press `Ctrl` + `A` and choose Scale.",
      "done": "The blank keeps its dimensions. Scale is now 1 on every axis.",
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
        "target": "object",
        "shortcutOnly": true
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The blank keeps its dimensions. Scale is now 1 on every axis. Save your own real Blender file before experimenting.",
      "keys": [
        "Ctrl+A"
      ],
      "inputHint": "Use the shortcut on this second pass. The original menu method remains available in the previous step."
    },
    {
      "id": "ground",
      "title": "Place the bottom at zero",
      "text": "The cube origin is at its center. With an 18 mm height, the center must be at Z = 9 mm for the bottom to sit at Z = 0.",
      "task": "Double-click Location Z to 9 mm, then press Enter.",
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
