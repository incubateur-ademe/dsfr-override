import{e as B}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const G=e=>B.render("notice",e),J={buttonLabel:{if:{arg:"dismissible",eq:!0},control:"text",description:"Libellé du bouton de fermeture",type:{value:"string"},table:{category:"dismiss"}}},K={title:{control:"text",description:"Titre du bandeau",type:{value:"string",required:!0}},hasDescription:{control:"boolean",description:"Le bandeau a une description"},desc:{if:{arg:"hasDescription",eq:!0},control:"text",description:"Texte de description du bandeau",type:{value:"string"}},hasIcon:{control:"boolean",description:"Le bandeau a une icône",table:{category:"icon"}},icon:{if:{arg:"hasIcon",eq:!0},control:"text",description:"Nom de l'icône du bandeau",type:{value:"string"},table:{category:"icon"}},type:{control:{type:"select",labels:{info:"info",warning:"warning",alert:"alert","weather-orange":"weather-orange","weather-red":"weather-red","weather-purple":"weather-purple",kidnapping:"kidnapping",cyberattack:"cyberattack",attack:"attack",witness:"witness"}},description:"Type de bandeau",options:["info","warning","alert","weather-orange","weather-red","weather-purple","kidnapping","cyberattack","attack","witness"],table:{category:"type"}},markup:{control:{type:"select",labels:{p:"p",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6"}},description:"Type de bandeau",options:["p","h1","h2","h3","h4","h5","h6"]},notice:{control:"boolean",description:" Si true, ajoute un role notice (si insertion à la volée du bandeau)"},dismissible:{control:"boolean",description:"Ajoute un bouton de fermeture",table:{category:"dismiss"}},hasLink:{control:"boolean",description:"Le bandeau a un lien",table:{category:"link"}},linkLabel:{if:{arg:"hasLink",eq:!0},control:"text",description:"Texte du lien du bandeau",type:{value:"string"},table:{category:"link"}},linkTitle:{if:{arg:"hasLink",eq:!0},control:"text",description:"Title du lien du bandeau",type:{value:"string"},table:{category:"link"}},linkHref:{if:{arg:"hasLink",eq:!0},control:"text",description:"Href du lien du bandeau",type:{value:"string"},table:{category:"link"}},blank:{if:{arg:"hasLink",eq:!0},control:"boolean",description:"Si true, target prend la valeur _blank, sinon _self",table:{category:"link"}},...J},t={id:"",title:"Titre du bandeau",hasDescription:!1,desc:"Texte de description",hasIcon:!0,icon:"",type:"info",markup:"p",notice:!1,dismissible:!1,buttonLabel:"Masquer le message",hasLink:!1,linkLabel:"Lien de consultation",linkHref:"#",linkTitle:"[À MODIFIER - Intitulé] - nouvelle fenêtre",blank:!1},Q=e=>{const a={id:e.id||void 0,title:e.title||t.title,dismissible:e.dismissible||t.dismissible,icon:e.hasIcon?e.icon:!1,type:e.type||t.type,markup:e.markup||t.markup,notice:e.notice||t.notice};return e.hasDescription&&(a.desc=e.desc||void 0),e.hasLink&&(a.link={label:e.linkLabel||t.linkLabel,href:e.linkHref||t.linkHref,title:e.linkTitle||t.linkTitle,blank:e.blank||t.blank,self:!e.blank||void 0}),e.dismissible&&(a.button={label:e.buttonLabel||t.buttonLabel,title:e.buttonLabel||t.buttonLabel,attributes:{onclick:"const notice = this.parentNode.parentNode.parentNode; notice.parentNode.removeChild(notice)"}}),a},U=e=>G({notice:Q(e)}),r={desc:"Texte de description lorem ipsum sit consectetur adipiscing elit.",hasLink:!0,blank:!0,dismissible:!0},Z={id:"notice",title:"DSFR/Component/Notice",render:U,argTypes:K,args:t},n={tags:["!autodocs"],args:{}},o={tags:["autodocs","!dev"],args:{type:"info",title:"Titre du bandeau d'information importante",...r}},s={tags:["autodocs","!dev"],args:{type:"warning",title:"Titre du bandeau d'avertissement",...r}},i={tags:["autodocs","!dev"],args:{type:"alert",title:"Titre du bandeau d'alerte",...r}},c={tags:["autodocs","!dev"],args:{type:"weather-orange",title:"Vigilance météo orange",desc:"Texte de description lorem ipsum sit consectetur adipiscing elit.",hasLink:!0,blank:!0}},d={tags:["autodocs","!dev"],args:{type:"weather-red",title:"Vigilance météo rouge",...r}},l={tags:["autodocs","!dev"],args:{type:"weather-purple",title:"Vigilance météo violette",...r}},u={tags:["autodocs","!dev"],args:{type:"attack",title:"Attentat en cours",...r}},p={tags:["autodocs","!dev"],args:{type:"witness",title:"Appel à témoins",...r}},m={tags:["autodocs","!dev"],args:{type:"cyberattack",title:"Cyber-attaque",...r}};var g,b,y;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(y=(b=n.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var k,h,f;o.parameters={...o.parameters,docs:{...(k=o.parameters)==null?void 0:k.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'info',
    title: 'Titre du bandeau d\\'information importante',
    ...commonArgs
  }
}`,...(f=(h=o.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var v,S,w;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'warning',
    title: 'Titre du bandeau d\\'avertissement',
    ...commonArgs
  }
}`,...(w=(S=s.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var L,T,x;i.parameters={...i.parameters,docs:{...(L=i.parameters)==null?void 0:L.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'alert',
    title: 'Titre du bandeau d\\'alerte',
    ...commonArgs
  }
}`,...(x=(T=i.parameters)==null?void 0:T.docs)==null?void 0:x.source}}};var A,q,E;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'weather-orange',
    title: 'Vigilance météo orange',
    desc: 'Texte de description lorem ipsum sit consectetur adipiscing elit.',
    hasLink: true,
    blank: true
  }
}`,...(E=(q=c.parameters)==null?void 0:q.docs)==null?void 0:E.source}}};var W,I,N;d.parameters={...d.parameters,docs:{...(W=d.parameters)==null?void 0:W.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'weather-red',
    title: 'Vigilance météo rouge',
    ...commonArgs
  }
}`,...(N=(I=d.parameters)==null?void 0:I.docs)==null?void 0:N.source}}};var C,D,V;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'weather-purple',
    title: 'Vigilance météo violette',
    ...commonArgs
  }
}`,...(V=(D=l.parameters)==null?void 0:D.docs)==null?void 0:V.source}}};var H,R,_;u.parameters={...u.parameters,docs:{...(H=u.parameters)==null?void 0:H.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'attack',
    title: 'Attentat en cours',
    ...commonArgs
  }
}`,...(_=(R=u.parameters)==null?void 0:R.docs)==null?void 0:_.source}}};var O,j,P;p.parameters={...p.parameters,docs:{...(O=p.parameters)==null?void 0:O.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'witness',
    title: 'Appel à témoins',
    ...commonArgs
  }
}`,...(P=(j=p.parameters)==null?void 0:j.docs)==null?void 0:P.source}}};var F,M,z;m.parameters={...m.parameters,docs:{...(F=m.parameters)==null?void 0:F.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'cyberattack',
    title: 'Cyber-attaque',
    ...commonArgs
  }
}`,...(z=(M=m.parameters)==null?void 0:M.docs)==null?void 0:z.source}}};const $=["NoticeStory","InfoStory","WarningStory","AlertStory","WeatherOrangeStory","WeatherRedStory","WeatherPurpleStory","AttackStory","WitnessStory","CyberattackStory"];export{i as AlertStory,u as AttackStory,m as CyberattackStory,o as InfoStory,n as NoticeStory,s as WarningStory,c as WeatherOrangeStory,l as WeatherPurpleStory,d as WeatherRedStory,p as WitnessStory,$ as __namedExportsOrder,Z as default};
