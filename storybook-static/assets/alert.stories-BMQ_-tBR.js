import{e as $}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const ee=e=>$.render("alert.ejs",e),te={buttonCloseLabel:{if:{arg:"dismissible",eq:!0},control:"text",description:"Libellé du bouton de fermeture",type:{value:"string",required:!0},table:{category:"button close"}},buttonCloseOnClick:{if:{arg:"dismissible",eq:!0},control:"text",description:"Code JavaScript à exécuter lors du clic sur le bouton de fermeture",type:{value:"string"},table:{category:"button close"}}},re={hasTitle:{control:"boolean",description:"L'alerte a un titre (obligatoire en taille md)"},title:{if:{arg:"hasTitle",eq:!0},control:"text",description:"Titre de l'alerte",type:{value:"string"}},hasDescription:{control:"boolean",description:"L'alerte a une description (obligatoire en taille sm)"},text:{if:{arg:"hasDescription",eq:!0},control:"text",description:"Description de l'alerte",type:{value:"string"}},type:{control:{type:"select",labels:{default:"Défaut",success:"Succès",error:"Erreur",info:"Information",warning:"Attention"}},description:"Type d'alerte<br>Valeurs :<br>- Défaut : Alerte sans couleur<br>- Succès : Alerte verte pour indiquer une action ou une tâche terminée avec succès.<br>- Erreur : Alerte rouge à utiliser quand il y a plusieurs erreurs dans un formulaire, ou des erreurs bloquantes à remonter pour l’utilisateur.<br>- Information : Alerte bleue à utiliser pour mettre en exergue des informations importantes.<br>- Attention : Alerte orange à utiliser à utiliser pour mettre en exergue des risques ou points d’attention importants.",options:["default","success","error","info","warning"]},size:{control:{type:"select"},description:"Taille de l'alerte",options:["sm","md"]},id:{control:"text",description:"Attribut 'id' de l'alerte",table:{category:"attributes"}},dismissible:{control:"boolean",description:"L'alerte est refermable"},icon:{if:{arg:"type",eq:"default"},control:"text",description:"Icône personnalisée sur l'alerte"},...te},r={hasTitle:!0,hasDescription:!0,title:"Lorem ipsum dolor",text:"sit amet, consectetur adipiscing elit. Nullam id purus nec purus ultricies lacinia. Nullam nec purus nec purus ultricies lacinia.",type:"default",size:"md",id:"",icon:"",dismissible:!1,buttonCloseLabel:"Masquer le message",buttonCloseOnClick:"const alert = this.parentNode; alert.parentNode.removeChild(alert)"},se=e=>{const t={size:e.size||r.size,icon:e.icon||r.icon,dismissible:e.dismissible||r.dismissible,id:e.id||void 0};return e.hasDescription&&(t.text=e.text),e.hasTitle&&(t.title=e.title||r.title),e.hasDescription&&(t.text=e.text||r.text),e.type!=="default"&&(t.type=e.type),t.dismissible&&(t.button={label:e.buttonCloseLabel||r.buttonCloseLabel,attributes:{title:e.buttonCloseLabel||r.buttonCloseLabel,onClick:e.buttonCloseOnClick!==null?e.buttonCloseOnClick||r.buttonCloseOnClick:void 0}}),t},Z=e=>ee({alert:se(e)}),s=e=>e.map(t=>Z(t)).join(`

`),oe={id:"alert",title:"DSFR/Component/Alert",render:Z,argTypes:re,args:r},i={tags:["!autodocs"],args:{}},n={tags:["autodocs","!dev"],args:{hasTitle:!0,title:"Titre de l'alerte contenant l'intitulé de son type",hasDescription:!1}},o={tags:["autodocs","!dev"],args:{hasTitle:!0,title:"Titre de l'alerte contenant l'intitulé de son type",hasDescription:!0,text:"Texte de description de l'alerte"}},a={tags:["autodocs","!dev"],render:()=>s([{type:"success",hasTitle:!0,title:"Titre du message de succès",text:"Texte du message"}])},l={tags:["autodocs","!dev"],render:()=>s([{type:"error",hasTitle:!0,title:"Titre du message d'erreur",text:"Texte du message"}])},u={tags:["autodocs","!dev"],render:()=>s([{type:"info",hasTitle:!0,title:"Titre du message d'information",text:"Texte du message"}])},c={tags:["autodocs","!dev"],render:()=>s([{type:"warning",hasTitle:!0,title:"Titre du message d'avertissement",text:"Texte du message"}])},d={tags:["autodocs","!dev"],render:()=>s([{size:"sm",type:"success",hasTitle:!1,hasDescription:!0,text:"Succès : Description détaillée du message..."},{size:"sm",type:"error",hasTitle:!1,hasDescription:!0,text:"Erreur : Description détaillée du message..."},{size:"sm",type:"info",hasTitle:!1,hasDescription:!0,text:"Information : Description détaillée du message..."},{size:"sm",type:"warning",hasTitle:!1,hasDescription:!0,text:"Attention : Description détaillée du message..."}])},p={tags:["autodocs","!dev"],render:()=>s([{hasTitle:!0,type:"success",title:"Succès : Description détaillée du message..."},{hasTitle:!0,type:"error",title:"Erreur : Description détaillée du message..."},{hasTitle:!0,type:"info",title:"Information : Description détaillée du message..."},{hasTitle:!0,type:"warning",title:"Attention : Description détaillée du message..."}])},m={tags:["autodocs","!dev"],render:()=>s([{title:"Titre du message",hasTitle:!0,hasDescription:!0,text:"Cliquer sur la croix pour fermer l'alerte",dismissible:!0}])},g={tags:["autodocs","!dev"],render:()=>s([{title:"Titre du message",hasTitle:!0,text:"Cliquer sur la croix pour fermer l'alerte",dismissible:!0,buttonCloseOnClick:null}])},x={tags:["autodocs","!dev"],render:()=>s([{type:"default",hasTitle:!0,icon:"lock-fill"}])};var y,T,b;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(b=(T=i.parameters)==null?void 0:T.docs)==null?void 0:b.source}}};var f,h,S;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasTitle: true,
    title: 'Titre de l\\'alerte contenant l\\'intitulé de son type',
    hasDescription: false
  }
}`,...(S=(h=n.parameters)==null?void 0:h.docs)==null?void 0:S.source}}};var D,v,C;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasTitle: true,
    title: 'Titre de l\\'alerte contenant l\\'intitulé de son type',
    hasDescription: true,
    text: 'Texte de description de l\\'alerte'
  }
}`,...(C=(v=o.parameters)==null?void 0:v.docs)==null?void 0:C.source}}};var E,A,z;a.parameters={...a.parameters,docs:{...(E=a.parameters)==null?void 0:E.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    type: 'success',
    hasTitle: true,
    title: 'Titre du message de succès',
    text: 'Texte du message'
  }])
}`,...(z=(A=a.parameters)==null?void 0:A.docs)==null?void 0:z.source}}};var q,I,L;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    type: 'error',
    hasTitle: true,
    title: 'Titre du message d\\'erreur',
    text: 'Texte du message'
  }])
}`,...(L=(I=l.parameters)==null?void 0:I.docs)==null?void 0:L.source}}};var k,w,O;u.parameters={...u.parameters,docs:{...(k=u.parameters)==null?void 0:k.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    type: 'info',
    hasTitle: true,
    title: 'Titre du message d\\'information',
    text: 'Texte du message'
  }])
}`,...(O=(w=u.parameters)==null?void 0:w.docs)==null?void 0:O.source}}};var N,j,J;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    type: 'warning',
    hasTitle: true,
    title: 'Titre du message d\\'avertissement',
    text: 'Texte du message'
  }])
}`,...(J=(j=c.parameters)==null?void 0:j.docs)==null?void 0:J.source}}};var M,_,R;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    size: 'sm',
    type: 'success',
    hasTitle: false,
    hasDescription: true,
    text: 'Succès : Description détaillée du message...'
  }, {
    size: 'sm',
    type: 'error',
    hasTitle: false,
    hasDescription: true,
    text: 'Erreur : Description détaillée du message...'
  }, {
    size: 'sm',
    type: 'info',
    hasTitle: false,
    hasDescription: true,
    text: 'Information : Description détaillée du message...'
  }, {
    size: 'sm',
    type: 'warning',
    hasTitle: false,
    hasDescription: true,
    text: 'Attention : Description détaillée du message...'
  }])
}`,...(R=(_=d.parameters)==null?void 0:_.docs)==null?void 0:R.source}}};var W,F,P;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    hasTitle: true,
    type: 'success',
    title: 'Succès : Description détaillée du message...'
  }, {
    hasTitle: true,
    type: 'error',
    title: 'Erreur : Description détaillée du message...'
  }, {
    hasTitle: true,
    type: 'info',
    title: 'Information : Description détaillée du message...'
  }, {
    hasTitle: true,
    type: 'warning',
    title: 'Attention : Description détaillée du message...'
  }])
}`,...(P=(F=p.parameters)==null?void 0:F.docs)==null?void 0:P.source}}};var V,B,G;m.parameters={...m.parameters,docs:{...(V=m.parameters)==null?void 0:V.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    title: 'Titre du message',
    hasTitle: true,
    hasDescription: true,
    text: 'Cliquer sur la croix pour fermer l\\'alerte',
    dismissible: true
  }])
}`,...(G=(B=m.parameters)==null?void 0:B.docs)==null?void 0:G.source}}};var H,K,Q;g.parameters={...g.parameters,docs:{...(H=g.parameters)==null?void 0:H.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    title: 'Titre du message',
    hasTitle: true,
    text: 'Cliquer sur la croix pour fermer l\\'alerte',
    dismissible: true,
    buttonCloseOnClick: null
  }])
}`,...(Q=(K=g.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var U,X,Y;x.parameters={...x.parameters,docs:{...(U=x.parameters)==null?void 0:U.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    type: 'default',
    hasTitle: true,
    icon: 'lock-fill'
  }])
}`,...(Y=(X=x.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};const ae=["AlertStory","TitleStory","DescriptionStory","SuccessStory","ErrorStory","InformationStory","WarningStory","SizeSmStory","SizeMdStory","DismissibleStory","DismissibleNoJsStory","IconCustomStory"];export{i as AlertStory,o as DescriptionStory,g as DismissibleNoJsStory,m as DismissibleStory,l as ErrorStory,x as IconCustomStory,u as InformationStory,p as SizeMdStory,d as SizeSmStory,a as SuccessStory,n as TitleStory,c as WarningStory,ae as __namedExportsOrder,oe as default};
