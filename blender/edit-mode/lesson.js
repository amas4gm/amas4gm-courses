export default {
  "id": "edit-mode",
  "software": "blender",
  "version": 1,
  "title": "Shape your first printable tray",
  "subtitle": "Inset, extrude, bevel, inspect, and export a real mesh.",
  "eyebrow": "INTRODUCTION TO BLENDER FOR 3D PRINTING",
  "simulatorLabel": "SIMULATED BLENDER",
  "simulationNote": "Focused practice · Blender-generated checkpoints · no printer connection",
  "follow": "Open real Blender alongside this lesson. Download a checkpoint to catch up. Save often.",
  "steps": [
    {
      "id": "mode",
      "title": "Enter Edit Mode",
      "text": "Object Mode transforms the whole object. Edit Mode changes its vertices, edges, and faces. The Layout workspace can contain either mode.",
      "task": "Open the mode selector and choose Edit Mode.",
      "done": "You are now working on the mesh inside the object.",
      "simulation": {
        "action": "edit-mode",
        "asset": "blank",
        "target": "mode"
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
      "follow": "You are now working on the mesh inside the object. Save your real Blender file before experimenting."
    },
    {
      "id": "vertices",
      "title": "Identify vertices",
      "text": "Vertices are the corner points of a mesh. Moving one changes the connected edges and faces.",
      "task": "Click Vertex Select in the viewport header.",
      "done": "The corner points are visible. In real Blender, top-row 1 chooses Vertex Select in Edit Mode.",
      "simulation": {
        "action": "vertex",
        "asset": "blank",
        "mode": "edit"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The corner points are visible. In real Blender, top-row 1 chooses Vertex Select in Edit Mode. Save your real Blender file before experimenting."
    },
    {
      "id": "edges",
      "title": "Identify edges",
      "text": "Edges connect pairs of vertices. Beveling selected edges adds a narrow transition between surfaces.",
      "task": "Click Edge Select.",
      "done": "Edges are the lines of the mesh. Top-row 2 chooses Edge Select.",
      "simulation": {
        "action": "edge",
        "asset": "blank",
        "mode": "edit",
        "selectMode": "vertex"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Edges are the lines of the mesh. Top-row 2 chooses Edge Select. Save your real Blender file before experimenting."
    },
    {
      "id": "faces",
      "title": "Identify faces",
      "text": "Faces are the surfaces bounded by edges. Our tray begins by editing its top face.",
      "task": "Click Face Select.",
      "done": "Top-row 3 chooses Face Select. Numpad keys control views instead.",
      "simulation": {
        "action": "face",
        "asset": "blank",
        "mode": "edit",
        "selectMode": "edge"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Top-row 3 chooses Face Select. Numpad keys control views instead. Save your real Blender file before experimenting."
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
      "follow": "The selected top face is ready for the wall inset. Save your real Blender file before experimenting."
    },
    {
      "id": "inset",
      "title": "Define 3 mm walls",
      "text": "Inset Faces creates a smaller face surrounded by a rim. The rim becomes our wall footprint.",
      "task": "Click Inset Faces, enter 3 mm in Width, then Confirm.",
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
      "follow": "The inner face measures 94 × 64 mm. The surrounding rim is 3 mm wide. Save your real Blender file before experimenting."
    },
    {
      "id": "extrude",
      "title": "Create the cavity",
      "text": "Extrude the selected inner face downward by 15 mm. Starting from a height of 18 mm leaves a 3 mm floor. Enter a negative value to move down Z.",
      "task": "Click Extrude Region, enter -15 mm in Move Z, then Confirm.",
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
      "follow": "The tray has an open cavity, 3 mm walls, and a 3 mm floor. Save your real Blender file before experimenting."
    },
    {
      "id": "save-cavity",
      "title": "Save before finishing",
      "text": "This is a useful recovery point. Save a version before adding bevel geometry.",
      "task": "Choose File → Save As and save the cavity checkpoint.",
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
      "follow": "In real Blender, save desk-tray-03-cavity.blend, then experiment on a copy. Save your real Blender file before experimenting."
    },
    {
      "id": "bevel",
      "title": "Soften the outside rim",
      "text": "This checkpoint prepares the four outer top rim edges. In real Blender, use Edge Select and Shift-click those four edges. A 0.6 mm bevel with three segments softens the upper outside rim.",
      "task": "Click Bevel, enter 0.6 mm in Width, then Confirm.",
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
      "follow": "The outside rim now has real rounded geometry. Smooth shading by itself would not change the printed shape. Save your real Blender file before experimenting."
    },
    {
      "id": "orientation",
      "title": "Inspect outward faces",
      "text": "Face Orientation helps reveal reversed faces: blue faces point toward you, while red indicates their reverse side. This checkpoint has outward-facing normals. Inspect all sides in real Blender.",
      "task": "Click Face Orientation.",
      "done": "Our generated mesh has no boundary or non-manifold edges. That does not replace checking dimensions, thickness, and sliced layers.",
      "simulation": {
        "action": "orientation",
        "asset": "finished",
        "mode": "edit"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Our generated mesh has no boundary or non-manifold edges. That does not replace checking dimensions, thickness, and sliced layers. Save your real Blender file before experimenting."
    },
    {
      "id": "object",
      "title": "Return to Object Mode",
      "text": "Return to Object Mode before exporting the selected tray. Keep the editable Blender project as your source.",
      "task": "Open the mode selector and choose Object Mode.",
      "done": "The entire tray is selected for saving and export.",
      "simulation": {
        "action": "object-mode",
        "asset": "finished",
        "mode": "edit",
        "target": "mode"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The entire tray is selected for saving and export. Save your real Blender file before experimenting."
    },
    {
      "id": "save-final",
      "title": "Save the editable model",
      "text": "STL stores a mesh, not the complete Blender project. Save your .blend first so you can revise the design later.",
      "task": "Choose File → Save As and save the finished tray.",
      "done": "In real Blender, save desk-tray-04-finished.blend.",
      "simulation": {
        "action": "save",
        "asset": "finished",
        "target": "file",
        "filename": "desk-tray-04-finished.blend"
      },
      "chapter": "BLENDER / PART 2 · EDIT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, save desk-tray-04-finished.blend. Save your real Blender file before experimenting."
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
      "follow": "Download the reference STL from the course page. In Bambu Studio, verify 100 × 70 × 18 mm, bottom down, cavity up. Slice and inspect the floor and walls before printing. This reference has not yet been physically print-tested. Save your real Blender file before experimenting."
    },
    {
      "id": "complete",
      "title": "Keep inspecting",
      "chapter": "TUTORIAL COMPLETE",
      "text": "You completed this tutorial. You may orbit, pan, and zoom around the checkpoint here. Continue with the next tutorial from the course page.",
      "task": "Inspect the model, or return to the course.",
      "done": "Save your real Blender project before leaving.",
      "terminal": true,
      "simulation": {
        "action": "free",
        "asset": "finished"
      }
    }
  ]
};
