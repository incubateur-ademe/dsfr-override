import{a as s,t as D}from"./toggle-arg-types-CUsuSqts.js";import{a as A,f as p}from"./form-arg-types-BB7YawXK.js";import{u as t}from"./renderer-BO3bJSWJ.js";import{r as x}from"./fieldset-BA-83frp.js";import"./_commonjsHelpers-Cpj98o6Y.js";const $={id:{control:"text",description:"Attribut id du fieldset",type:{value:"string",required:!0},table:{category:"attributes"}},legend:{...A.legend,description:"Légende de l’ensemble des interrupteurs"},border:{...s.border},state:{...s.state},status:{...s.status},errorMessage:{...s.errorMessage},validMessage:{...s.validMessage}},g=(e=t("toggle"),i=3)=>{const o=[];for(let r=1;r<=i;r++)o.push({id:`${e}-${r}`,label:`${D.label} ${r}`,checked:r===1,disabled:!1,hint:void 0});return o},l={legend:"Légende pour l'ensemble des éléments",border:!1,state:!1,status:"default",errorMessage:"Texte d’erreur",validMessage:"Texte de succès",elements:g(),id:"toggle-group-id"},h=e=>{const i=[{type:"toggle",data:{toggles:e.elements||l.elements}}],o={id:e.id||void 0,legend:e.legend||l.legend,status:e.status||l.status,error:e.status==="error"?e.errorMessage||p.errorMessage:void 0,valid:e.status==="valid"?e.validMessage||p.validMessage:void 0,elements:i};for(const r of o.elements[0].data.toggles)r.border=e.border,r.state=e.state;return o},_=e=>x({fieldset:h(e)}),O={id:"toggle-group",title:"DSFR/Component/Toggle/Toggle-Group",render:_,argTypes:$,args:l},a={tags:["!autodocs"],args:{id:t("toggle-group-id"),elements:g(t("toggle"))}},d={tags:["autodocs","!dev"],args:{id:t("toggle-group-id"),elements:g(t("toggle"))}},n={tags:["autodocs","!dev"],args:{id:t("toggle-group-id"),elements:g(t("toggle")),state:!0}},u={tags:["autodocs","!dev"],args:{id:t("toggle-group-id"),elements:g(t("toggle")),border:!0}};var c,m,f;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {
    id: uniqueId('toggle-group-id'),
    elements: getTogglesData(uniqueId('toggle'))
  }
}`,...(f=(m=a.parameters)==null?void 0:m.docs)==null?void 0:f.source}}};var b,y,S;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('toggle-group-id'),
    elements: getTogglesData(uniqueId('toggle'))
  }
}`,...(S=(y=d.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var T,v,G;n.parameters={...n.parameters,docs:{...(T=n.parameters)==null?void 0:T.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('toggle-group-id'),
    elements: getTogglesData(uniqueId('toggle')),
    state: true
  }
}`,...(G=(v=n.parameters)==null?void 0:v.docs)==null?void 0:G.source}}};var q,M,I;u.parameters={...u.parameters,docs:{...(q=u.parameters)==null?void 0:q.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('toggle-group-id'),
    elements: getTogglesData(uniqueId('toggle')),
    border: true
  }
}`,...(I=(M=u.parameters)==null?void 0:M.docs)==null?void 0:I.source}}};const P=["ToggleGroupStory","DefaultGroupStory","StateGroupStory","borderGroupStory"];export{d as DefaultGroupStory,n as StateGroupStory,a as ToggleGroupStory,P as __namedExportsOrder,u as borderGroupStory,O as default};
