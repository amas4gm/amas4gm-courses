import lesson from './lesson.js?v=outliner-rename-1';
import {startTutorial} from '../../shared/teaching/engine.js?v=outliner-rename-1';
import {createBlenderCourseSimulator} from '../../simulators/blender/course-simulator.js?v=outliner-rename-1';
startTutorial({lesson,createSimulator:createBlenderCourseSimulator,root:document.querySelector('#app')});
