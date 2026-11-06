import lesson from './lesson.js?v=lab-copy-2';
import {startTutorial} from '../../shared/teaching/engine.js?v=rotation-retry-1';
import {createLabSimulator} from '../../simulators/bambu-lab/simulator.js?v=lab-1';
startTutorial({lesson,createSimulator:createLabSimulator,root:document.querySelector('#app')});
