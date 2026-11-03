import {config} from 'dotenv';
import {MongoClient} from 'mongodb';
config({path:'.env.local',quiet:true} as Parameters<typeof config>[0]);
if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is missing.');
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
  await client.connect();
  const db=client.db(process.env.MONGODB_DB||'sochitra');
  await db.collection('user').createIndex({email:1},{unique:true});
  await db.collection('session').createIndex({token:1},{unique:true});
  await db.collection('session').createIndex({userId:1});
  await db.collection('account').createIndex({providerId:1,accountId:1},{unique:true});
  await db.collection('verification').createIndex({identifier:1});
  await db.collection('projects').createIndex({ownerId:1,requestKey:1},{unique:true,partialFilterExpression:{requestKey:{$type:'string'}}});
  await db.collection('projects').createIndex({ownerId:1,updatedAt:-1,_id:-1});
  console.log('Authentication and project indexes are ready. No user data was displayed.');
}catch(error){
  console.error(`Database initialization failed (${error instanceof Error?error.name:'unknown error'}). Check Atlas access and credentials; no credentials were logged.`);
  process.exitCode=1;
}finally{await client.close();}
