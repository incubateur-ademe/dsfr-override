import{a}from"./checkbox-arg-types--jM97ZsI.js";import{f as o,a as h}from"./form-arg-types-BB7YawXK.js";import{u as U}from"./renderer-BO3bJSWJ.js";import{r as V}from"./fieldset-BA-83frp.js";import"./_commonjsHelpers-Cpj98o6Y.js";const W={id:{...h.id,type:{value:"string",required:!0}},legend:{...h.legend,description:"Légende de l’ensemble des checkboxes"},hint:{...a.hint,description:"Texte additionnel sous la légende"},size:{...a.size,description:"Taille des checkboxes"},inline:{...h.inline},disabled:{...a.disabled,description:"Désactive l’ensemble des checkboxes"},status:{...a.status},errorMessage:{...a.errorMessage},validMessage:{...a.validMessage}},s=(e=3,x=!1)=>{const r=[];for(let t=1;t<=e;t++)r.push({label:`Checkbox ${t}`,id:U("checkbox"),name:`checkbox${t}`,hint:x?"Texte additionnel":"",disabled:!1});return r},X={legend:"Légende pour l’ensemble des éléments",hint:o.hint,size:"md",disabled:o.disabled,inline:o.inline,status:"default",errorMessage:"Texte d’erreur",validMessage:"Texte de succès",checkboxes:s(),id:o.id},Y=e=>({id:e.id||U("checkbox-form"),legend:e.legend,disabled:e.disabled,hint:e.hint!==""?e.hint||o.hint:void 0,inline:e.inline,choice:!0,status:e.status||o.status,error:e.status==="error"?e.errorMessage||o.errorMessage:void 0,valid:e.status==="valid"?e.validMessage||o.validMessage:void 0,elements:e.checkboxes.map((r,t)=>({type:"checkbox",inline:e.inline,data:{label:r.label,size:e.size,id:r.id,name:r.name,hint:r.hint,disabled:r.disabled}}))}),Z=e=>V({fieldset:Y(e)}),ce={id:"checkboxes-group",title:"DSFR/Component/Checkbox/Checkboxes-Group",render:Z,argTypes:W,args:X},c={tags:["!autodocs"],args:{}},n={tags:["autodocs","!dev"],args:{}},d={tags:["autodocs","!dev"],args:{hint:"Texte de description additionnel",checkboxes:s()}},i={tags:["autodocs","!dev"],args:{checkboxes:s(3,!0)}},u={tags:["autodocs","!dev"],args:{inline:!0,checkboxes:s(2)}},l={tags:["autodocs","!dev"],args:{size:"md",checkboxes:s()}},p={tags:["autodocs","!dev"],args:{size:"sm",checkboxes:s()}},g={tags:["autodocs","!dev"],args:{checkboxes:s(),disabled:!0}},m={tags:["autodocs","!dev"],args:{status:"error",checkboxes:s()}},b={tags:["autodocs","!dev"],args:{status:"valid",checkboxes:s()}};var k,S,v;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(v=(S=c.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};var y,f,C;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {}
}`,...(C=(f=n.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};var D,z,G;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hint: 'Texte de description additionnel',
    checkboxes: getCheckboxesData()
  }
}`,...(G=(z=d.parameters)==null?void 0:z.docs)==null?void 0:G.source}}};var M,T,A;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    checkboxes: getCheckboxesData(3, true)
  }
}`,...(A=(T=i.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};var H,E,I;u.parameters={...u.parameters,docs:{...(H=u.parameters)==null?void 0:H.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    inline: true,
    checkboxes: getCheckboxesData(2)
  }
}`,...(I=(E=u.parameters)==null?void 0:E.docs)==null?void 0:I.source}}};var P,_,q;l.parameters={...l.parameters,docs:{...(P=l.parameters)==null?void 0:P.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'md',
    checkboxes: getCheckboxesData()
  }
}`,...(q=(_=l.parameters)==null?void 0:_.docs)==null?void 0:q.source}}};var F,L,$;p.parameters={...p.parameters,docs:{...(F=p.parameters)==null?void 0:F.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'sm',
    checkboxes: getCheckboxesData()
  }
}`,...($=(L=p.parameters)==null?void 0:L.docs)==null?void 0:$.source}}};var O,R,j;g.parameters={...g.parameters,docs:{...(O=g.parameters)==null?void 0:O.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    checkboxes: getCheckboxesData(),
    disabled: true
  }
}`,...(j=(R=g.parameters)==null?void 0:R.docs)==null?void 0:j.source}}};var w,B,J;m.parameters={...m.parameters,docs:{...(w=m.parameters)==null?void 0:w.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    status: 'error',
    checkboxes: getCheckboxesData()
  }
}`,...(J=(B=m.parameters)==null?void 0:B.docs)==null?void 0:J.source}}};var K,N,Q;b.parameters={...b.parameters,docs:{...(K=b.parameters)==null?void 0:K.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    status: 'valid',
    checkboxes: getCheckboxesData()
  }
}`,...(Q=(N=b.parameters)==null?void 0:N.docs)==null?void 0:Q.source}}};const ne=["CheckboxesGroupStory","DefaultGroupStory","HintStory","HintGroupStory","InlineStory","SizeMdStory","SizeSmStory","DisabledStory","ErrorStory","SuccessStory"];export{c as CheckboxesGroupStory,n as DefaultGroupStory,g as DisabledStory,m as ErrorStory,i as HintGroupStory,d as HintStory,u as InlineStory,l as SizeMdStory,p as SizeSmStory,b as SuccessStory,ne as __namedExportsOrder,ce as default};
