import 'server-only';
import {Inngest} from 'inngest';
export const inngest=new Inngest({id:'sochitra',isDev:!process.env.VERCEL&&process.env.INNGEST_DEV==='1'});
