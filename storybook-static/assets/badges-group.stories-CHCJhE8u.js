import{b as a,a as b,d as y}from"./badge-arg-types-BggA2urd.js";import"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const f={size:{...b.size},groupMarkup:{control:{type:"select"},description:"Type de balise HTML pour la liste du groupe de badges",options:["div","ul"]}},m={size:a.size,groupMarkup:"ul",badges:[{label:`${a.label} 1`,accent:"green-tilleul-verveine",type:void 0,status:void 0,hasIcon:!1,hasNoIcon:!1,ellipsis:!1},{label:`${a.label} 2`,accent:"orange-terre-battue",type:void 0,status:void 0,hasIcon:!1,hasNoIcon:!1,ellipsis:!1},{label:`${a.label} 3`,accent:"blue-ecume",type:void 0,status:void 0,hasIcon:!1,hasNoIcon:!1,ellipsis:!1}]},S=e=>({size:e.size,groupMarkup:e.groupMarkup||m.groupMarkup,badges:e.badges}),z=e=>y({badgesGroup:S(e)}),I={id:"badges-group",title:"DSFR/Component/Badge/Badges-Group",render:z,argTypes:f,args:m},s={tags:["!autodocs"],args:{}},r={tags:["autodocs","!dev"],args:{size:"md",type1:"accent",accent1:"green-bourgeon",type2:"accent",accent2:"green-menthe",type3:"accent",accent3:"blue-ecume"}},t={tags:["autodocs","!dev"],args:{size:"sm",type1:"accent",accent1:"green-bourgeon",type2:"accent",accent2:"green-menthe",type3:"accent",accent3:"blue-ecume"}};var n,c,o;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(o=(c=s.parameters)==null?void 0:c.docs)==null?void 0:o.source}}};var u,p,d;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'md',
    type1: 'accent',
    accent1: 'green-bourgeon',
    type2: 'accent',
    accent2: 'green-menthe',
    type3: 'accent',
    accent3: 'blue-ecume'
  }
}`,...(d=(p=r.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var g,l,i;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'sm',
    type1: 'accent',
    accent1: 'green-bourgeon',
    type2: 'accent',
    accent2: 'green-menthe',
    type3: 'accent',
    accent3: 'blue-ecume'
  }
}`,...(i=(l=t.parameters)==null?void 0:l.docs)==null?void 0:i.source}}};const k=["BadgesGroupStory","SizeMdStory","SizeSmStory"];export{s as BadgesGroupStory,r as SizeMdStory,t as SizeSmStory,k as __namedExportsOrder,I as default};
