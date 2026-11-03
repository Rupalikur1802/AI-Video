import 'server-only';
import {MongoClient} from 'mongodb';
let client:MongoClient|undefined;
export function getMongo(){
  if(!process.env.MONGODB_URI)throw new Error('MongoDB is not configured');
  client??=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:7000,maxPoolSize:10});
  return {client,db:client.db(process.env.MONGODB_DB||'sochitra')};
}
