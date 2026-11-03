import 'server-only';
import {betterAuth} from 'better-auth';
import {mongodbAdapter} from '@better-auth/mongo-adapter';
import {APIError} from 'better-auth/api';
import {getMongo} from './db';
import {authConfigured} from './config';
import {isApprovedMember} from '../core/access';

function createAuth(){
  if(!authConfigured())throw new Error('Authentication configuration is incomplete');
  const {db,client}=getMongo();
  const approved=(user:{email:string;emailVerified:boolean})=>{
    if(!isApprovedMember(user,process.env.APPROVED_EMAILS))throw new APIError('FORBIDDEN',{message:'NOT_APPROVED'});
  };
  return betterAuth({
    appName:'Sochitra',secret:process.env.BETTER_AUTH_SECRET!,baseURL:process.env.BETTER_AUTH_URL!,
    database:mongodbAdapter(db,{client}),
    emailAndPassword:{enabled:false},
    socialProviders:{google:{clientId:process.env.GOOGLE_CLIENT_ID!,clientSecret:process.env.GOOGLE_CLIENT_SECRET!,prompt:'select_account'}},
    account:{accountLinking:{enabled:false},encryptOAuthTokens:true},
    session:{cookieCache:{enabled:false},expiresIn:60*60*24*7},
    onAPIError:{errorURL:'/login?state=error'},
    databaseHooks:{
      user:{create:{before:async user=>{approved(user);return {data:user};}},update:{before:async user=>{
        // No profile endpoint may replace a verified identity or remove verification.
        if(user.email!==undefined||user.emailVerified===false)throw new APIError('FORBIDDEN',{message:'Identity changes are disabled'});
        return {data:user};
      }}},
      session:{create:{before:async(session,context)=>{
        const user=await context?.context.internalAdapter.findUserById(session.userId);
        if(!user)throw new APIError('FORBIDDEN',{message:'NOT_APPROVED'});
        approved(user);return {data:session};
      }}},
    },
  });
}
let instance:ReturnType<typeof createAuth>|undefined;
export function getAuth(){instance??=createAuth();return instance;}
