import{e as y,u as f}from"./renderer-BO3bJSWJ.js";import{r as T}from"./button-DXzyz14T.js";import{r as v}from"./link-CddyzMJy.js";import"./_commonjsHelpers-Cpj98o6Y.js";const k=t=>y.render("tooltip",t),S={id:{control:"text",description:"Identifiant de l'infobulle",type:{value:"string",required:!0},table:{category:"attributes"}},content:{control:"text",description:"Contenu texte de l'infobulle"},type:{control:{type:"select",labels:{default:"Information contextuelle",infobulle:"Infobulle"}},description:"Types d'infobulle<br>Valeurs :<br>- Information contextuelle : Déclenchement au survol<br>- Infobulle : Déclenchement au clic",options:["default","infobulle"],type:{value:"string"},table:{category:"variant"}}},i={content:"lorem ipsum dolor sit amet consectetur adipiscing elit",type:"default",id:"tooltip"},I=t=>{const n=[];return t.type==="infobulle"&&n.push("fr-btn--tooltip"),{label:t.type==="infobulle"?"infobulle":"Information contextuelle",classes:n}},g=t=>({id:t.id||i.id,content:t.content||i.content}),x=t=>k({tooltip:g(t)}),L=t=>T({button:{...I(t),tooltip:g(t)}}),B=t=>v({link:{...t}}),C=t=>`
    ${B(h(t))}
    ${x(t)}
  `,h=t=>({label:"infobulle au survol",href:"#",attributes:{"aria-describedby":t.id}}),H={id:"tooltip",title:"DSFR/Component/Tooltip",render:L,argTypes:S,args:i},o={tags:["!autodocs"],args:{}},e={tags:["autodocs","!dev"],args:{id:f("tooltip"),type:"infobulle"}},r={tags:["autodocs","!dev"],args:{id:f("tooltip")},render:C};var s,l,a;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(a=(l=o.parameters)==null?void 0:l.docs)==null?void 0:a.source}}};var c,u,p;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('tooltip'),
    type: 'infobulle'
  }
}`,...(p=(u=e.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var d,m,b;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('tooltip')
  },
  render: renderLinkTooltip
}`,...(b=(m=r.parameters)==null?void 0:m.docs)==null?void 0:b.source}}};const P=["TooltipStory","TooltipClickButtonStory","TooltipHoverLinkStory"];export{e as TooltipClickButtonStory,r as TooltipHoverLinkStory,o as TooltipStory,P as __namedExportsOrder,H as default};
