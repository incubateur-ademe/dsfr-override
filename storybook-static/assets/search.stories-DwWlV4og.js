import{e as g}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const b=e=>g.render("search",e),m={buttonLabel:{control:"text",description:"Libellé du bouton",type:{value:"string",required:!0},table:{category:"button"}},buttonTitle:{control:"text",description:"Titre du bouton",type:{value:"string",required:!0},table:{category:"button"}}},y={inputId:{control:"text",description:"Attribut 'id' de l'input",type:{value:"string",required:!0},table:{category:"input"}},inputLabel:{control:"text",description:"Libellé de l'input",type:{value:"string",required:!0},table:{category:"input"}},inputPlaceholder:{control:"text",description:"Placeholder de l'input",type:{value:"string"},table:{category:"input"}}},S={size:{control:{type:"select"},description:"Taille de la barre de recherche (défaut: md)",options:["md","lg"]},...y,...m},t={size:"md",inputId:"search-input",inputLabel:"Rechercher",inputPlaceholder:"Rechercher",buttonTitle:"Rechercher",buttonLabel:"Rechercher"},L=e=>({id:e.id||void 0,size:e.size||t.size,input:{id:e.inputId||t.inputId,label:e.inputLabel||t.inputLabel,placeholder:e.inputPlaceholder||t.inputPlaceholder},button:{label:e.buttonLabel||t.buttonLabel,title:e.buttonTitle||t.buttonTitle}}),T=e=>b({search:L(e)}),x={id:"search",title:"DSFR/Component/Search",render:T,argTypes:S,args:t},r={tags:["!autodocs"],args:{}},o={tags:["autodocs","!dev"],args:{id:"search-md",inputId:"search-input-md"}},s={tags:["autodocs","!dev"],args:{size:"lg",id:"search-lg",inputId:"search-input-lg"}};var a,n,c;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(c=(n=r.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var i,u,d;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: 'search-md',
    inputId: 'search-input-md'
  }
}`,...(d=(u=o.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var l,p,h;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'lg',
    id: 'search-lg',
    inputId: 'search-input-lg'
  }
}`,...(h=(p=s.parameters)==null?void 0:p.docs)==null?void 0:h.source}}};const f=["SearchStory","DefaultStory","SizeLgStory"];export{o as DefaultStory,r as SearchStory,s as SizeLgStory,f as __namedExportsOrder,x as default};
