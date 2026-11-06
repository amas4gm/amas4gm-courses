import lesson from './lesson.js?v=rotation-retry-1';
import {startTutorial} from '../../shared/teaching/engine.js?v=rotation-retry-1';
import {createBambuSimulator} from '../../simulators/bambu-studio/simulator.js?v=rotation-retry-1';
startTutorial({lesson,createSimulator:createBambuSimulator,root:document.querySelector('#app')});
