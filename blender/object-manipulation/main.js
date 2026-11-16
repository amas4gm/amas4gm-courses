import lesson from './lesson.js?v=outliner-rename-1';
import {startTutorial} from '../../shared/teaching/engine.js?v=outliner-rename-1';
import {createBlenderSimulator} from '../../simulators/blender/native-simulator.js?v=outliner-rename-1';
startTutorial({lesson,createSimulator:createBlenderSimulator,root:document.querySelector('#app')});
