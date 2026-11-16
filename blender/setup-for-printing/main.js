import lesson from './lesson.js?v=sidebar-3';
import {startTutorial} from '../../shared/teaching/engine.js?v=sidebar-3';
import {createBlenderSimulator} from '../../simulators/blender/native-simulator.js?v=sidebar-3';
startTutorial({lesson,createSimulator:createBlenderSimulator,root:document.querySelector('#app')});
