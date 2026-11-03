import 'server-only';
export function generationUnavailableReason(){
 if(!process.env.ELEVENLABS_API_KEY||process.env.ELEVENLABS_USE_CONFIRMED!=='true')return 'Narration is not configured for this workspace.';
 if(!['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'].every(k=>process.env[k]))return 'Private video storage is not configured.';
 if(process.env.VERCEL){if(!['INNGEST_EVENT_KEY','INNGEST_SIGNING_KEY','VERCEL_TOKEN','VERCEL_PROJECT_ID','VERCEL_TEAM_ID'].every(k=>process.env[k]))return 'Hosted video generation is not configured yet. You can continue editing your script.';}
 else if(process.env.INNGEST_DEV!=='1'&&!process.env.INNGEST_EVENT_KEY)return 'The background video workflow is not configured yet. You can continue editing your script.';
 return undefined;
}
