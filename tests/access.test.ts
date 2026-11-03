import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isApprovedMember} from '../src/core/access';
import {createProjectSchema,renameProjectSchema} from '../src/core/projects';

test('approval fails closed without an allowlist or verified email',()=>{
  const user={email:'owner@example.com',emailVerified:true};
  assert.equal(isApprovedMember(user,undefined),false);
  assert.equal(isApprovedMember(user,''),false);
  assert.equal(isApprovedMember({...user,emailVerified:false},'owner@example.com'),false);
});
test('approval uses normalized exact matches, not substring or domain matches',()=>{
  assert.equal(isApprovedMember({email:' Owner@Example.com ',emailVerified:true},' other@example.com, owner@example.com '),true);
  for(const email of ['notowner@example.com','owner@example.com.attacker.test','owner+other@example.com'])assert.equal(isApprovedMember({email,emailVerified:true},'owner@example.com'),false);
});
test('removing approval denies an already known user',()=>{
  const user={email:'owner@example.com',emailVerified:true};
  assert.equal(isApprovedMember(user,'owner@example.com'),true);
  assert.equal(isApprovedMember(user,'other@example.com'),false);
});
test('project input rejects ownership injection and unsupported durations',()=>{
  assert.equal(createProjectSchema.safeParse({title:'Example',ownerId:'another-user'}).success,false);
  assert.equal(createProjectSchema.safeParse({title:'Example',targetSeconds:45}).success,false);
  assert.equal(createProjectSchema.safeParse({title:' '}).success,false);
  assert.equal(createProjectSchema.parse({title:'Example'}).language,'en');
});
test('rename requires a positive concurrency version',()=>{
  assert.equal(renameProjectSchema.safeParse({title:'Updated'}).success,false);
  assert.equal(renameProjectSchema.safeParse({title:'Updated',expectedVersion:0}).success,false);
  assert.equal(renameProjectSchema.safeParse({title:'Updated',expectedVersion:1}).success,true);
});
