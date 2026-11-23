import lesson from './lesson.js?v=blender-levels-2';
import {startTutorial} from '../../shared/teaching/engine.js?v=blender-levels-2';
import {createBlenderCourseSimulator} from '../../simulators/blender/course-simulator.js?v=mesh-tools-2';
startTutorial({lesson,createSimulator:createBlenderCourseSimulator,root:document.querySelector('#app')});
