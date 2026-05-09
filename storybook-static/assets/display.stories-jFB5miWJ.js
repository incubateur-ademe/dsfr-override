import{r as d}from"./modal-CRznpJDZ.js";import{r as L}from"./button-DXzyz14T.js";import{r as F,b as T}from"./header-arg-types-CqetOCuc.js";import{f as x,r as A,b as H}from"./footer-arg-types-B-QQA_Va.js";import{r as z}from"./fieldset-BA-83frp.js";import"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const i=(e,o,k,P)=>({type:"radio",inline:!1,data:{id:`fr-radios-theme-${e}`,label:o,value:e,size:"md",name:"fr-radios-theme",rich:!0,hint:P,pictogram:{name:k}}}),E=e=>({id:"display-fieldset",legend:"Choisissez un thème pour personnaliser l’apparence du site.",inline:!1,choice:!0,elements:[i("light","Thème clair","sun"),i("dark","Thème sombre","moon"),i("system","Système","system","Utilise les paramètres système")]}),G=()=>`<div id="fr-display" class="fr-display">${z({fieldset:E()})}</div>`,_={id:{control:"text",description:"Attribut id de la modale du paramètre d'affichage",type:{value:"string",required:!0}}},v={id:"display"},n=e=>({id:e.id||v.id,title:"Paramètres d’affichage",size:"sm",body:G()}),B=e=>L({button:{id:"display-button",label:"Paramètres d'affichage",classes:["fr-btn--display"],attributes:{"aria-controls":e.id,"data-fr-opened":!1}}})+d({modal:n(e)}),C=e=>F({header:T(e)})+d({modal:n({id:"header-display"})}),N=e=>A({footer:H(e)})+d({modal:n({id:"footer-display"})}),I={id:"display",title:"DSFR/Component/Display",render:B,argTypes:_,args:v},r={tags:["!autodocs"],args:{}},a={tags:["autodocs","!dev"],args:{id:"display-default"}},s={tags:["autodocs","!dev"],render:()=>C({id:"header",hasToolLinks:!0,toolLinks:{buttons:[{label:"Paramètres d'affichage",classes:["fr-icon-theme-fill","fr-btn--icon-left"],attributes:{"aria-controls":"header-display","data-fr-opened":!1}}]},hasNavigation:!1})},t={tags:["autodocs","!dev"],render:()=>N({id:"footer",bottomLinks:[...x.bottomLinks,{markup:"button",label:"Paramètres d'affichage",classes:["fr-icon-theme-fill","fr-btn--icon-left"],attributes:{"aria-controls":"footer-display","data-fr-opened":!1}}]})};var l,p,c;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(c=(p=r.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};var f,m,u;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: 'display-default'
  }
}`,...(u=(m=a.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var y,g,h;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renderHeaderDisplay({
    id: 'header',
    hasToolLinks: true,
    toolLinks: {
      buttons: [{
        label: 'Paramètres d\\'affichage',
        classes: ['fr-icon-theme-fill', 'fr-btn--icon-left'],
        attributes: {
          'aria-controls': 'header-display',
          'data-fr-opened': false
        }
      }]
    },
    hasNavigation: false
  })
}`,...(h=(g=s.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var b,D,S;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renderFooterDisplay({
    id: 'footer',
    bottomLinks: [...footerArgs.bottomLinks, {
      markup: 'button',
      label: 'Paramètres d\\'affichage',
      classes: ['fr-icon-theme-fill', 'fr-btn--icon-left'],
      attributes: {
        'aria-controls': 'footer-display',
        'data-fr-opened': false
      }
    }]
  })
}`,...(S=(D=t.parameters)==null?void 0:D.docs)==null?void 0:S.source}}};const J=["DisplayStory","DefaultStory","HeaderDisplayStory","FooterDisplayStory"];export{a as DefaultStory,r as DisplayStory,t as FooterDisplayStory,s as HeaderDisplayStory,J as __namedExportsOrder,I as default};
