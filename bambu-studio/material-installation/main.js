import lesson from './lesson.js?v=usability-2';
import {startTutorial} from '../../shared/teaching/engine.js?v=usability-2';
import {createLabSimulator} from '../../simulators/bambu-lab/simulator.js?v=usability-2';
startTutorial({lesson,createSimulator:createLabSimulator,root:document.querySelector('#app')});
