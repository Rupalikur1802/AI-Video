'use client';
import Link from 'next/link';
import type {ReactNode} from 'react';
import {ChevronsLeft,ChevronsRight,FolderOpen,LayoutDashboard,LogOut,Settings,Unplug,Video,X} from 'lucide-react';

export type StudioNavigation='Dashboard'|'Create video'|'My projects'|'Connections'|'Account';
const items=[{name:'Dashboard',icon:LayoutDashboard},{name:'Create video',icon:Video},{name:'My projects',icon:FolderOpen},{name:'Connections',icon:Unplug}] as const;

export function StudioSidebar({user,preview=false,active,collapsed,mobileOpen,onCollapse,onClose,onNavigate,onSignOut}:{
 user:{name:string;email:string};preview?:boolean;active:string;collapsed:boolean;mobileOpen:boolean;
 onCollapse:()=>void;onClose:()=>void;onNavigate:(name:StudioNavigation)=>void;onSignOut:()=>void;
}){
 const initials=user.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
 return <>
  {mobileOpen&&<button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose}/>}
  <aside className={`studio-sidebar ${mobileOpen?'is-open':''}`} aria-label="Studio navigation">
   <div className="sidebar-heading"><Link href="/" className="studio-brand"><img src="/icon.svg" width="34" height="34" alt=""/><span>Sochitra</span></Link><button className="icon-button collapse-sidebar" aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} onClick={onCollapse}>{collapsed?<ChevronsRight size={19}/>:<ChevronsLeft size={19}/>}</button><button className="icon-button close-sidebar" aria-label="Close navigation" onClick={onClose}><X size={20}/></button></div>
   <p className="sidebar-label">Studio</p><nav aria-label="Studio">{items.map(({name,icon:Icon})=><button key={name} className={`sidebar-link ${active===name?'active':''}`} aria-current={active===name?'page':undefined} onClick={()=>onNavigate(name)} title={collapsed?name:undefined}><Icon size={20}/><span>{name}</span></button>)}</nav>
   <div className="sidebar-bottom"><p className="sidebar-label">Settings</p><button className="sidebar-link" onClick={()=>onNavigate('Account')}><Settings size={20}/><span>Account</span></button><div className="sidebar-profile"><span className="avatar">{initials}</span><div><strong>{user.name}</strong><span>{preview?'Design preview':'Team member'}</span></div><button className="icon-button" aria-label={preview?'Leave design preview':'Sign out'} onClick={onSignOut}><LogOut size={17}/></button></div></div>
  </aside>
 </>;
}

export function StudioTopbar({children}:{children:ReactNode}){return <header className="studio-topbar">{children}</header>;}
