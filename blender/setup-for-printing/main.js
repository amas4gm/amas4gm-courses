import lesson from './lesson.js?v=input-sequence-1';
import {startTutorial} from '../../shared/teaching/engine.js?v=input-sequence-1';
import {createBlenderSimulator} from '../../simulators/blender/native-simulator.js?v=input-sequence-1';
startTutorial({lesson,createSimulator:createBlenderSimulator,root:document.querySelector('#app')});
