import lesson from './lesson.js';
import {startTutorial} from '../../shared/teaching/engine.js?v=completion-pause-2';
import {createBlenderSimulator} from '../../simulators/blender/simulator.js';
startTutorial({lesson,createSimulator:createBlenderSimulator,root:document.querySelector('#app')});
