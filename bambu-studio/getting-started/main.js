import lesson from './lesson.js?v=usability-2';
import {startTutorial} from '../../shared/teaching/engine.js?v=usability-2';
import {createBambuSimulator} from '../../simulators/bambu-studio/simulator.js?v=usability-2';
startTutorial({lesson,createSimulator:createBambuSimulator,root:document.querySelector('#app')});
