import {getDocumentProxy} from 'unpdf';
import yauzl from 'yauzl';
import {XMLParser} from 'fast-xml-parser';
import {MAX_SOURCE_BYTES,MAX_SOURCE_CHARACTERS,MAX_SOURCE_UNITS,sourceKind,type SourceUnit} from '../core/workspace';

export class DocumentError extends Error{constructor(public code:string,message:string){super(message);}}
function normalize(text:string){return text.replace(/\u0000/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();}
export async function extractDocument(name:string,bytes:Buffer){
  if(!bytes.length||bytes.length>MAX_SOURCE_BYTES)throw new DocumentError('FILE_SIZE','Choose a nonempty file up to 4 MB.');
  let kind:ReturnType<typeof sourceKind>;
  try{kind=sourceKind(name);}catch{throw new DocumentError('UNSUPPORTED_FORMAT','Supported formats are PDF, PPTX, and TXT.');}
  const units:SourceUnit[]=[];const warnings:string[]=[];
  if(kind==='txt'){
    if(bytes.includes(0))throw new DocumentError('INVALID_TEXT','Upload a UTF-8 text file.');
    let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw new DocumentError('INVALID_TEXT','Save your notes as UTF-8 text and try again.');}
    units.push({id:'notes-1',label:'Notes',text:normalize(text)});
  }else if(kind==='pdf'){
    if(!bytes.subarray(0,1024).includes(Buffer.from('%PDF-')))throw new DocumentError('INVALID_PDF','This file is not a valid PDF.');
    let pdf;
    try{
      pdf=await getDocumentProxy(new Uint8Array(bytes));
      if(pdf.numPages>MAX_SOURCE_UNITS)throw new DocumentError('PAGE_LIMIT','Use a PDF with 60 pages or fewer.');
      let chars=0;
      for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
        const page=await pdf.getPage(pageNumber),content=await page.getTextContent();
        const text=normalize(content.items.map(item=>'str' in item?item.str+('hasEOL' in item&&item.hasEOL?'\n':' '):'').join(''));
        chars+=text.length;if(chars>MAX_SOURCE_CHARACTERS)throw new DocumentError('TEXT_LIMIT','This document has too much text. Upload a shorter section.');
        units.push({id:`page-${pageNumber}`,label:`Page ${pageNumber}`,text});page.cleanup();
      }
    }catch(error){if(error instanceof DocumentError)throw error;if(error instanceof Error&&/password/i.test(error.name+' '+error.message))throw new DocumentError('PASSWORD_PROTECTED','Remove PDF password protection and upload it again.');throw new DocumentError('EXTRACTION_FAILED','The PDF could not be read. Try exporting a new text-based PDF.');}
    finally{await pdf?.loadingTask.destroy();}
    if(units.some(u=>u.text.length<15))warnings.push('Some pages have little or no readable text. Scanned pages and image-only diagrams are not interpreted.');
  }else{
    if(bytes[0]!==0x50||bytes[1]!==0x4b)throw new DocumentError('INVALID_PPTX','This file is not a valid PPTX presentation.');
    const slides=await readSlides(bytes);
    const parser=new XMLParser({ignoreAttributes:true,removeNSPrefix:true,preserveOrder:true});
    for(const [number,xml] of slides){
      if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw new DocumentError('INVALID_PPTX','This presentation contains unsupported XML declarations.');
      const fragments:string[]=[];
      const walk=(value:unknown,insideText=false)=>{if(Array.isArray(value))for(const child of value)walk(child,insideText);else if(value&&typeof value==='object')for(const [key,child]of Object.entries(value)){if(key==='#text'&&insideText)fragments.push(String(child));else walk(child,key==='t');}};
      try{walk(parser.parse(xml));}catch{throw new DocumentError('INVALID_PPTX','The presentation contains unreadable slide content.');}
      units.push({id:`slide-${number}`,label:`Slide ${number}`,text:normalize(fragments.join(' '))});
    }
    warnings.push('Slide text is extracted. Images, diagrams, speaker notes, and original slide layouts are not reproduced.');
  }
  if(units.reduce((n,u)=>n+u.text.length,0)>MAX_SOURCE_CHARACTERS)throw new DocumentError('TEXT_LIMIT','Upload a shorter section of your material.');
  if(units.every(u=>u.text.length<15))throw new DocumentError('NO_TEXT','No useful text was found. Use a text-based PDF, PPTX with editable text, or TXT notes.');
  return {kind,units,warnings,count:units.length};
}
async function readSlides(bytes:Buffer):Promise<[number,string][]>{
  return new Promise((resolve,reject)=>{
    yauzl.fromBuffer(bytes,{lazyEntries:true,validateEntrySizes:true},(error,zip)=>{
      if(error||!zip){reject(new DocumentError('INVALID_PPTX','This presentation archive could not be opened.'));return;}
      const slides:[number,string][]=[];const numbers=new Set<number>();const manifests=new Map<string,string>();let total=0,entries=0,finished=false;
      const fail=(e:Error)=>{if(finished)return;finished=true;zip.close();reject(e);};
      zip.on('error',()=>fail(new DocumentError('INVALID_PPTX','The presentation archive is damaged.')));
      zip.on('entry',entry=>{
        total+=entry.uncompressedSize;entries++;
        if(total>25*1024*1024||entries>2500){fail(new DocumentError('ARCHIVE_LIMIT','This presentation is too complex. Export a smaller section.'));return;}
        const match=/^ppt\/slides\/slide(\d+)\.xml$/.exec(entry.fileName);
        const manifest=['ppt/presentation.xml','ppt/_rels/presentation.xml.rels'].includes(entry.fileName);
        if(!match&&!manifest){zip.readEntry();return;}
        const number=Number(match?.[1]);if(match){if(!Number.isSafeInteger(number)||number<1||numbers.has(number)){fail(new DocumentError('INVALID_PPTX','The presentation has invalid slide identifiers.'));return;}numbers.add(number);}
        if((!!match&&slides.length>=MAX_SOURCE_UNITS)||entry.uncompressedSize>2*1024*1024){fail(new DocumentError('SLIDE_LIMIT','Use a presentation with at most 60 slides and less complex slide content.'));return;}
        zip.openReadStream(entry,(err,stream)=>{
          if(err||!stream){fail(new DocumentError('INVALID_PPTX','A slide could not be read.'));return;}
          const chunks:Buffer[]=[];let size=0;
          stream.on('data',chunk=>{size+=chunk.length;if(size>2*1024*1024){stream.destroy();fail(new DocumentError('SLIDE_LIMIT','A slide is too large to process.'));return;}chunks.push(chunk);});
          stream.on('error',()=>fail(new DocumentError('INVALID_PPTX','A slide could not be read.')));
          stream.on('end',()=>{if(finished)return;const xml=Buffer.concat(chunks).toString('utf8');if(manifest)manifests.set(entry.fileName,xml);else slides.push([number,xml]);zip.readEntry();});
        });
      });
      zip.on('end',()=>{if(finished)return;finished=true;if(!slides.length){reject(new DocumentError('INVALID_PPTX','No presentation slides were found.'));return;}try{resolve(orderSlides(slides,manifests));}catch{reject(new DocumentError('INVALID_PPTX','The slide order in this presentation could not be read.'));}});
      zip.readEntry();
    });
  });
}
function orderSlides(slides:[number,string][],manifests:Map<string,string>){
  const document=manifests.get('ppt/presentation.xml'),relationships=manifests.get('ppt/_rels/presentation.xml.rels');
  if(!document&&!relationships)return slides.sort((a,b)=>a[0]-b[0]);
  if(!document||!relationships||/<!DOCTYPE|<!ENTITY/i.test(document+relationships))throw new Error('Invalid presentation manifest');
  const parser=new XMLParser({ignoreAttributes:false,parseAttributeValue:false});
  const child=(value:Record<string,unknown>,name:string)=>Object.entries(value).find(([k])=>k.split(':').at(-1)===name)?.[1] as Record<string,unknown>;
  const list=(v:unknown):Record<string,unknown>[]=>{const values=v===undefined?[]:Array.isArray(v)?v:[v];return values.map(value=>{if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid manifest element');return value as Record<string,unknown>;});};
  const presentation=child(parser.parse(document),'presentation'),ids=list(child(child(presentation,'sldIdLst'),'sldId'));
  const relations=list(child(child(parser.parse(relationships),'Relationships'),'Relationship'));
  const targets=new Map(relations.filter(r=>r['@_TargetMode']!=='External').map(r=>[r['@_Id'],r['@_Target']]));
  const byNumber=new Map(slides),seen=new Set<number>();
  const ordered=ids.map((id,index)=>{const relation=Object.entries(id).find(([key])=>/^@_[^:]+:id$/.test(key))?.[1],target=targets.get(relation);if(typeof target!=='string')throw new Error('Missing slide target');const match=/^(?:\/ppt\/)?slides\/slide(\d+)\.xml$/.exec(target);const number=Number(match?.[1]);const xml=byNumber.get(number);if(!xml||seen.has(number))throw new Error('Invalid slide target');seen.add(number);return [index+1,xml] as [number,string];});
  if(!ordered.length)throw new Error('No ordered slides');return ordered;
}
