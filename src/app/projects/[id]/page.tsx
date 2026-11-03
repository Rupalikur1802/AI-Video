import {headers} from 'next/headers';
import {redirect,notFound} from 'next/navigation';
import {requireMember} from '../../../server/session';
import {AppError} from '../../../server/errors';
import {getWorkspace} from '../../../server/workspace';
import {Workspace} from '../../../components/workspace';
export const dynamic='force-dynamic';
export default async function ProjectPage({params}:{params:Promise<{id:string}>}){
  let user;try{user=await requireMember(await headers());}catch(error){redirect(error instanceof AppError&&error.code==='NOT_APPROVED'?'/login?state=unapproved':'/login');}
  const {id}=await params;let workspace;try{workspace=await getWorkspace(user.id,id);}catch(error){if(error instanceof AppError&&error.status===404)notFound();throw error;}
  return <Workspace initial={workspace} user={{name:user.name,email:user.email}}/>;
}
