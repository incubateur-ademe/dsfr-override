import{e as Q}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const Z=e=>Q.render("tile",e),$={pictogramName:{control:"text",description:"Nom du pictogramme de la tuile",type:{value:"string"},table:{category:"content"}}},ee={title:{control:"text",description:"Titre de la tuile",type:{value:"string",required:!0},table:{category:"content"}},hasDescription:{control:"boolean",description:"Si true, ajoute une description dans le contenu",table:{category:"content"}},description:{if:{arg:"hasDescription",eq:!0},control:"text",description:"Description de la tuile",type:{value:"string"},table:{category:"content"}},hasDetails:{if:{arg:"download",eq:!1},control:"boolean",description:"Si true, ajoute une ligne détails dans le contenu",table:{category:"content"}},details:{if:{arg:"hasDetails",eq:!0},control:"text",description:"Détails de la tuile. Obligatoire si download = true",type:{value:"string"},table:{category:"content"}},markup:{control:{type:"select"},description:"Niveau de titre de la tuile (default: h3)",options:["h2","h3","h4","h5"],table:{category:"content"}},...$,hasBadge:{if:{arg:"hasTag",eq:!1},control:"boolean",description:"Si true, ajoute un badge dans le contenu",table:{category:"content"}},hasTag:{if:{arg:"hasBadge",eq:!1},control:"boolean",description:"Si true, ajoute un tag dans le contenu",table:{category:"content"}},enlarge:{if:{arg:"actionMarkup",eq:"a"},control:"boolean",description:"Si true, agrandi la zone de clic à toute la tuile",table:{category:"action"}},actionMarkup:{control:{type:"select"},description:"balise de l'actionneur du composant (a, button)",options:["a","button",!1],table:{category:"action"}},href:{if:{arg:"actionMarkup",eq:"a"},control:"text",description:"URL de destination du lien",table:{category:"action"}},actionTitle:{control:"text",description:`Attribut title de l'actionneur. Si blank = true, il est obligatoire et doit reprendre le titre suivi de la mention "- nouvelle fenêtre"`,type:{value:"string"},table:{category:"attributes"}},noLink:{if:{arg:"actionMarkup",eq:!1},control:"boolean",description:"Si true, absence d'actionneur",table:{category:"action"}},disabled:{control:"boolean",description:"Si true, retire le href du lien pour le désactiver ou ajoute l'attribut disabled sur le bouton",table:{category:"action"}},blank:{if:{arg:"actionMarkup",eq:"a"},control:"boolean",description:`Ajoute l'attribut target="_blank" pour ouvrir le lien dans une nouvelle fenêtre, nécessite l'ajout d'un attribut title "intitulé - nouvelle fenêtre"`,table:{category:"action"}},download:{control:"boolean",description:"Si true, passe la tuile en mode téléchargement",table:{category:"download"}},lang:{if:{arg:"download",eq:!0},control:"text",description:"Ajoute l'attribut hreflang au lien, pour définir la langue du document lié (Ex: 'fr')",table:{category:"download"}},assess:{if:{arg:"download",eq:!0},control:"boolean",description:'Si true, évaluation automatique des détails du fichier à télécharger (poids, format, etc.). <br>Testez avec href = "img/placeholder.16x9.png"',table:{category:"download"}},assessBytes:{if:{arg:"assess",eq:!0},control:"boolean",description:"Si true, change l'unité de mesure de l'évaluation automatique du poids en Bytes",table:{category:"download"}},size:{control:{type:"select"},description:'Taille de la tuile ("md" - default | "sm").',options:["md","sm"],table:{category:"size"}},horizontal:{control:"boolean",description:"Si true, passe la tuile en mode horizontal",table:{category:"orientation"}},verticalBreakpoint:{if:{arg:"horizontal",eq:!0},control:{type:"select"},description:"Valeur de breakpoint du passage en mode vertical",options:[!1,"md","lg"],table:{category:"orientation"}},variations:{control:{type:"select"},description:"Variations esthétiques de la carte",options:["none","grey","no-border","no-background","shadow"],table:{category:"variations"}}},t={title:"Intitulé de la tuile",markup:"h3",hasDescription:!1,description:"Description (optionnelle)",hasDetails:!0,details:"Détail (optionnel)",hasBadge:!1,hasTag:!1,enlarge:!0,actionMarkup:"a",href:"[URL - à modifier]",pictogramName:"city-hall",noLink:!1,blank:!1,download:!1,lang:"",assess:!1,assessBytes:!1,disabled:!1,size:"md",horizontal:!1,verticalBreakpoint:!1,variations:"none"},te=e=>{const a={download:e.download||t.download,size:e.size||t.size,horizontal:e.horizontal||t.horizontal,vertical:e.verticalBreakpoint||t.verticalBreakpoint,content:{title:e.title||t.title,description:e.hasDescription?e.description:void 0,markup:e.markup||t.markup,details:e.hasDetails?e.details:void 0,actionMarkup:e.actionMarkup||t.actionMarkup,actionTitle:e.actionTitle,href:e.href||t.href,blank:e.blank||t.blank,noLink:e.noLink||t.noLink,disabled:e.disabled||t.disabled,lang:e.lang||t.lang,assess:e.assess||t.assess,badge:e.hasBadge&&{label:"Libellé badge",accent:"purple-glycine"},tag:e.hasTag&&{label:"Libellé tag"}},header:{pictogram:e.pictogramName?{name:e.pictogramName,accent:e.pictogramAccent}:t.pictogram}};return e.download===!0&&(a.content.details=e.details||"TYPE - POIDS - LANGUE"),e.actionMarkup==="a"?a.enlarge=e.enlarge:a.enlarge=!0,e.variations!=="none"&&(a.variations=[e.variations]),e.assessBytes===!0&&(a.content.assess="bytes"),a},ae=e=>Z({tile:te(e)}),ne={id:"tile",title:"DSFR/Component/Tile",render:ae,argTypes:ee,args:t},o={tags:["!autodocs"],args:{}},r={tags:["autodocs","!dev"],args:{enlarge:!0,hasDescription:!0,description:"Description (optionnelle)"}},n={tags:["autodocs","!dev"],args:{enlarge:!0,size:"sm",hasDescription:!0,description:"Description (optionnelle)",hasDetails:!0}},i={tags:["autodocs","!dev"],args:{enlarge:!0,hasTag:!0}},s={tags:["autodocs","!dev"],args:{enlarge:!0,hasBadge:!0}},l={tags:["autodocs","!dev"],args:{enlarge:!0,hasDescription:!0,horizontal:!0,hasDetails:!0}},c={tags:["autodocs","!dev"],args:{enlarge:!0,size:"sm",horizontal:!0,hasDetails:!0}},d={tags:["autodocs","!dev"],args:{enlarge:!0,title:"Télécharger le document XX",download:!0,hasDetails:!0,details:"Détail obligatoire (Extension - Poids - Langue)"}},u={tags:["autodocs","!dev"],args:{enlarge:!0,title:"Télécharger le document XX",actionMarkup:"button",download:!0,hasDescription:!0,description:"Description (optionnelle)",hasDetails:!0,details:"Détail obligatoire (Extension - Poids - Langue)"}},p={tags:["autodocs","!dev"],args:{enlarge:!0,horizontal:!0,verticalBreakpoint:"md",hasDescription:!0}},g={tags:["autodocs","!dev"],args:{actionMarkup:!1,noLink:!0}},m={tags:["autodocs","!dev"],args:{actionMarkup:!1,noLink:!0,horizontal:!0}};var h,b,y;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(y=(b=o.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var f,S,v;r.parameters={...r.parameters,docs:{...(f=r.parameters)==null?void 0:f.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    hasDescription: true,
    description: 'Description (optionnelle)'
  }
}`,...(v=(S=r.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};var D,k,z;n.parameters={...n.parameters,docs:{...(D=n.parameters)==null?void 0:D.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    size: 'sm',
    hasDescription: true,
    description: 'Description (optionnelle)',
    hasDetails: true
  }
}`,...(z=(k=n.parameters)==null?void 0:k.docs)==null?void 0:z.source}}};var T,w,L;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    hasTag: true
  }
}`,...(L=(w=i.parameters)==null?void 0:w.docs)==null?void 0:L.source}}};var x,B,M;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    hasBadge: true
  }
}`,...(M=(B=s.parameters)==null?void 0:B.docs)==null?void 0:M.source}}};var q,E,N;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    hasDescription: true,
    horizontal: true,
    hasDetails: true
  }
}`,...(N=(E=l.parameters)==null?void 0:E.docs)==null?void 0:N.source}}};var j,A,H;c.parameters={...c.parameters,docs:{...(j=c.parameters)==null?void 0:j.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    size: 'sm',
    horizontal: true,
    hasDetails: true
  }
}`,...(H=(A=c.parameters)==null?void 0:A.docs)==null?void 0:H.source}}};var X,P,R;d.parameters={...d.parameters,docs:{...(X=d.parameters)==null?void 0:X.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    title: 'Télécharger le document XX',
    download: true,
    hasDetails: true,
    details: 'Détail obligatoire (Extension - Poids - Langue)'
  }
}`,...(R=(P=d.parameters)==null?void 0:P.docs)==null?void 0:R.source}}};var V,W,_;u.parameters={...u.parameters,docs:{...(V=u.parameters)==null?void 0:V.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    title: 'Télécharger le document XX',
    actionMarkup: 'button',
    download: true,
    hasDescription: true,
    description: 'Description (optionnelle)',
    hasDetails: true,
    details: 'Détail obligatoire (Extension - Poids - Langue)'
  }
}`,...(_=(W=u.parameters)==null?void 0:W.docs)==null?void 0:_.source}}};var F,O,U;p.parameters={...p.parameters,docs:{...(F=p.parameters)==null?void 0:F.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    enlarge: true,
    horizontal: true,
    verticalBreakpoint: 'md',
    hasDescription: true
  }
}`,...(U=(O=p.parameters)==null?void 0:O.docs)==null?void 0:U.source}}};var I,C,G;g.parameters={...g.parameters,docs:{...(I=g.parameters)==null?void 0:I.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    actionMarkup: false,
    noLink: true
  }
}`,...(G=(C=g.parameters)==null?void 0:C.docs)==null?void 0:G.source}}};var Y,J,K;m.parameters={...m.parameters,docs:{...(Y=m.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    actionMarkup: false,
    noLink: true,
    horizontal: true
  }
}`,...(K=(J=m.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};const ie=["TileStory","DefaultStory","SizeSmStory","WithTagStory","WithBadgeStory","HorizontalStory","SizeSmHorizontalStory","DownloadStory","DownloadButtonStory","HorizontalVerticalFromMdStory","NoLinkStory","HorizontalNoLinkStory"];export{r as DefaultStory,u as DownloadButtonStory,d as DownloadStory,m as HorizontalNoLinkStory,l as HorizontalStory,p as HorizontalVerticalFromMdStory,g as NoLinkStory,c as SizeSmHorizontalStory,n as SizeSmStory,o as TileStory,s as WithBadgeStory,i as WithTagStory,ie as __namedExportsOrder,ne as default};
