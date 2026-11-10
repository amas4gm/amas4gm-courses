// Each entry is a course level containing tutorials. Follow-on courses get the next level.
// These first-level course and tutorial URLs remain stable for existing links and progress.
export const software=[{
 id:'bambu-studio',name:'BambuLab Level 1',category:'3D PRINTING',description:'Practice the slicer, then get familiar with the printers and material loading in the lab.',
 tutorials:[{id:'getting-started',title:'Meet Bambu Studio',description:'Explore the workspace. Import Benchy, then practice orbiting, panning, zooming, and choosing a camera view.',topics:['Workspace tour','3D navigation'],number:'01',steps:14},
 {id:'object-manipulation',title:'Move, scale, and orient models',description:'Select Benchy, position and resize it, rotate it precisely, and place its flat base on the plate.',topics:['Move & Scale','Rotate & Lay on face'],number:'02',steps:17},
 {id:'material-installation',title:'Choose a printer & load the AMS',description:'Choose Steve or Candus, unlock the AMS, seat a roll, and guide filament into the intake.',topics:['Physical devices','AMS material loading'],number:'03',steps:5},
 {id:'slicing-and-printing',title:'Slice, estimate & print Benchy',description:'Select Steve or Candus and the installed filament, inspect layers, compare supports, calculate your AMAS bill, and start a simulated print.',topics:['Layers & Supports','Cost & Printing'],number:'04',steps:14}]
},{
  "id": "blender",
  "name": "Blender Level 1",
  "category": "3D MODELING FOR PRINT",
  "description": "Build a useful desktop tray. Practice with focused Blender simulations, then follow along in the real application.",
  "tutorials": [
    {
      "id": "getting-started",
      "title": "Meet Blender",
      "description": "Find your way around the interface and practice navigation.",
      "topics": [
        "Interface & Objects",
        "Real Blender checkpoints"
      ],
      "number": "01",
      "steps": 14
    },
    {
      "id": "setup-for-printing",
      "title": "Setting up Blender for 3D printing",
      "description": "Choose scene units, set viewport clipping, and save your startup configuration.",
      "topics": [
        "Units & View settings",
        "Save Startup File"
      ],
      "number": "02",
      "steps": 11
    },
    {
      "id": "object-manipulation",
      "title": "Build a precise tray blank",
      "description": "Move, rotate, dimension, and save an object for printing.",
      "topics": [
        "Interface & Objects",
        "Real Blender checkpoints"
      ],
      "number": "03",
      "steps": 15
    },
    {
      "id": "edit-mode",
      "title": "Shape your first printable tray",
      "description": "Select edges, bevel a tray, and import your STL into Bambu Studio.",
      "topics": [
        "Mesh editing",
        "Real Blender checkpoints"
      ],
      "number": "04",
      "steps": 19
    }
  ]
}];
