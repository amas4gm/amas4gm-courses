import lesson from './lesson.js?v=bevel-handoff-1';
import {startTutorial} from '../../shared/teaching/engine.js?v=bevel-handoff-1';
import {createBambuSimulator} from '../../simulators/bambu-studio/simulator.js?v=usability-2';
startTutorial({lesson,createSimulator:createBambuSimulator,root:document.querySelector('#app')});
