export default {
  "id": "getting-started",
  "software": "blender",
  "version": 1,
  "title": "Meet Blender",
  "subtitle": "Find your way around the interface and practice navigation.",
  "eyebrow": "INTRODUCTION TO BLENDER FOR 3D PRINTING",
  "simulatorLabel": "SIMULATED BLENDER",
  "simulationNote": "Focused practice · Blender-generated checkpoints · no printer connection",
  "follow": "Open real Blender alongside this lesson. Download a checkpoint to catch up. Save often.",
  "steps": [
    {
      "id": "viewport",
      "title": "Meet the 3D Viewport",
      "text": "This is a focused simulation of Blender 5.2. The large center area is the 3D Viewport: where you inspect and edit your model. We start with a prepared millimeter scene; download Start below to follow along.",
      "task": "Click inside the 3D Viewport.",
      "done": "The viewport shows your scene. The surrounding editors offer different views of the same project.",
      "simulation": {
        "action": "viewport",
        "asset": "cube",
        "selected": false
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The viewport shows your scene. The surrounding editors offer different views of the same project. Save your real Blender file before experimenting."
    },
    {
      "id": "outliner",
      "title": "Find your object in the Outliner",
      "text": "The Outliner at upper right lists scene objects. A selected object has an orange outline in the viewport.",
      "task": "Click Cube in the Outliner.",
      "done": "The Outliner selects the same object you see in the viewport.",
      "simulation": {
        "action": "outliner",
        "asset": "cube",
        "name": "Cube",
        "selected": false
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The Outliner selects the same object you see in the viewport. Save your real Blender file before experimenting."
    },
    {
      "id": "sidebar",
      "title": "Read the Item panel",
      "text": "The Item Sidebar displays location, rotation, scale, and dimensions. In real Blender, N toggles this Sidebar inside the viewport. This simulation keeps the relevant fields visible.",
      "task": "Click Item above the Transform fields.",
      "done": "Dimensions are the size of the object. Location describes its origin, not the bottom surface.",
      "simulation": {
        "action": "sidebar",
        "asset": "cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Dimensions are the size of the object. Location describes its origin, not the bottom surface. Save your real Blender file before experimenting."
    },
    {
      "id": "units",
      "title": "A scene for millimeters",
      "text": "Our downloadable starting scene uses Metric, Unit Scale 0.001, and Length Millimeters. One coordinate unit represents one millimeter. Use this checkpoint so your real project matches.",
      "task": "Click Scene Units.",
      "done": "These settings are already prepared in the checkpoint. Explicit entries such as 100 mm avoid ambiguity. Export scale must still be checked.",
      "simulation": {
        "action": "units",
        "asset": "cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "These settings are already prepared in the checkpoint. Explicit entries such as 100 mm avoid ambiguity. Export scale must still be checked. Save your real Blender file before experimenting."
    },
    {
      "id": "delete",
      "title": "Remove the practice cube",
      "text": "Object Mode acts on whole objects. Delete removes the selected object. In real Blender you can undo accidental deletion with Ctrl+Z.",
      "task": "Focus the viewport and press Delete, or use the practice aid below.",
      "done": "The object was removed. Next you will add your own mesh.",
      "simulation": {
        "action": "delete",
        "asset": "cube",
        "name": "Cube"
      },
      "tools": [
        [
          "delete",
          "Simulator aid: delete selected object"
        ]
      ],
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The object was removed. Next you will add your own mesh. Save your real Blender file before experimenting."
    },
    {
      "id": "add",
      "title": "Add a mesh cube",
      "text": "The Add menu creates objects. A cube is a useful starting shape for our rectangular organizer tray.",
      "task": "Choose Add, then Mesh → Cube.",
      "done": "A new cube appears and becomes selected. In Blender, Shift+A also opens Add.",
      "simulation": {
        "action": "add-cube",
        "asset": "cube",
        "empty": true,
        "target": "add",
        "name": "Cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "A new cube appears and becomes selected. In Blender, Shift+A also opens Add. Save your real Blender file before experimenting."
    },
    {
      "id": "orbit",
      "title": "Orbit around the object",
      "text": "Orbit changes where you look from. In Blender, drag the middle mouse button. A touch device may use one-finger dragging in this simulation.",
      "task": "Middle-drag to orbit. A labeled simulator aid is available below.",
      "done": "The view changed; the cube did not rotate.",
      "simulation": {
        "action": "orbit",
        "asset": "cube"
      },
      "quiz": {
        "prompt": "Does orbiting change the printed object?",
        "answers": [
          "No. It changes the view.",
          "Yes. It rotates the mesh."
        ],
        "correct": 0,
        "retry": "Think about what changed in this step. Try again.",
        "success": "Correct. Carry that distinction into real Blender."
      },
      "completionMode": "practice",
      "tools": [
        [
          "orbit-aid",
          "Simulator aid: orbit"
        ]
      ],
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The view changed; the cube did not rotate. Save your real Blender file before experimenting."
    },
    {
      "id": "pan",
      "title": "Move the view sideways",
      "text": "In Blender, Shift + middle-drag pans the view. Panning changes the camera target without moving the object.",
      "task": "Hold Shift and middle-drag to pan, or use the simulator aid.",
      "done": "Panning helps you inspect details without changing the model.",
      "simulation": {
        "action": "pan",
        "asset": "cube"
      },
      "completionMode": "practice",
      "tools": [
        [
          "pan-aid",
          "Simulator aid: pan"
        ]
      ],
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Panning helps you inspect details without changing the model. Save your real Blender file before experimenting."
    },
    {
      "id": "zoom",
      "title": "Zoom in and out",
      "text": "Scroll the mouse wheel to zoom. Zoom changes apparent size, not physical dimensions.",
      "task": "Zoom in, then zoom out. Both directions are required.",
      "done": "Your model remains the same size in millimeters.",
      "simulation": {
        "action": "zoom",
        "asset": "cube"
      },
      "completionMode": "practice",
      "tools": [
        [
          "zoom-in",
          "Simulator aid: zoom in"
        ],
        [
          "zoom-out",
          "Simulator aid: zoom out"
        ]
      ],
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Your model remains the same size in millimeters. Save your real Blender file before experimenting."
    },
    {
      "id": "top",
      "title": "Look from above",
      "text": "The navigation gizmo gives you axis-aligned views. Z is the vertical axis; looking along it shows the top.",
      "task": "Click Z on the navigation gizmo.",
      "done": "You are looking down at the top of the cube.",
      "simulation": {
        "action": "top",
        "asset": "cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "You are looking down at the top of the cube. Save your real Blender file before experimenting."
    },
    {
      "id": "frame",
      "title": "Find your selection again",
      "text": "Frame Selected centers and fits the selected object. It is useful when you have lost sight of your model. In real Blender, use numpad period or View → Frame Selected.",
      "task": "Open View and choose Frame Selected.",
      "done": "The selected object is centered again.",
      "simulation": {
        "action": "frame",
        "asset": "cube",
        "target": "view"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The selected object is centered again. Save your real Blender file before experimenting."
    },
    {
      "id": "save",
      "title": "Save your starting project",
      "text": "Use File → Save As for a named checkpoint. The simulated dialog teaches the workflow; it does not save your real Blender project.",
      "task": "Choose File → Save As and confirm the filename.",
      "done": "In real Blender, save desk-tray-01-start.blend. Save again after each meaningful change.",
      "simulation": {
        "action": "save",
        "asset": "cube",
        "target": "file",
        "filename": "desk-tray-01-start.blend"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "In real Blender, save desk-tray-01-start.blend. Save again after each meaningful change. Save your real Blender file before experimenting."
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
        "asset": "cube"
      }
    }
  ]
};
