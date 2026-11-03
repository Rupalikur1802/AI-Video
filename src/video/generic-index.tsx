import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {GenericExplainer} from './generic';
import type {GenericVideo} from '../core/composition';
const fallback:GenericVideo={title:'Sochitra',fps:30,durationInFrames:900,style:'minimal',captions:true,scenes:[]};
const Root=()=> <Composition id="Sochitra" component={GenericExplainer} width={1080} height={1920} fps={30} durationInFrames={900} defaultProps={{video:fallback}} calculateMetadata={({props})=>({durationInFrames:props.video.durationInFrames})}/>;
registerRoot(Root);
