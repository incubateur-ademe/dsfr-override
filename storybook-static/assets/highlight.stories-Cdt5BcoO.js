import{e as A}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const w=e=>A.render("highlight",e),H={accent:{control:{type:"select"},description:"Couleur d'accentuation",options:["défaut","green-tilleul-verveine","green-bourgeon","green-emeraude","green-menthe","green-archipel","blue-ecume","blue-cumulus","purple-glycine","pink-macaron","pink-tuile","yellow-tournesol","yellow-moutarde","orange-terre-battue","brown-cafe-creme","brown-caramel","brown-opera","beige-gris-galet"]}},T={text:{control:"text",description:"Contenu texte de la mise en exergue",type:{value:"string",required:!0}},id:{control:"text",description:"Attribut id de la mise en exergue",type:{value:"string"}},size:{control:{type:"select"},description:"Taille du texte de la mise en exergue",options:["sm","md","lg"]},...H},n={id:void 0,text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec libero ultricies aliquet",accent:void 0,size:"md"},C=e=>{const c={id:e.id||void 0,text:e.text||n.text};return e.size!=="md"&&(c.size=e.size||n.size),e.accent!=="défaut"&&(c.accent=e.accent||n.accent),c},D=e=>w({highlight:C(e)}),k={id:"highlight",title:"DSFR/Component/Highlight",render:D,argTypes:T,args:n},t={tags:["!autodocs"],args:{}},r={tags:["autodocs","!dev"],args:{}},s={tags:["autodocs","!dev"],args:{size:"sm"}},o={tags:["autodocs","!dev"],args:{size:"lg"}},a={tags:["autodocs","!dev"],args:{accent:"green-menthe"}};var i,g,d;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(d=(g=t.parameters)==null?void 0:g.docs)==null?void 0:d.source}}};var u,l,m;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {}
}`,...(m=(l=r.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var p,h,S;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'sm'
  }
}`,...(S=(h=s.parameters)==null?void 0:h.docs)==null?void 0:S.source}}};var y,x,z;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'lg'
  }
}`,...(z=(x=o.parameters)==null?void 0:x.docs)==null?void 0:z.source}}};var f,v,b;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    accent: 'green-menthe'
  }
}`,...(b=(v=a.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};const q=["HighlightStory","DefaultStory","SizeSmStory","SizeLgStory","AccentStory"];export{a as AccentStory,r as DefaultStory,t as HighlightStory,o as SizeLgStory,s as SizeSmStory,q as __namedExportsOrder,k as default};
