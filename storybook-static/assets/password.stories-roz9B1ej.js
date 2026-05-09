import{e as A,u as t}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const M={checkboxId:{control:"text",description:"Attribut 'id' de la checkbox",type:{value:"string",required:!0},table:{category:"checkbox"}},checkboxLabel:{control:"text",description:"Libellé de la checkbox",type:{value:"string",required:!0},table:{category:"checkbox"}},checkboxAriaLabel:{control:"text",description:"Libellé de la checkbox pour les lecteurs d'écran",type:{value:"string",required:!0},table:{category:"checkbox"}}},S={inputId:{control:"text",description:"Attribut 'id' de l'input",type:{value:"string",required:!0},table:{category:"input"}},inputLabel:{control:"text",description:"Libellé de l'input",type:{value:"string",required:!0},table:{category:"input"}},inputAutocomplete:{control:{type:"select"},options:["off","current-password","new-password"],description:"Attribut 'autocomplete' de l'input (mot de passe nouveau ou existant)",type:{value:"string"},table:{category:"input"}},hasMessages:{control:"boolean",description:"Affiche les messages d'aide ou d'erreur/validité",type:{value:"boolean"},table:{category:"input"}},messages:{if:{arg:"hasMessages",eq:!0},control:"object",description:"Messages d'aide ou d'erreur/validité (tableau d'objets de type { text: string, type: string })",type:{value:"array"},table:{category:"input"}},validMessage:{if:{arg:"hasMessages",eq:!0},control:"text",description:`Libellé de l'icône des messages de type "valid"`,type:{value:"string"},table:{category:"input"}},errorMessage:{if:{arg:"hasMessages",eq:!0},control:"text",description:`Libellé de l'icône des messages de type "error"`,type:{value:"string"},table:{category:"input"}}},R={hasLink:{if:{arg:"hasMessages",eq:!1},control:"boolean",description:'Affiche le lien "Mot de passe oublié ?"',type:{value:"boolean"},table:{category:"link"}},linkId:{if:{arg:"hasLink",eq:!0},control:"text",description:"Attribut 'id' du lien",type:{value:"string"},table:{category:"link"}},linkLabel:{if:{arg:"hasLink",eq:!0},control:"text",description:"Libellé du lien",type:{value:"string",required:!0},table:{category:"link"}},linkHref:{if:{arg:"hasLink",eq:!0},control:"text",description:"URL de destination du lien",type:{value:"string",required:!0},table:{category:"link"}}},V={...S,...M,...R},s={inputId:"storybook-password-input",inputLabel:"Mot de passe",inputAutocomplete:"current-password",checkboxId:"storybook-password-checkbox",checkboxLabel:"Afficher",checkboxAriaLabel:"Afficher le mot de passe",hasLink:!1,linkId:"storybook-password-link",linkHref:"[URL - à modifier]",linkLabel:"Mot de passe oublié ?",hasMessages:!1,messages:[{text:"Votre mot de passe doit contenir :"},{text:"12 caractères minimum",type:"info"},{text:"1 caractère spécial minimum",type:"info"},{text:"1 chiffre minimum",type:"info"}],validMessage:"Validé",errorMessage:"En erreur"},E=e=>{const d={id:e.id||void 0,input:{id:e.inputId||s.inputId,label:e.inputLabel||s.inputLabel,autocomplete:e.inputAutocomplete||s.inputAutocomplete},checkbox:{id:e.checkboxId||s.checkboxId,label:e.checkboxLabel||s.checkboxLabel,ariaLabel:e.checkboxAriaLabel||s.checkboxAriaLabel}};if(e.messages){const c={};c["data-fr-valid"]=e.validMessage||s.validMessage,c["data-fr-error"]=e.errorMessage||s.errorMessage,e.messages.filter(u=>u.type!==void 0).forEach(u=>{u.attributes=c}),d.messages=e.messages}return e.hasLink&&(d.link={id:e.linkId!==""?e.linkId||s.linkId:void 0,label:e.linkLabel||s.linkLabel,href:e.linkHref||s.linkHref}),d},P=e=>A.render("password",e),T=e=>P({password:E(e)}),D={id:"password",title:"DSFR/Component/Password",render:T,argTypes:V,args:s},r={tags:["!autodocs"],args:{}},a={tags:["autodocs","!dev"],args:{id:t("password"),checkboxId:t("password-checkbox"),inputId:t("password-input"),linkId:t("password-link")}},o={tags:["autodocs","!dev"],args:{hasLink:!0,id:t("password"),checkboxId:t("password-checkbox"),inputId:t("password-input"),linkId:t("password-link")}},i={tags:["autodocs","!dev"],args:{hasLink:!1,hasMessages:!0,id:t("password"),checkboxId:t("password-checkbox"),inputId:t("password-input")}},n={tags:["autodocs","!dev"],args:{hasLink:!1,hasMessages:!0,inputValue:"t1t1!",id:t("password"),checkboxId:t("password-checkbox"),inputId:t("password-input"),messages:[{text:"Votre mot de passe doit contenir :"},{text:"12 caractères minimum",type:"error"},{text:"1 caractère spécial minimum",type:"valid"},{text:"1 chiffre minimum",type:"valid"}]}};var p,l,b;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(b=(l=r.parameters)==null?void 0:l.docs)==null?void 0:b.source}}};var g,k,m;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('password'),
    checkboxId: uniqueId('password-checkbox'),
    inputId: uniqueId('password-input'),
    linkId: uniqueId('password-link')
  }
}`,...(m=(k=a.parameters)==null?void 0:k.docs)==null?void 0:m.source}}};var h,x,y;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasLink: true,
    id: uniqueId('password'),
    checkboxId: uniqueId('password-checkbox'),
    inputId: uniqueId('password-input'),
    linkId: uniqueId('password-link')
  }
}`,...(y=(x=o.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var f,I,w;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasLink: false,
    hasMessages: true,
    id: uniqueId('password'),
    checkboxId: uniqueId('password-checkbox'),
    inputId: uniqueId('password-input')
  }
}`,...(w=(I=i.parameters)==null?void 0:I.docs)==null?void 0:w.source}}};var L,v,q;n.parameters={...n.parameters,docs:{...(L=n.parameters)==null?void 0:L.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasLink: false,
    hasMessages: true,
    inputValue: 't1t1!',
    id: uniqueId('password'),
    checkboxId: uniqueId('password-checkbox'),
    inputId: uniqueId('password-input'),
    messages: [{
      text: 'Votre mot de passe doit contenir :'
    }, {
      text: '12 caractères minimum',
      type: 'error'
    }, {
      text: '1 caractère spécial minimum',
      type: 'valid'
    }, {
      text: '1 chiffre minimum',
      type: 'valid'
    }]
  }
}`,...(q=(v=n.parameters)==null?void 0:v.docs)==null?void 0:q.source}}};const _=["PasswordStory","DefaultStory","LoginStory","RegisterStory","RegisterValidateStory"];export{a as DefaultStory,o as LoginStory,r as PasswordStory,i as RegisterStory,n as RegisterValidateStory,_ as __namedExportsOrder,D as default};
