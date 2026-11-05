import type {Story, StoryChapter} from '../../../lib/stories/types';
import evidence from './stories.json';

// Local narrative review. Source history stays in stories.json and sources.json.
export const journeyPath = '/design-preview/gcontext-journey';
export const articlePath = (id: string) => `/design-preview/gcontext-article?story=${encodeURIComponent(id)}`;
type Step = {id:string;part:number;date:string;short:string;title:string;preview:string;icon:StoryChapter['icon'];stage:NonNullable<StoryChapter['visual']>['exampleStage']};
const steps: Step[] = [
  {id:'project-knowledge',part:1,date:'2026-03',short:'Give the agent a place to look',title:'Making project knowledge available to AI agents',icon:'files',stage:'find',
    preview:'A workspace brought project files and service instructions within reach. The agent could consult existing knowledge, but each task needed only part of the collection.'},
  {id:'context-modules',part:1,date:'2026-04',short:'Load the relevant instructions',title:'Loading the instructions an AI task needs',icon:'files',stage:'select',
    preview:'Selectable modules supplied the instructions for a task. That established its starting context, but what happened when the task revealed that an instruction was outdated?'},
  {id:'living-context',part:2,date:'2026-05',short:'Keep the useful correction',title:'Keeping useful findings after an AI session',icon:'save',stage:'keep',
    preview:'Task records and folder rules explored what to retain after work. Saving another note could preserve a correction while leaving the old instruction in place. Some findings needed to change existing knowledge.'},
  {id:'update-methods',part:2,date:'2026-10',short:'Update the existing guide',title:'Updating project knowledge without damaging its documents',icon:'files',stage:'update',
    preview:'Different methods searched for related passages and proposed edits. Some edits included the right fact but damaged the document. The change needed review, not just a passing check.'},
  {id:'reviewed-handbook',part:3,date:'2026-10',short:'Review before saving',title:'Reviewing changes before they enter a project handbook',icon:'save',stage:'review',
    preview:'The handbook flow applies project rules and prepares changes for a person to review. Accepted changes become available to later sessions. That still leaves one question: do they help?'},
  {id:'read-evaluation',part:3,date:'2026-11',short:'Check the next task',title:'Testing whether saved context helps an agent answer',icon:'question',stage:'reuse',
    preview:'A trial compared the same questions with different context. Saved knowledge sometimes shortened the search, but also added reading and contained a stale fact. Its value depended on the task.'},
];
const branches = [
  {id:'file-apps',parent:'project-knowledge',short:'Apps and agents sharing the same files',preview:'A task-board prototype used Markdown files as shared state for people and agents.',icon:'files',visual:'g-board'},
  {id:'existing-agents',parent:'context-modules',short:'Connecting other AI clients',preview:'CLI and MCP connections made context available outside the original web app.',icon:'chat',visual:'g-connect'},
  {id:'state-manager',parent:'context-modules',short:'Separating saved context from the agent runtime',preview:'The framework separated saved knowledge from the software that runs a conversation and its tools.',icon:'files',visual:'g-state'},
  {id:'reusable-workflows',parent:'living-context',short:'Reusing procedures across projects',preview:'Browser procedures and project workflows tested what could remain useful across repeated runs.',icon:'save',visual:'g-workflow'},
  {id:'folder-rules',parent:'living-context',short:'Defining what belongs in each folder',preview:'Folder rules explored where new information belongs and when it should change existing files.',icon:'tree',visual:'context-map'},
  {id:'structure-tests',parent:'update-methods',short:'Testing structure with real conversations',preview:'Conversation replays exposed fragmented notes and duplicates that small examples missed.',icon:'question',visual:'g-replay'},
] as const;

export const gcontextArticles: Array<StoryChapter & {main:boolean;returnTo:string}> = [
  ...steps.map(step=>({
    id:step.id,part:step.part,date:step.date,short:step.short,title:step.title,
    preview:step.preview,simple:[step.preview],learned:'',icon:step.icon,
    visual:{kind:'instruction-example',label:'Illustrative export-guide example',exampleStage:step.stage},
    latest:step.id==='read-evaluation',main:true,returnTo:step.id,
    article:{title:step.title,href:articlePath(step.id)},
    branches:branches.filter(branch=>branch.parent===step.id).map(branch=>({title:branch.short,href:articlePath(branch.id)})),
  })),
  ...branches.map(branch=>{
    const source=evidence.stories.find(s=>s.id===branch.id);
    const parent=steps.find(s=>s.id===branch.parent);
    if(!source||!parent)throw new Error(`Missing branch source: ${branch.id}`);
    return {id:branch.id,part:parent.part,date:parent.date,short:branch.short,title:source.title,
      preview:branch.preview,simple:[branch.preview],learned:'',icon:branch.icon,
      visual:{kind:branch.visual,label:branch.short},main:false,returnTo:branch.parent,
      article:{title:source.title,href:articlePath(branch.id)}};
  }),
];

export const gcontextJourney: Story = {
  slug:'gcontext',name:'gcontext',
  mission:'How can useful knowledge from one task remain reliable for the next?',
  context:'An exploration of finding, updating, and reusing project knowledge across AI sessions.',
  overview:{
    title:'Keeping project knowledge useful across AI sessions',role:'Personal project',transition:'',
    introduction:'gcontext gives AI agents access to project knowledge and a way to keep it current. A correction found during one task should help the next task too.',
  },
  parts:[
    {id:1,name:'Finding knowledge',mission:'Where should the agent look?',from:'2026-03',to:'2026-04',status:'done',
      introduction:'The first workspace made project knowledge accessible. The next step was choosing what each task needed.'},
    {id:2,name:'Updating knowledge',mission:'What should change after a task?',from:'2026-05',to:'2026-10',status:'done',
      introduction:'A task could reveal that the saved instructions were wrong. Keeping the correction meant deciding what to retain and what to replace.'},
    {id:3,name:'Using it again',mission:'Does the saved change help later work?',from:'2026-10',to:null,status:'ongoing',
      introduction:'A reviewed change could reach the next session. Its usefulness still depended on whether the agent found current, relevant information.'},
  ],
  chapters:gcontextArticles.filter(article=>article.main),
};
