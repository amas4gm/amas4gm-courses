export default {
  "id": "edit-mode",
  "software": "blender",
  "version": 2,
  "title": "Shape your first printable tray",
  "subtitle": "Inset, extrude, bevel, inspect, and export a real mesh.",
  "eyebrow": "INTRODUCTION TO BLENDER FOR 3D PRINTING",
  "simulatorLabel": "SIMULATED BLENDER",
  "simulationNote": "Native Blender 5.2.2 UI · live 3D practice",
  "follow": "Open real Blender alongside this lesson. Download a checkpoint to catch up. Save often.",
  "steps": [
    {
      "id": "mode",
      "title": "Enter Edit Mode",
      "text": "Object Mode transforms the whole object. Edit Mode changes its vertices, edges, and faces. The Layout workspace can contain either mode.",
      "task": "Open the mode selector and choose Edit Mode. Use the menu here; you will practice Tab next.",
      "done": "You are now working on the mesh inside the object.",
      "simulation": {
        "action": "edit-mode",
        "asset": "blank",
        "target": "mode",
        "menuOnly": true
      },
      "quiz": {
        "prompt": "Is Edit Mode a separate workspace?",
        "answers": [
          "No. It is a mode within the current workspace.",
          "Yes. It replaces the Layout workspace."
        ],
        "correct": 0,
        "retry": "Think about what changed in this step. Try again.",
        "success": "Correct. Carry that distinction into real Blender."
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "You are now working on the mesh inside the object. Save your own real Blender file before experimenting.",
      "keys": [],
      "inputHint": "Open the mode selector, then click Edit Mode. The next step teaches Tab."
    },
    {
      "id": "mode-shortcut",
      "title": "Practice the mode shortcut",
      "text": "The same starting checkpoint is restored so you can practice the keyboard route. Object Mode transforms the whole object. Edit Mode changes its vertices, edges, and faces. The Layout workspace can contain either mode.",
      "task": "Focus the viewport and press `Tab`, then finish the same action.",
      "done": "You are now working on the mesh inside the object.",
      "simulation": {
        "action": "edit-mode",
        "asset": "blank",
        "target": "mode",
        "shortcutOnly": true
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "You are now working on the mesh inside the object. Save your own real Blender file before experimenting.",
      "keys": [
        "Tab"
      ],
      "inputHint": "Use the shortcut on this second pass. The original menu method remains available in the previous step."
    },
    {
      "id": "vertices",
      "title": "Select vertices",
      "text": "Vertex Select is already active: the first of the three selection icons in the header is highlighted. This mode lets you select the mesh’s corner points. A plain click selects one vertex; Shift-click adds another or removes it from the selection.",
      "task": "Click one visible corner vertex. Then hold `Shift` and click a different corner to add it.",
      "done": "You selected one vertex, then added another with Shift-click. Edge Select and Face Select, beside Vertex Select in the header, let you select different parts of the same mesh.",
      "simulation": {
        "action": "select-vertices",
        "asset": "blank",
        "mode": "edit"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, try selecting one vertex and adding more with Shift-click. Top-row 1 returns to Vertex Select. Save often.",
      "keys": [
        "Shift"
      ],
      "inputHint": "First click one visible vertex. Then hold Shift while clicking a different vertex."
    },
    {
      "id": "edges",
      "title": "Identify edges",
      "text": "Edges are the lines connecting pairs of vertices. The middle selection icon switches to Edge Select so you can select those lines. For this step, just change the selection mode.",
      "task": "Click Edge Select. Or press `2` on the top row of your keyboard.",
      "done": "Edge Select is active. The third icon beside it switches to Face Select.",
      "simulation": {
        "action": "edge",
        "asset": "blank",
        "mode": "edit",
        "selectMode": "vertex"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, top-row 2 switches to Edge Select. Save often.",
      "keys": [
        "2"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "faces",
      "title": "Identify faces",
      "text": "Faces are the surfaces bounded by edges. Our tray begins by editing its top face.",
      "task": "Click Face Select. Or press `3` on the top row of your keyboard.",
      "done": "Top-row 3 chooses Face Select. Numpad keys control views instead.",
      "simulation": {
        "action": "face",
        "asset": "blank",
        "mode": "edit",
        "selectMode": "edge"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Top-row 3 chooses Face Select. Numpad keys control views instead. Save your own real Blender file before experimenting.",
      "keys": [
        "3"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "top-face",
      "title": "Select the top face",
      "text": "Select only the broad top surface. The inset will operate on this selection. The orange fill shows the chosen face.",
      "task": "Click the broad top face of the blank.",
      "done": "The selected top face is ready for the wall inset.",
      "simulation": {
        "action": "select-top",
        "asset": "blank",
        "mode": "edit",
        "selected": false
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The selected top face is ready for the wall inset. Save your own real Blender file before experimenting."
    },
    {
      "id": "inset",
      "title": "Define 3 mm walls",
      "text": "Inset Faces creates a smaller face surrounded by a rim. The rim becomes our wall footprint. The mesh previews while you move the pointer and while you type. The numeric entry record near the top of the viewport shows your input before you confirm.",
      "task": "Click the viewport. Press `I` → `3` → `Enter`. Watch the preview before Enter.",
      "done": "The inner face measures 94 × 64 mm. The surrounding rim is 3 mm wide.",
      "simulation": {
        "action": "inset",
        "asset": "blank",
        "mode": "edit",
        "value": 3,
        "after": "inset"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The inner face measures 94 × 64 mm. The surrounding rim is 3 mm wide. Save your own real Blender file before experimenting.",
      "keys": [
        "I",
        "3",
        "Enter"
      ],
      "inputHint": "Watch the highlighted numeric record at the top of the viewport. Backspace edits the value; Escape cancels."
    },
    {
      "id": "cancel-extrude",
      "title": "Cancel an extrusion safely",
      "text": "Extrusion creates geometry and then moves it. Escape cancels the movement, leaving the new geometry at zero distance. Ctrl+Z removes that extrusion. This is different from simply cancelling Move or Rotate.",
      "task": "Click the viewport. Press E, then Escape, then Ctrl+Z.",
      "done": "The extrusion geometry was undone. You are back at the inset checkpoint, ready to make the cavity.",
      "simulation": {
        "action": "extrude-cancel",
        "asset": "inset",
        "mode": "edit"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Practice Blender’s real cancellation and undo sequence",
      "follow": "In real Blender, undo an extrusion after cancelling its movement. Save before experimenting.",
      "keys": [
        "E",
        "Escape",
        "Ctrl+Z"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "extrude",
      "title": "Create the cavity",
      "text": "Extrude the selected inner face downward by 15 mm. Starting from a height of 18 mm leaves a 3 mm floor. Enter a negative value to move down Z. The mesh previews while you move the pointer and while you type. The numeric entry record near the top of the viewport shows your input before you confirm.",
      "task": "Click the viewport. Press `E` → `-` → `1` → `5` → `Enter`. Watch the preview before Enter.",
      "done": "The tray has an open cavity, 3 mm walls, and a 3 mm floor.",
      "simulation": {
        "action": "extrude",
        "asset": "inset",
        "mode": "edit",
        "value": -15,
        "after": "cavity"
      },
      "quiz": {
        "prompt": "How thick is the floor?",
        "answers": [
          "3 mm: 18 minus 15.",
          "15 mm.",
          "18 mm."
        ],
        "correct": 0,
        "retry": "Think about what changed in this step. Try again.",
        "success": "Correct. Carry that distinction into real Blender."
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The tray has an open cavity, 3 mm walls, and a 3 mm floor. Save your own real Blender file before experimenting.",
      "keys": [
        "E",
        "-",
        "1",
        "5",
        "Enter"
      ],
      "inputHint": "Watch the highlighted numeric record at the top of the viewport. Backspace edits the value; Escape cancels."
    },
    {
      "id": "save-cavity",
      "title": "Save before finishing",
      "text": "This is a useful recovery point. Save a version before adding bevel geometry. In real Blender, Ctrl+S saves the current named file; Ctrl+Shift+S creates a separately named version.",
      "task": "Choose File → Save As, or press `Ctrl` + `Shift` + `S`, then confirm the filename.",
      "done": "In real Blender, save desk-tray-03-cavity.blend, then experiment on a copy.",
      "simulation": {
        "action": "save",
        "asset": "cavity",
        "mode": "edit",
        "target": "file",
        "filename": "desk-tray-03-cavity.blend"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, save desk-tray-03-cavity.blend, then experiment on a copy. Save your own real Blender file before experimenting.",
      "keys": [
        "Ctrl+Shift+S"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "bevel",
      "title": "Soften the outside rim",
      "text": "This checkpoint prepares the four outer top rim edges. In real Blender, use Edge Select and Shift-click those four edges. A 0.6 mm bevel with three segments softens the upper outside rim. The mesh previews while you move the pointer and while you type. The numeric entry record near the top of the viewport shows your input before you confirm.",
      "task": "Click the viewport. Press `Ctrl` + `B`, type `0` `.` `6`, scroll up twice for 3 segments, then `Enter`.",
      "done": "The outside rim now has real rounded geometry. Smooth shading by itself would not change the printed shape.",
      "simulation": {
        "action": "bevel",
        "asset": "cavity",
        "mode": "edit",
        "selectMode": "edge",
        "value": 0.6,
        "after": "finished"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The outside rim now has real rounded geometry. Smooth shading by itself would not change the printed shape. Save your own real Blender file before experimenting.",
      "keys": [
        "Ctrl+B",
        "0",
        ".",
        "6",
        "Enter"
      ],
      "inputHint": "Watch the highlighted numeric record at the top of the viewport. Backspace edits the value; Escape cancels."
    },
    {
      "id": "orientation",
      "title": "Inspect outward faces",
      "text": "This inspection checkpoint starts with the finished mesh deselected. Face Orientation reveals reversed faces. Find the option in Viewport Overlays, under Geometry, then inspect all sides in real Blender.",
      "task": "Open the Viewport Overlays arrow, enable Face Orientation under Geometry, then click the viewport to close the popover.",
      "done": "Our generated mesh has no boundary or non-manifold edges. That does not replace checking dimensions, thickness, and sliced layers.",
      "simulation": {
        "action": "orientation",
        "asset": "finished",
        "mode": "edit"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Our generated mesh has no boundary or non-manifold edges. That does not replace checking dimensions, thickness, and sliced layers. Save your own real Blender file before experimenting."
    },
    {
      "id": "object",
      "title": "Return to Object Mode",
      "text": "Return to Object Mode before exporting the selected tray. Keep the editable Blender project as your source.",
      "task": "Choose Object Mode in the mode selector, or press `Tab` in the viewport.",
      "done": "The entire tray is selected for saving and export.",
      "simulation": {
        "action": "object-mode",
        "asset": "finished",
        "mode": "edit",
        "target": "mode"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The entire tray is selected for saving and export. Save your own real Blender file before experimenting.",
      "keys": [
        "Tab"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "save-final",
      "title": "Save the editable model",
      "text": "STL stores a mesh, not the complete Blender project. Save your .blend first so you can revise the design later. In real Blender, Ctrl+S saves the current named file; Ctrl+Shift+S creates a separately named version.",
      "task": "Choose File → Save As, or press `Ctrl` + `Shift` + `S`, then confirm the filename.",
      "done": "In real Blender, save desk-tray-04-finished.blend.",
      "simulation": {
        "action": "save",
        "asset": "finished",
        "target": "file",
        "filename": "desk-tray-04-finished.blend"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, save desk-tray-04-finished.blend. Save your own real Blender file before experimenting.",
      "keys": [
        "Ctrl+Shift+S"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "export",
      "title": "Export and verify the size",
      "text": "Our checkpoint stores coordinates in millimeters. Export selected objects with Scale 1 and Scene Unit off. The generated STL has been reimported and checked at 100 × 70 × 18 mm.",
      "task": "Choose File → Export → STL (.stl), then Export STL.",
      "done": "Download the reference STL from the course page. In Bambu Studio, verify 100 × 70 × 18 mm, bottom down, cavity up. Slice and inspect the floor and walls before printing. This reference has not yet been physically print-tested.",
      "simulation": {
        "action": "export",
        "asset": "finished",
        "target": "file"
      },
      "quiz": {
        "prompt": "What must you check after importing into the slicer?",
        "answers": [
          "Dimensions, orientation, and the sliced layers.",
          "Only that a model appears."
        ],
        "correct": 0,
        "retry": "Think about what changed in this step. Try again.",
        "success": "Correct. Carry that distinction into real Blender."
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Download the reference STL from the course page. In Bambu Studio, verify 100 × 70 × 18 mm, bottom down, cavity up. Slice and inspect the floor and walls before printing. This reference has not yet been physically print-tested. Save your own real Blender file before experimenting."
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
        "asset": "finished"
      }
    }
  ]
};
