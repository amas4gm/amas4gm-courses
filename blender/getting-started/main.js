import lesson from './lesson.js?v=live-3';
import {startTutorial} from '../../shared/teaching/engine.js?v=completion-pause-2';
import {createBlenderSimulator} from '../../simulators/blender/native-simulator.js?v=live-3';
startTutorial({lesson,createSimulator:createBlenderSimulator,root:document.querySelector('#app')});
