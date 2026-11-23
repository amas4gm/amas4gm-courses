import lesson from './lesson.js?v=blender-levels-2';
import {startTutorial} from '../../shared/teaching/engine.js?v=blender-levels-2';
import {createBlenderSimulator} from '../../simulators/blender/native-simulator.js?v=blender-levels-2';
startTutorial({lesson,createSimulator:createBlenderSimulator,root:document.querySelector('#app')});
