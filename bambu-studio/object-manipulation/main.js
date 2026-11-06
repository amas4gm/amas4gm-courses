import lesson from './lesson.js?v=rotation-snaps-2';
import {startTutorial} from '../../shared/teaching/engine.js';
import {createBambuSimulator} from '../../simulators/bambu-studio/simulator.js?v=manipulation-3';
startTutorial({lesson,createSimulator:createBambuSimulator,root:document.querySelector('#app')});
