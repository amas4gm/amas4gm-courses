import lesson from './lesson.js?v=side-4';
import {startTutorial} from '../../shared/teaching/engine.js?v=completion-pause-2';
import {createBlenderSimulator} from '../../simulators/blender/native-simulator.js?v=side-4';
startTutorial({lesson,createSimulator:createBlenderSimulator,root:document.querySelector('#app')});
