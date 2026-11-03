import {NextResponse} from 'next/server';
import {requireMember} from '../../../../../server/session';
import {AppError,errorResponse} from '../../../../../server/errors';
import {getMongo} from '../../../../../server/db';
import {configureCloudinary,ownedProject,projectId} from '../../../../../server/workspace';
export const runtime='nodejs';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await requireMember(request.headers),{id}=await params;
 const asset=await getMongo().db.collection('assets').findOne({_id:projectId(id),ownerId:user.id,kind:'video',status:'ready'});
 if(!asset||asset.cloudinary?.deliveryType!=='authenticated'||!asset.cloudinary?.publicId)throw new AppError(404,'NOT_FOUND','Video not found.');
 await ownedProject(user.id,asset.projectId.toHexString());
 const url=configureCloudinary().utils.private_download_url(asset.cloudinary.publicId,'mp4',{resource_type:'video',type:'authenticated',expires_at:Math.floor(Date.now()/1000)+120,attachment:new URL(request.url).searchParams.get('download')==='1'});
 return NextResponse.redirect(url,{status:307,headers:{'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
}catch(error){return errorResponse(error);}}
