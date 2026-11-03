import 'server-only';
const required=['MONGODB_URI','BETTER_AUTH_SECRET','BETTER_AUTH_URL','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','APPROVED_EMAILS'] as const;
export function missingAuthConfig(){return required.filter(key=>!process.env[key]?.trim());}
export function authConfigured(){return missingAuthConfig().length===0 && (process.env.BETTER_AUTH_SECRET?.length||0)>=32;}
