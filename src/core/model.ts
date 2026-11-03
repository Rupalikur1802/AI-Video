import {z} from 'zod';

export const sceneSchema = z.object({
  kind: z.enum(['intro', 'evaporation', 'condensation', 'precipitation', 'collection']),
  title: z.string().min(1).max(70),
  narration: z.string().min(1).max(700),
  label: z.string().min(1).max(55),
  cuePhrase: z.string().min(1).max(120),
});
export const planSchema = z.object({
  language: z.enum(['en', 'hi']),
  title: z.string().min(1).max(90),
  scenes: z.array(sceneSchema).length(5),
}).superRefine((plan, ctx) => {
  const expected = ['intro', 'evaporation', 'condensation', 'precipitation', 'collection'];
  plan.scenes.forEach((scene, i) => {
    if (scene.kind !== expected[i]) ctx.addIssue({code: 'custom', message: 'Invalid scene order'});
    if (!scene.narration.includes(scene.cuePhrase)) ctx.addIssue({code: 'custom', message: 'Cue phrase must occur verbatim in narration'});
  });
});
export type Plan = z.infer<typeof planSchema>;
export type Language = Plan['language'];
export type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};
export type Caption = {text: string; start: number; end: number};
export type TimedScene = Plan['scenes'][number] & {
  startFrame: number;
  durationInFrames: number;
  audioSrc?: string;
  captions: Caption[];
  cueSeconds: number;
};
export type Video = {
  title: string;
  language: Language;
  fixture: boolean;
  fps: number;
  durationInFrames: number;
  scenes: TimedScene[];
};
