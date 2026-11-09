import lesson from './lesson.js?v=real-supports-1';
import {startTutorial} from '../../shared/teaching/engine.js?v=completion-pause-2';
import {createBambuSimulator} from '../../simulators/bambu-studio/simulator.js?v=real-supports-1';
startTutorial({lesson,createSimulator:createBambuSimulator,root:document.querySelector('#app')});
