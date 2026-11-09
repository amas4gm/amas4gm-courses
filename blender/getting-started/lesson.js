export default {
  "id": "getting-started",
  "software": "blender",
  "version": 2,
  "title": "Meet Blender",
  "subtitle": "Find your way around the interface and practice navigation.",
  "eyebrow": "INTRODUCTION TO BLENDER FOR 3D PRINTING",
  "simulatorLabel": "SIMULATED BLENDER",
  "simulationNote": "Native Blender 5.2.2 interface · bounded checkpoint practice",
  "follow": "Open real Blender alongside this lesson. Download a checkpoint to catch up. Save often.",
  "steps": [
    {
      "id": "viewport",
      "title": "Meet the 3D Viewport",
      "text": "This is Blender’s complete Layout workspace. The large 3D Viewport is surrounded by the Outliner, Properties editor, Timeline, workspaces, menus, and tools. We will isolate one control at a time, keeping the surrounding interface visible.",
      "task": "Click inside the 3D Viewport.",
      "done": "The viewport shows your scene. The surrounding editors offer different views of the same project.",
      "simulation": {
        "action": "viewport",
        "asset": "cube",
        "selected": false
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The viewport shows your scene. The surrounding editors offer different views of the same project. Save your own real Blender file before experimenting."
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
      "follow": "The Outliner selects the same object you see in the viewport. Save your own real Blender file before experimenting."
    },
    {
      "id": "sidebar",
      "title": "Read the Item panel",
      "text": "The Item Sidebar lives inside the 3D Viewport. It displays location, rotation, scale, and dimensions. Blender shortcuts act on the editor under your pointer.",
      "task": "Move into the viewport and press N, or choose View → Sidebar.",
      "done": "Dimensions are the size of the object. Location describes its origin, not the bottom surface.",
      "simulation": {
        "action": "sidebar",
        "asset": "cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Dimensions are the size of the object. Location describes its origin, not the bottom surface. Save your own real Blender file before experimenting."
    },
    {
      "id": "headers",
      "title": "Find controls in a crowded header",
      "text": "This step deliberately uses a narrow Blender window. When an editor is too narrow, controls remain in its horizontally scrollable header. They have not disappeared. Hover over that header and use the wheel, trackpad horizontal scroll, or middle-mouse drag. Widening the window also helps.",
      "task": "Scroll over the viewport header to reveal controls at its right end, or middle-drag the header to the left.",
      "done": "You scrolled the header without moving the 3D view. In real Blender, this also applies to other crowded editor headers and workspace tabs.",
      "simulation": {
        "action": "header-scroll",
        "asset": "cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Narrow-window exercise · scroll the header",
      "follow": "Try narrowing Blender, scroll its header, then maximize it again before continuing."
    },
    {
      "id": "units",
      "title": "A scene for millimeters",
      "text": "The prepared millimeter checkpoint uses Metric, Unit Scale 0.001, and Length Millimeters. These settings are already set here. Expand the actual Units section to inspect them.",
      "task": "Expand Units in Scene Properties on the right.",
      "done": "These settings are already prepared in the checkpoint. Explicit entries such as 100 mm avoid ambiguity. Export scale must still be checked.",
      "simulation": {
        "action": "units",
        "asset": "cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "These settings are already prepared in the checkpoint. Explicit entries such as 100 mm avoid ambiguity. Export scale must still be checked. Save your own real Blender file before experimenting."
    },
    {
      "id": "delete",
      "title": "Remove the practice object",
      "text": "We now load the prepared Start checkpoint: a single mesh named Desk Tray, with millimeter units. Object Mode acts on whole objects. Delete removes the selected object; Ctrl+Z in real Blender can recover an accidental deletion.",
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
      "follow": "The object was removed. Next you will add your own mesh. Save your own real Blender file before experimenting."
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
      "follow": "A new cube appears and becomes selected. In Blender, Shift+A also opens Add. Save your own real Blender file before experimenting."
    },
    {
      "id": "rename",
      "title": "Give the object a useful name",
      "text": "Blender names a new mesh Cube. A useful object name makes it easier to find in the Outliner as a project grows. F2 renames the active object.",
      "task": "Click the viewport. Press F2, type Desk Tray, then Enter.",
      "done": "The Outliner and viewport identify the same object as Desk Tray. Renaming changes its label, not its geometry.",
      "simulation": {
        "action": "rename",
        "asset": "cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only this step’s interaction is enabled",
      "follow": "Name the object Desk Tray in real Blender, then save your project."
    },
    {
      "id": "orbit",
      "title": "Orbit around the object",
      "text": "Orbit changes where you look from. In Blender, drag the middle mouse button. Here we isolate horizontal orbit so you can learn the gesture without losing the object.",
      "task": "Middle-drag horizontally to orbit, or use the labeled simulation aid.",
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
      "follow": "The view changed; the cube did not rotate. Save your own real Blender file before experimenting."
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
      "follow": "Panning helps you inspect details without changing the model. Save your own real Blender file before experimenting."
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
      "follow": "Your model remains the same size in millimeters. Save your own real Blender file before experimenting."
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
      "follow": "You are looking down at the top of the cube. Save your own real Blender file before experimenting."
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
      "follow": "The selected object is centered again. Save your own real Blender file before experimenting."
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
      "follow": "In real Blender, save desk-tray-01-start.blend. Save again after each meaningful change. Save your own real Blender file before experimenting."
    },
    {
      "id": "complete",
      "title": "Continue in real Blender",
      "chapter": "TUTORIAL COMPLETE",
      "text": "You completed this tutorial. Download the checkpoint and inspect it in real Blender. Save a new version before experimenting.",
      "task": "Download a checkpoint, or return to the course.",
      "done": "Save your real Blender project before leaving.",
      "terminal": true,
      "simulation": {
        "action": "free",
        "asset": "cube"
      }
    }
  ]
};
