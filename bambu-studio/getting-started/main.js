import lesson from './lesson.js';
import {startTutorial} from '../../shared/teaching/engine.js';
import {createBambuSimulator} from '../../simulators/bambu-studio/simulator.js';
startTutorial({lesson,createSimulator:createBambuSimulator,root:document.querySelector('#app')});
