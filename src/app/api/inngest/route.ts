import {serve} from 'inngest/next';
import {inngest} from '../../../server/inngest';
import {generateVideoWorkflow,recoverStalledVideos} from '../../../server/video-workflow';
export const runtime='nodejs';
export const maxDuration=300;
export const {GET,POST,PUT}=serve({client:inngest,functions:[generateVideoWorkflow,recoverStalledVideos]});
