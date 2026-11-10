import lesson from './lesson.js?v=input-5';
import {startTutorial} from '../../shared/teaching/engine.js?v=narration-1';
import {createBlenderSimulator} from '../../simulators/blender/native-simulator.js?v=mouse-demo-1';
startTutorial({lesson,createSimulator:createBlenderSimulator,root:document.querySelector('#app')});
