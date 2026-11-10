export default {
  "id": "setup-for-printing",
  "software": "blender",
  "version": 1,
  "title": "Setting up Blender for 3D printing",
  "subtitle": "Configure units, viewport clipping, and your startup scene.",
  "eyebrow": "Blender Level 1 / 3D PRINTING",
  "simulatorLabel": "SIMULATED BLENDER",
  "simulationNote": "Native Blender 5.2.2 UI · live 3D practice",
  "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often.",
  "steps": [
    {
      "id": "scene",
      "title": "Find Scene Properties",
      "text": "Scene units belong to the scene. Find the Properties editor at the right, then its Scene tab: the icon combines a cone, sphere, and light. This is different from the Item Sidebar inside the viewport.",
      "task": "Click the Scene Properties tab.",
      "done": "You selected Scene Properties. Next, open its Units section.",
      "simulation": {
        "asset": "cube",
        "action": "setup-click",
        "label": "Scene Properties",
        "box": [
          1978,
          523,
          38,
          39
        ]
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often."
    },
    {
      "id": "units",
      "title": "Open the Units section",
      "text": "The Units section is collapsed. We start without a unit system so you can configure it yourself. These scene settings travel with your Blender file.",
      "task": "Click the Units heading to expand it.",
      "done": "Unit System currently reads None. The scale and length controls become useful after choosing Metric.",
      "simulation": {
        "asset": "cube",
        "action": "setup-click",
        "label": "Units",
        "box": [
          2028,
          610,
          357,
          37
        ]
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often."
    },
    {
      "id": "system",
      "title": "Choose Metric",
      "text": "Metric enables familiar physical measurements. Choosing Millimeters later changes the displayed length unit; Unit Scale controls how Blender units relate to physical size.",
      "task": "Open Unit System and choose Metric.",
      "done": "Metric is selected. The scale is still 1, so one Blender unit currently represents one meter.",
      "simulation": {
        "asset": "cube",
        "action": "setup-choice",
        "label": "Unit System",
        "box": [
          2180,
          657,
          190,
          30
        ],
        "menu": "setup-system-menu",
        "choice": "Metric",
        "choiceBox": [
          2180,
          722,
          190,
          30
        ]
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often."
    },
    {
      "id": "scale",
      "title": "Set the course unit scale",
      "text": "For this course, use Unit Scale 0.001: one Blender unit represents one millimeter. This is a course convention, not the only valid printing workflow. Changing Unit Scale changes the interpretation of existing geometry, so set it before modeling.",
      "task": "Double-click Unit Scale, type `0` `.` `0` `0` `1`, then press `Enter`.",
      "done": "Unit Scale is 0.001. A default two-unit cube now represents 2 millimeters on each side.",
      "simulation": {
        "asset": "cube",
        "action": "field",
        "setting": "unitScale",
        "label": "Unit Scale",
        "box": [
          2180,
          693,
          190,
          29
        ],
        "value": 0.001,
        "initial": 1
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often.",
      "keys": [
        "0",
        ".",
        "0",
        "0",
        "1",
        "Enter"
      ],
      "inputHint": "Double-click the field, type the value, then Enter. Escape restores the checkpoint."
    },
    {
      "id": "length",
      "title": "Display lengths in millimeters",
      "text": "Length controls how distances are displayed. Set it to Millimeters so dimensions and viewport clipping distances use the same unit as the tray project.",
      "task": "Open Length and choose Millimeters.",
      "done": "Distances are displayed in millimeters. This does not resize the mesh.",
      "simulation": {
        "asset": "cube",
        "action": "setup-choice",
        "label": "Length",
        "box": [
          2180,
          794,
          190,
          29
        ],
        "menu": "setup-length-menu",
        "choice": "Millimeters",
        "choiceBox": [
          2180,
          951,
          190,
          30
        ]
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often."
    },
    {
      "id": "sidebar",
      "title": "Open the viewport Sidebar",
      "text": "Viewport settings are separate from scene settings. Open the Sidebar inside the 3D Viewport. You can use the View menu or the N shortcut learned in Meet Blender.",
      "task": "Choose View → Sidebar, or focus the viewport and press `N`.",
      "done": "The Sidebar is open. Its Item tab shows the cube dimensions; the View tab contains clipping settings.",
      "simulation": {
        "asset": "cube",
        "action": "sidebar"
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often.",
      "keys": [
        "N"
      ],
      "inputHint": "Use View → Sidebar or click the viewport and press N."
    },
    {
      "id": "view",
      "title": "Find the View tab",
      "text": "The Sidebar has vertical tabs on its right edge. Choose View to find the viewport lens and clipping distances. Leave Focal Length at 50 millimeters for this course.",
      "task": "Click the Sidebar’s View tab.",
      "done": "Clip Start and End define the nearest and farthest surfaces the viewport can display. They do not cut or resize your model.",
      "simulation": {
        "asset": "cube",
        "action": "setup-click",
        "label": "Sidebar View tab",
        "box": [
          1938,
          249,
          28,
          58
        ]
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often."
    },
    {
      "id": "clip-start",
      "title": "Set the near clipping distance",
      "text": "Clip Start hides surfaces closer to the viewpoint than this distance. If a close-up seems sliced open, reduce this value. Use 0.1 millimeters for this course, and reduce it further only when the detail needs it.",
      "task": "Double-click Clip Start, enter `0` `.` `1`, then press `Enter`.",
      "done": "The near clipping distance is 0.1 millimeters. This is a viewport setting; a render camera has separate clipping controls.",
      "simulation": {
        "asset": "cube",
        "action": "field",
        "setting": "clipStart",
        "label": "Clip Start",
        "box": [
          1717,
          192,
          198,
          28
        ],
        "value": 0.1,
        "initial": 0.01
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often.",
      "keys": [
        "0",
        ".",
        "1",
        "Enter"
      ],
      "inputHint": "Double-click the field, type the value, then Enter. Escape restores the checkpoint."
    },
    {
      "id": "clip-end",
      "title": "Set the far clipping distance",
      "text": "End hides surfaces beyond the far clipping distance. Use 10000 millimeters, or 10 meters, for this course workspace. Avoid making the range unnecessarily enormous: an extreme range can reduce depth precision.",
      "task": "Double-click End, enter `1` `0` `0` `0` `0`, then press `Enter`.",
      "done": "The viewport range is now 0.1 to 10000 millimeters. These settings affect this 3D Viewport, not every editor in every Blender file.",
      "simulation": {
        "asset": "cube",
        "action": "field",
        "setting": "clipEnd",
        "label": "Clip End",
        "box": [
          1717,
          223,
          198,
          28
        ],
        "value": 10000,
        "initial": 1000
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often.",
      "keys": [
        "1",
        "0",
        "0",
        "0",
        "0",
        "Enter"
      ],
      "inputHint": "Double-click the field, type the value, then Enter. Escape restores the checkpoint."
    },
    {
      "id": "startup",
      "title": "Save a startup configuration",
      "text": "A startup file stores the current scene and workspace, including scene units and this viewport’s settings. Save it before building the tray, so future new files do not start with your finished model. Our practice scene still contains the default Cube, Camera, and Light.",
      "task": "Choose File → Defaults → Save Startup File.",
      "done": "Blender asks before replacing the startup file. Saving a startup file is different from saving a named project with Save As.",
      "simulation": {
        "asset": "cube",
        "action": "setup-startup"
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often."
    },
    {
      "id": "confirm",
      "title": "Confirm the startup file",
      "text": "In real Blender, this replaces your previous startup scene. In this simulation, only the practice checkpoint changes. If you want to keep a customized startup in real Blender, save a separate scene template instead.",
      "task": "Click Overwrite to save this simulated startup configuration.",
      "done": "Your setup is saved. In real Blender, test File → New → General after saving any current work. Check Metric, 0.001, Millimeters, and the View tab’s clipping values.",
      "simulation": {
        "asset": "cube",
        "action": "setup-confirm"
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often."
    },
    {
      "id": "complete",
      "title": "Your printing workspace is ready",
      "text": "You configured scene units, viewport clipping, and a startup file. The downloadable setup scene is an optional recovery point. Open a new file in real Blender and verify the settings, then continue to the tray lessons.",
      "task": "Keep Blender open and save each project under its own name.",
      "done": "Always check the exported model’s dimensions in your slicer. A startup file does not control every exporter’s scale.",
      "simulation": {
        "asset": "cube",
        "action": "free"
      },
      "chapter": "BLENDER / PRINTING SETUP",
      "controlStatus": "Configure each setting yourself · Blender 5.2 reference",
      "follow": "Follow these steps in a new real Blender scene. Save any current work before starting. Save named project files often.",
      "terminal": true
    }
  ]
};
