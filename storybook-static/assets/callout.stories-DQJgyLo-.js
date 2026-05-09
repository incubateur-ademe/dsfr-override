import{e as k}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const q=e=>k.render("callout",e),C={accent:{control:{type:"select"},description:"Couleur d'accentuation",options:["défaut","green-tilleul-verveine","green-bourgeon","green-emeraude","green-menthe","green-archipel","blue-ecume","blue-cumulus","purple-glycine","pink-macaron","pink-tuile","yellow-tournesol","yellow-moutarde","orange-terre-battue","brown-cafe-creme","brown-caramel","brown-opera","beige-gris-galet"]}},E={hasTitle:{control:"boolean",description:"Ajoute un titre dans la mise en avant",type:{value:"boolean"}},title:{if:{arg:"hasTitle",eq:!0},control:"text",description:"Titre de la mise en avant",type:{value:"string"}},text:{control:"text",description:"Contenu texte de la mise en avant",type:{value:"string",required:!0}},id:{control:"text",description:"Attribut id de la mise en avant",type:{value:"string"},table:{category:"attributes"}},hasIcon:{control:"boolean",description:"Affiche une icône",type:{value:"boolean"},table:{category:"icon"}},icon:{if:{arg:"hasIcon",eq:!0},control:"text",description:"Nom de l'icône",type:{value:"string"},table:{category:"icon"}},titleMarkup:{if:{arg:"hasTitle",eq:!0},control:{type:"select"},description:"Niveau d'entête du titre",options:["h2","h3","h4","h5","h6","p"]},hasButton:{control:"boolean",description:"Affiche un bouton",type:{value:"boolean"},table:{category:"button"}},buttonLabel:{if:{arg:"hasButton",eq:!0},control:"text",description:"Libellé du bouton",type:{value:"string",required:!0},table:{category:"button"}},...C},t={text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec libero ultricies aliquet",hasTitle:!0,title:"Titre de la mise en avant",titleMarkup:"h3",buttonLabel:"En savoir plus",hasIcon:!1,icon:"info-line",accent:void 0,hasButton:!1},w=e=>{const o={id:e.id||void 0,text:e.text||t.text,markup:e.titleMarkup||t.titleMarkup};return e.hasTitle&&(o.title=e.title===""?void 0:e.title||t.title),e.accent!=="défaut"&&(o.accent=e.accent||t.accent),e.hasButton&&(o.button={label:e.buttonLabel||t.buttonLabel}),e.hasIcon&&(o.icon=e.icon||t.icon),o},M=e=>q({callout:w(e)}),_={id:"callout",title:"DSFR/Component/Callout",render:M,argTypes:E,args:t},n={tags:["!autodocs"],args:{}},a={tags:["autodocs","!dev"],args:{}},r={tags:["autodocs","!dev"],args:{hasIcon:!0,icon:"info-line"}},s={tags:["autodocs","!dev"],args:{hasButton:!0,buttonLabel:"En savoir plus"}},c={tags:["autodocs","!dev"],args:{hasIcon:!0,icon:"info-line",hasButton:!0,buttonLabel:"En savoir plus"}},u={tags:["autodocs","!dev"],args:{accent:"pink-macaron"}};var i,l,d;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(d=(l=n.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var p,g,m;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {}
}`,...(m=(g=a.parameters)==null?void 0:g.docs)==null?void 0:m.source}}};var b,y,h;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasIcon: true,
    icon: 'info-line'
  }
}`,...(h=(y=r.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};var v,f,S;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasButton: true,
    buttonLabel: 'En savoir plus'
  }
}`,...(S=(f=s.parameters)==null?void 0:f.docs)==null?void 0:S.source}}};var x,B,I;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasIcon: true,
    icon: 'info-line',
    hasButton: true,
    buttonLabel: 'En savoir plus'
  }
}`,...(I=(B=c.parameters)==null?void 0:B.docs)==null?void 0:I.source}}};var A,L,T;u.parameters={...u.parameters,docs:{...(A=u.parameters)==null?void 0:A.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    accent: 'pink-macaron'
  }
}`,...(T=(L=u.parameters)==null?void 0:L.docs)==null?void 0:T.source}}};const j=["CalloutStory","DefaultStory","IconStory","ButtonStory","IconAndButtonStory","AccentStory"];export{u as AccentStory,s as ButtonStory,n as CalloutStory,a as DefaultStory,c as IconAndButtonStory,r as IconStory,j as __namedExportsOrder,_ as default};
