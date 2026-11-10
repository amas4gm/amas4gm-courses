export default {
  "id": "getting-started",
  "software": "blender",
  "version": 2,
  "title": "Meet Blender",
  "subtitle": "Find your way around the interface and practice navigation.",
  "eyebrow": "INTRODUCTION TO BLENDER FOR 3D PRINTING",
  "simulatorLabel": "SIMULATED BLENDER",
  "simulationNote": "Native Blender 5.2.2 UI · live 3D practice",
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
      "task": "Choose View, then Sidebar. Use the menu for this step; you will practice N next.",
      "done": "Dimensions are the size of the object. Location describes its origin, not the bottom surface.",
      "simulation": {
        "action": "sidebar",
        "asset": "cube",
        "menuOnly": true
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Dimensions are the size of the object. Location describes its origin, not the bottom surface. Save your own real Blender file before experimenting.",
      "keys": [],
      "inputHint": "Open View, then click Sidebar. The next step teaches the N shortcut."
    },
    {
      "id": "sidebar-shortcut",
      "title": "Practice the Sidebar shortcut",
      "text": "The same starting checkpoint is restored so you can practice the keyboard route. The Item Sidebar lives inside the 3D Viewport. It displays location, rotation, scale, and dimensions. Blender shortcuts act on the editor under your pointer.",
      "task": "Focus the viewport and press `N`, then finish the same action.",
      "done": "Dimensions are the size of the object. Location describes its origin, not the bottom surface.",
      "simulation": {
        "action": "sidebar",
        "asset": "cube",
        "shortcutOnly": true
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Dimensions are the size of the object. Location describes its origin, not the bottom surface. Save your own real Blender file before experimenting.",
      "keys": [
        "N"
      ],
      "inputHint": "Use the shortcut on this second pass. The original menu method remains available in the previous step."
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
      "follow": "The object was removed. Next you will add your own mesh. Save your own real Blender file before experimenting.",
      "keys": [
        "Delete"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "add",
      "title": "Add a mesh cube",
      "text": "The Add menu creates objects. A cube is a useful starting shape for our rectangular organizer tray.",
      "task": "Choose Add → Mesh → Cube, or press `Shift` + `A`, then choose Mesh → Cube.",
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
      "follow": "A new cube appears and becomes selected. In Blender, Shift+A also opens Add. Save your own real Blender file before experimenting.",
      "keys": [
        "Shift+A"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
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
      "follow": "Name the object Desk Tray in real Blender, then save your project.",
      "keys": [
        "F2"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "orbit",
      "title": "Orbit around the object",
      "text": "Drag the rotating axes at the top right to orbit the scene. With a mouse, dragging the middle button in the viewport does the same thing. This moves your viewpoint, not the object.",
      "task": "Drag the colored axes, or drag with the middle mouse button.",
      "done": "The view changed; the cube did not rotate.",
      "simulation": {
        "action": "orbit",
        "asset": "cube"
      },
      "completionMode": "practice",
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The view changed; the cube did not rotate. Save your own real Blender file before experimenting.",
      "inputHint": "Press and hold on the colored axes, move the pointer, then release."
    },
    {
      "id": "pan",
      "title": "Move the view sideways",
      "text": "The hand below the rotating axes is Blender’s drag control for panning. It works with a mouse, pen, or touch. With a mouse you can also hold Shift and drag the middle button.",
      "task": "Drag the hand icon below the axes to slide the view.",
      "done": "Panning helps you inspect details without changing the model.",
      "simulation": {
        "action": "pan",
        "asset": "cube"
      },
      "completionMode": "practice",
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Panning helps you inspect details without changing the model. Save your own real Blender file before experimenting.",
      "inputHint": "Press and hold the hand icon, move in any direction, then release."
    },
    {
      "id": "zoom",
      "title": "Zoom in and out",
      "text": "Drag Blender’s magnifier below the axes up to zoom in and down to zoom out. A mouse wheel also zooms. The object’s dimensions do not change.",
      "task": "Drag the magnifier up, then down. Practice both directions.",
      "done": "Your model remains the same size in millimeters.",
      "simulation": {
        "action": "zoom",
        "asset": "cube"
      },
      "completionMode": "practice",
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Your model remains the same size in millimeters. Save your own real Blender file before experimenting.",
      "inputHint": "Press and hold the magnifier. Drag upward to enlarge the view, then downward to pull back."
    },
    {
      "id": "top",
      "title": "Look from above",
      "text": "The navigation gizmo gives you axis-aligned views. Z is the vertical axis; looking along it shows the top.",
      "task": "Click Z on the navigation gizmo, or press `Numpad 7`.",
      "done": "You are looking down at the top of the cube.",
      "simulation": {
        "action": "top",
        "asset": "cube"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "You are looking down at the top of the cube. Save your own real Blender file before experimenting.",
      "keys": [
        "Numpad 7"
      ],
      "inputHint": "The menu or button method and this keyboard shortcut are both supported. Shortcuts act in the focused viewport."
    },
    {
      "id": "frame",
      "title": "Find your selection again",
      "text": "Frame Selected centers and fits the selected object. It is useful when you have lost sight of your model. Use View → Frame Selected on any keyboard. If you have a numpad, its period key is an optional shortcut.",
      "task": "Choose View → Frame Selected, or press `Numpad .`.",
      "done": "The selected object is centered again.",
      "simulation": {
        "action": "frame",
        "asset": "cube",
        "target": "view"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "The selected object is centered again. Save your own real Blender file before experimenting.",
      "keys": [
        "Numpad ."
      ],
      "inputHint": "Open View and choose Frame Selected. Numpad period is optional; no numpad is needed."
    },
    {
      "id": "save",
      "title": "Save your starting project",
      "text": "Use File → Save As for a named checkpoint. The simulated dialog teaches the workflow; it does not save your real Blender project. In real Blender, Ctrl+S saves the current named file; Ctrl+Shift+S creates a separately named version.",
      "task": "Choose File → Save As, or press `Ctrl` + `Shift` + `S`, then confirm the filename.",
      "done": "In real Blender, save desk-tray-01-start.blend. Save often.",
      "simulation": {
        "action": "save",
        "asset": "cube",
        "target": "file",
        "filename": "desk-tray-01-start.blend"
      },
      "chapter": "BLENDER / PART 1 · OBJECT MODE",
      "controlStatus": "Only the current task is enabled · Blender 5.2 reference",
      "follow": "Save your real Blender project as desk-tray-01-start.blend. Save often, and keep a separate copy for experiments.",
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
        "asset": "cube"
      }
    }
  ]
};
