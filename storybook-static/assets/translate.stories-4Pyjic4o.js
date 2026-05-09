import{e as T,u as s}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const S=e=>T.render("translate",e),B={id:{control:"text",description:"Attribut 'id' du sélecteur de langue",type:{value:"string",required:!0},table:{category:"attributes"}},collapseId:{control:"text",description:"Attribut 'id' du menu à controler",type:{value:"string",required:!0},table:{category:"attributes"}},noBorder:{control:"boolean",description:"Version sans bordure sur le bouton",type:{value:"boolean"}}},r=(e,l,u)=>({active:e===1,id:`language-id-${e}`,name:l,locale:u,href:`/${u}/`}),t={noBorder:!1,languages:[r(1,"Français","fr"),r(2,"English","en"),r(2,"Español","es"),r(4,"Deutsch","de")],id:"translate-id",collapseId:"translate-collapse-id",buttonId:"button-id",buttonTitle:"Sélectionner une langue"},v=e=>({id:e.id||void 0,collapseId:e.collapseId||t.collapseId,button:{id:e.buttonId||t.buttonId,title:e.buttonTitle||t.buttonTitle,kind:e.noBorder?4:3},languages:e.languages||t.languages}),q=e=>S({translate:v(e)}),h={id:"translate",title:"DSFR/Component/Translate",render:q,argTypes:B,args:t},a={tags:["!autodocs"],args:{}},o={tags:["autodocs","!dev"],args:{collapseId:s("collapse"),buttonId:s("collapse-button")}},n={tags:["autodocs","!dev"],args:{collapseId:s("collapse"),buttonId:s("collapse-button"),noBorder:!0}};var d,c,i;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(i=(c=a.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var p,g,b;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    collapseId: uniqueId('collapse'),
    buttonId: uniqueId('collapse-button')
  }
}`,...(b=(g=o.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var I,m,y;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    collapseId: uniqueId('collapse'),
    buttonId: uniqueId('collapse-button'),
    noBorder: true
  }
}`,...(y=(m=n.parameters)==null?void 0:m.docs)==null?void 0:y.source}}};const E=["TranslateStory","ButtonTertiaryStory","ButtonTertiaryNoOutlineStory"];export{n as ButtonTertiaryNoOutlineStory,o as ButtonTertiaryStory,a as TranslateStory,E as __namedExportsOrder,h as default};
