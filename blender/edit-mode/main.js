import lesson from './lesson.js?v=sidebar-3';
import {startTutorial} from '../../shared/teaching/engine.js?v=sidebar-3';
import {createBlenderCourseSimulator} from '../../simulators/blender/course-simulator.js?v=sidebar-3';
startTutorial({lesson,createSimulator:createBlenderCourseSimulator,root:document.querySelector('#app')});
