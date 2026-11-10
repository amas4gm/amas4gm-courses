import lesson from './lesson.js?v=bevel-handoff-1';
import {startTutorial} from '../../shared/teaching/engine.js?v=bevel-handoff-1';
import {createBlenderCourseSimulator} from '../../simulators/blender/course-simulator.js?v=bevel-handoff-1';
startTutorial({lesson,createSimulator:createBlenderCourseSimulator,root:document.querySelector('#app')});
