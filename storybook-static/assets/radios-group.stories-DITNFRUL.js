import{a as o,p as fe}from"./radio-arg-types-Cd9JILZn.js";import{f as t,a as b}from"./form-arg-types-BB7YawXK.js";import{u as T}from"./renderer-BO3bJSWJ.js";import{r as De}from"./fieldset-BA-83frp.js";import"./_commonjsHelpers-Cpj98o6Y.js";const be={status:{control:{type:"select",labels:{default:"Défaut",valid:"Succès",error:"Erreur"}},description:"Statut du message",options:["default","valid","error"],type:{value:"string"},table:{category:"message"}},errorMessage:{if:{arg:"status",eq:"error"},control:"text",description:"Texte du message d'erreur",type:{value:"string"},table:{category:"message"}},validMessage:{if:{arg:"status",eq:"valid"},control:"text",description:"Texte du message de succès",type:{value:"string"},table:{category:"message"}}},Te={id:{...b.id,type:{value:"string",required:!0}},legend:{...b.legend,description:"Légende de l’ensemble des radios"},hint:{...o.hint,description:"Texte additionnel sous la légende"},size:{if:{arg:"rich",eq:!1},...o.size,description:"Taille des radios"},rich:{...o.rich},hasPictogram:{...fe.hasPictogram},inline:{...b.inline},disabled:{...o.disabled,description:"Désactive l’ensemble des radios"},...be},s=(e=3,a=!1)=>{const r=[],x=T("radios-group-name");for(let D=1;D<=e;D++)r.push({label:`Radio ${D}`,id:T("radio"),name:x,hint:a?"Texte additionnel":"",disabled:!1,rich:!1,pictogramName:"city-hall",pictogramAccent:"défaut"});return r},Re={legend:"Légende pour l’ensemble des éléments",hint:t.hint,size:"md",disabled:t.disabled,rich:!1,hasPictogram:!0,inline:t.inline,status:"default",errorMessage:"Texte d’erreur",validMessage:"Texte de succès",elements:s(),id:t.id},xe=e=>{const a={id:e.id||T("radios-form"),legend:e.legend,disabled:e.disabled,hint:e.hint,rich:e.rich||Re.rich,inline:e.inline,choice:!0,status:e.status||t.status,error:e.status==="error"?e.errorMessage||t.errorMessage:void 0,valid:e.status==="valid"?e.validMessage||t.validMessage:void 0,elements:e.elements.map(r=>({type:"radio",inline:e.inline,data:{label:r.label,size:e.size,id:r.id,name:r.name,hint:r.hint,disabled:r.disabled,rich:e.rich}}))};for(let r=0;r<a.elements.length;r++)a.rich&&e.hasPictogram?a.elements[r].data.pictogram={name:e.elements[r].pictogramName||"city-hall",accent:e.elements[r].pictogramAccent||"défaut"}:a.elements[r].pictogram=void 0;return a},ze=e=>De({fieldset:xe(e)}),Ne={id:"radios-group",title:"DSFR/Component/Radio/Radios-Group",render:ze,argTypes:Te,args:Re},n={tags:["!autodocs"],args:{}},i={tags:["autodocs","!dev"],args:{elements:s()}},d={tags:["autodocs","!dev"],args:{hint:"Texte de description additionnel",elements:s()}},c={tags:["autodocs","!dev"],args:{elements:s(3,!0)}},u={tags:["autodocs","!dev"],args:{disabled:!0,elements:s()}},l={tags:["autodocs","!dev"],args:{status:"valid",elements:s()}},m={tags:["autodocs","!dev"],args:{status:"error",elements:s()}},p={tags:["autodocs","!dev"],args:{size:"md",elements:s()}},g={tags:["autodocs","!dev"],args:{size:"sm",elements:s()}},h={tags:["autodocs","!dev"],args:{inline:!0,elements:s()}},S={tags:["autodocs","!dev"],args:{rich:!0,elements:s()}},y={tags:["autodocs","!dev"],args:{rich:!0,hint:"Texte de description additionnel",elements:s()}},v={tags:["autodocs","!dev"],args:{rich:!0,inline:!0,elements:s()}},G={tags:["autodocs","!dev"],args:{rich:!0,inline:!0,hint:"Texte de description additionnel",elements:s()}},R={tags:["autodocs","!dev"],args:{rich:!0,hasPictogram:!1,elements:s()}},f={tags:["autodocs","!dev"],args:{rich:!0,hasPictogram:!1,inline:!0,elements:s()}};var z,I,M;n.parameters={...n.parameters,docs:{...(z=n.parameters)==null?void 0:z.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(M=(I=n.parameters)==null?void 0:I.docs)==null?void 0:M.source}}};var P,A,H;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    elements: getRadiosGroupData()
  }
}`,...(H=(A=i.parameters)==null?void 0:A.docs)==null?void 0:H.source}}};var N,q,E;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hint: 'Texte de description additionnel',
    elements: getRadiosGroupData()
  }
}`,...(E=(q=d.parameters)==null?void 0:q.docs)==null?void 0:E.source}}};var _,F,L;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    elements: getRadiosGroupData(3, true)
  }
}`,...(L=(F=c.parameters)==null?void 0:F.docs)==null?void 0:L.source}}};var V,C,O;u.parameters={...u.parameters,docs:{...(V=u.parameters)==null?void 0:V.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    disabled: true,
    elements: getRadiosGroupData()
  }
}`,...(O=(C=u.parameters)==null?void 0:C.docs)==null?void 0:O.source}}};var $,j,k;l.parameters={...l.parameters,docs:{...($=l.parameters)==null?void 0:$.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    status: 'valid',
    elements: getRadiosGroupData()
  }
}`,...(k=(j=l.parameters)==null?void 0:j.docs)==null?void 0:k.source}}};var w,B,J;m.parameters={...m.parameters,docs:{...(w=m.parameters)==null?void 0:w.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    status: 'error',
    elements: getRadiosGroupData()
  }
}`,...(J=(B=m.parameters)==null?void 0:B.docs)==null?void 0:J.source}}};var K,Q,U;p.parameters={...p.parameters,docs:{...(K=p.parameters)==null?void 0:K.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'md',
    elements: getRadiosGroupData()
  }
}`,...(U=(Q=p.parameters)==null?void 0:Q.docs)==null?void 0:U.source}}};var W,X,Y;g.parameters={...g.parameters,docs:{...(W=g.parameters)==null?void 0:W.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'sm',
    elements: getRadiosGroupData()
  }
}`,...(Y=(X=g.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,se;h.parameters={...h.parameters,docs:{...(Z=h.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    inline: true,
    elements: getRadiosGroupData()
  }
}`,...(se=(ee=h.parameters)==null?void 0:ee.docs)==null?void 0:se.source}}};var re,ae,te;S.parameters={...S.parameters,docs:{...(re=S.parameters)==null?void 0:re.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    rich: true,
    elements: getRadiosGroupData()
  }
}`,...(te=(ae=S.parameters)==null?void 0:ae.docs)==null?void 0:te.source}}};var oe,ne,ie;y.parameters={...y.parameters,docs:{...(oe=y.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    rich: true,
    hint: 'Texte de description additionnel',
    elements: getRadiosGroupData()
  }
}`,...(ie=(ne=y.parameters)==null?void 0:ne.docs)==null?void 0:ie.source}}};var de,ce,ue;v.parameters={...v.parameters,docs:{...(de=v.parameters)==null?void 0:de.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    rich: true,
    inline: true,
    elements: getRadiosGroupData()
  }
}`,...(ue=(ce=v.parameters)==null?void 0:ce.docs)==null?void 0:ue.source}}};var le,me,pe;G.parameters={...G.parameters,docs:{...(le=G.parameters)==null?void 0:le.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    rich: true,
    inline: true,
    hint: 'Texte de description additionnel',
    elements: getRadiosGroupData()
  }
}`,...(pe=(me=G.parameters)==null?void 0:me.docs)==null?void 0:pe.source}}};var ge,he,Se;R.parameters={...R.parameters,docs:{...(ge=R.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    rich: true,
    hasPictogram: false,
    elements: getRadiosGroupData()
  }
}`,...(Se=(he=R.parameters)==null?void 0:he.docs)==null?void 0:Se.source}}};var ye,ve,Ge;f.parameters={...f.parameters,docs:{...(ye=f.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    rich: true,
    hasPictogram: false,
    inline: true,
    elements: getRadiosGroupData()
  }
}`,...(Ge=(ve=f.parameters)==null?void 0:ve.docs)==null?void 0:Ge.source}}};const qe=["RadiosGroupStory","DefaultGroupStory","HintStory","HintGroupStory","DisabledStory","StatusValidStory","StatusErrorStory","SizeMDGroupStory","SizeSMGroupStory","InlineGroupStory","RadiosRichGroupStory","RadiosRichHintGroupStory","RadiosRichInlineGroupStory","RadiosRichInlineHintGroupStory","RadiosRichNoImageGroupStory","RadiosRichNoImageInlineGroupStory"];export{i as DefaultGroupStory,u as DisabledStory,c as HintGroupStory,d as HintStory,h as InlineGroupStory,n as RadiosGroupStory,S as RadiosRichGroupStory,y as RadiosRichHintGroupStory,v as RadiosRichInlineGroupStory,G as RadiosRichInlineHintGroupStory,R as RadiosRichNoImageGroupStory,f as RadiosRichNoImageInlineGroupStory,p as SizeMDGroupStory,g as SizeSMGroupStory,m as StatusErrorStory,l as StatusValidStory,qe as __namedExportsOrder,Ne as default};
