import type {ProjectView} from './projects';
// Illustrative, public design fixtures. Never loaded by authenticated project APIs.
export const demoProjects:ProjectView[]=[
  {id:'demo-light',title:'How Light Carries Information',language:'en',targetSeconds:60,durationSeconds:48,state:'ready',thumbnail:'/images/project-0.png',updatedAt:'2026-11-03T03:00:00Z',version:1,publication:{state:'published',account:'@example'}},
  {id:'demo-water',title:'The Water Cycle',language:'en',targetSeconds:90,durationSeconds:72,state:'ready',thumbnail:'/images/project-1.png',updatedAt:'2026-11-02T10:00:00Z',version:1,publication:{state:'scheduled',account:'@example',scheduledAt:'2026-11-05T11:00:00Z',timezone:'Asia/Kolkata'}},
  {id:'demo-process',title:'The Story Behind Our Process',language:'hi',targetSeconds:90,durationSeconds:65,state:'updating',thumbnail:'/images/project-2.png',previousReady:true,updatedAt:'2026-11-02T09:00:00Z',version:2,stage:'Preparing revised scenes'},
  {id:'demo-quantum',title:'Quantum Superposition Explained',language:'en',targetSeconds:60,state:'processing',updatedAt:'2026-11-02T08:00:00Z',version:1,stage:'Creating narration'},
  {id:'demo-photosynthesis',title:'Photosynthesis & Chloroplasts',language:'en',targetSeconds:60,state:'draft',updatedAt:'2026-10-31T08:00:00Z',version:1},
  {id:'demo-acoustic',title:'Acoustic Resonance in Architecture',language:'en',targetSeconds:60,state:'failed',error:'The generation request timed out. Your saved work is available.',updatedAt:'2026-10-30T08:00:00Z',version:1},
];
