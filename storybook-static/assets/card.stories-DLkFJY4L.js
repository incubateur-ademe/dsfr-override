import{e as Fe}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const Re=e=>Fe.render("card",e),Ge={src:{control:"text",description:"Source de l'image",type:{value:"string"},table:{category:"header"}},alt:{control:"text",description:"L'alternative de l'image",type:{value:"string"},table:{category:"header"}}},Ne={id:{control:"text",description:"Attribut 'id' de la carte",type:{value:"string"},table:{category:"attributes"}},title:{control:"text",description:"Titre de la carte",type:{value:"string",required:!0},table:{category:"content"}},hasDescription:{control:"boolean",description:"Si true, ajoute une description à la carte",table:{category:"content"}},description:{if:{arg:"hasDescription",eq:!0},control:"text",description:"Description de la carte",type:{value:"string"},table:{category:"content"}},hasDetailStart:{control:{type:"boolean"},description:"Ajoute un texte de détail en haut de carte",table:{category:"details"}},detailStart:{if:{arg:"hasDetailStart",eq:!0},control:"text",description:"Texte de détail en haut de carte",type:{value:"string"},table:{category:"details"}},hasDetailStartIcon:{if:{arg:"hasDetailStart",eq:!0},control:"boolean",description:"Ajoute une icône dans le détail en haut de carte",table:{category:"details"}},detailStartIcon:{if:{arg:"hasDetailStartIcon",eq:!0},control:"text",description:"Icône du détail en haut de carte",type:{value:"string"},table:{category:"details"}},hasDetailEnd:{control:{type:"boolean"},description:"Ajoute un texte de détail en bas de la carte",table:{category:"details"}},detailEnd:{if:{arg:"hasDetailEnd",eq:!0},control:"text",description:"Texte de détail en bas de carte",type:{value:"string"},table:{category:"details"}},hasDetailEndIcon:{if:{arg:"hasDetailEnd",eq:!0},control:"boolean",description:"Ajoute une icône dans le détail en bas de la carte",table:{category:"details"}},detailEndIcon:{if:{arg:"hasDetailEndIcon",eq:!0},control:"text",description:"Icône du détail en bas de carte",type:{value:"string"},table:{category:"details"}},hasBadge:{if:{arg:"hasTag",eq:!1},control:"boolean",description:"Si true, ajoute des badges dans le contenu",table:{category:"details"}},hasTag:{if:{arg:"hasBadge",eq:!1},control:"boolean",description:"Si true, ajoute des tags dans le contenu",table:{category:"details"}},markup:{control:{type:"select"},description:"Niveau de titre de la carte (default: h3)",options:["h2","h3","h4","h5"],table:{category:"content"}},enlarge:{if:{arg:"actionMarkup",eq:"a"},control:"boolean",description:"Si true, agrandi la zone de clic à toute la carte",table:{category:"action"}},actionMarkup:{control:{type:"select"},description:"balise de l'actionneur du composant (a, button)",options:["a","button"],table:{category:"action"}},actionTitle:{control:"text",description:`Attribut title de l'actionneur. Si blank = true, il est obligatoire et doit reprendre le titre suivi de la mention "- nouvelle fenêtre"`,type:{value:"string"},table:{category:"attributes"}},href:{if:{arg:"actionMarkup",eq:"a"},control:"text",description:"URL de destination du lien",table:{category:"action"}},blank:{if:{arg:"actionMarkup",eq:"a"},control:"boolean",description:`Ajoute l'attribut target="_blank" pour ouvrir le lien dans une nouvelle fenêtre, nécessite l'ajout d'un attribut title "intitulé - nouvelle fenêtre"`,table:{category:"action"}},noLink:{if:{arg:"enlarge",eq:!1},control:"boolean",description:"Si true, absence d'actionneur",table:{category:"action"}},disabled:{control:"boolean",description:"Si true, retire le href du lien pour le désactiver ou ajoute l'attribut disabled sur le bouton",table:{category:"action"}},size:{control:{type:"select"},description:'Taille de la carte ("md" - default | "sm" | "lg").',options:["sm","md","lg"],table:{category:"size"}},horizontal:{control:"boolean",description:"Si true, passe la carte en mode horizontal",table:{category:"orientation"}},horizontalProportion:{if:{arg:"horizontal",eq:!0},control:{type:"select",labels:{default:"défaut",tier:"1 tier / 2 tiers",half:"moitié / moitié"}},description:"Proportion de l'image par rapport au contenu en horizontal (par défaut 40% / 60%)",options:["default","tier","half"],table:{category:"orientation"}},...Ge,hasHeaderBadge:{control:"boolean",description:"Si true, ajoute un badge dans l'en-tête",table:{category:"header"}},imageRatio:{if:{arg:"download",eq:!1},control:{type:"select"},description:"Ratio forcé de l'image",options:["default","32x9","3x2","4x3","1x1","3x4","2x3"],table:{category:"header"}},hasButtons:{if:{arg:"enlarge",eq:!1},control:"boolean",description:"Si true, ajoute des boutons au pied de la carte",table:{category:"footer"}},hasLinks:{if:{arg:"enlarge",eq:!1},control:"boolean",description:"Si true, ajoute des liens au pied de la carte",table:{category:"footer"}},variations:{control:{type:"select"},description:"Variations ésthétiques de la carte",options:["none","grey","no-border","no-background","shadow"],table:{category:"variations"}},download:{control:"boolean",description:"Si true, passe la carte en mode téléchargement",table:{category:"download"}},lang:{if:{arg:"download",eq:!0},control:"text",description:"Ajoute l'attribut hreflang au lien, pour définir la langue du document lié (Ex: 'fr')",table:{category:"download"}},assess:{if:{arg:"download",eq:!0},control:"boolean",description:'Si true, évaluation automatique des détails du fichier à télécharger (poids, format, etc.). <br>Testez avec href = "img/placeholder.16x9.png"',table:{category:"download"}},assessBytes:{if:{arg:"assess",eq:!0},control:"boolean",description:"Si true, change l'unité de mesure de l'évaluation automatique du poids en Bytes",table:{category:"download"}}},a={title:"Intitulé de la carte",hasDescription:!0,description:"Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et",hasDetailStart:!1,detailStart:"détail (optionnel)",hasDetailStartIcon:!1,detailStartIcon:"warning-fill",hasDetailEnd:!1,detailEnd:"détail (optionnel)",hasDetailEndIcon:!1,detailEndIcon:"warning-fill",markup:"h3",hasBadge:!1,hasTag:!1,enlarge:!0,actionMarkup:"a",href:"[URL - à modifier]",blank:!1,noLink:!1,disabled:!1,size:"md",horizontal:!1,src:"img/placeholder.16x9.png",alt:"[À MODIFIER - vide ou texte alternatif de l’image]",hasHeaderBadge:!1,imageRatio:"default",hasButtons:!1,hasLinks:!1,variations:"none",download:!1,lang:"",assess:!1,assessBytes:!1},Ve=e=>{const r={id:e.id||void 0,download:e.download||a.download,size:e.size||a.size,horizontalProportion:e.horizontalProportion||a.horizontalProportion,content:{title:e.title||a.title,description:e.hasDescription?e.description:void 0,markup:e.markup||a.markup,details:[],actionMarkup:e.actionMarkup||a.actionMarkup,actionTitle:e.actionTitle,href:e.href||a.href,blank:e.blank||a.blank,noLink:e.noLink||a.noLink,disabled:e.disabled||a.disabled,lang:e.lang||a.lang,assess:e.assess||a.assess,badgesGroup:e.hasBadge&&{badges:[{label:"Libellé badge",accent:"purple-glycine"},{label:"Libellé badge",accent:"purple-glycine"}]},tagsGroup:e.hasTag&&{tags:[{label:"Libellé tag"},{label:"Libellé tag"}]}},header:{badgesGroup:e.hasHeaderBadge&&{badges:[{label:"Libellé badge",accent:"purple-glycine"}]}}};return e.actionMarkup==="a"?r.enlarge=e.enlarge:r.enlarge=!0,e.hasDetailStart&&(r.content.details.push({label:e.detailStart,position:"start"}),e.hasDetailStartIcon&&(r.content.details[0].icon=e.detailStartIcon)),e.hasDetailEnd&&(r.content.details.push({label:e.detailEnd,position:"end"}),e.hasDetailEndIcon&&(r.content.details[r.content.details.length-1].icon=e.detailEndIcon)),!e.enlarge&&(e.hasButtons||e.hasLinks)&&(r.footer={buttonsGroup:e.hasButtons&&{buttons:[{label:"Libellé",kind:2},{label:"Libellé",kind:1}],reverse:!0,inline:"lg"},linksGroup:e.hasLinks&&{inline:!0,links:[...Array(2)].map(()=>({label:"Libellé",inline:!0,href:"#",icon:"arrow-right-line",iconPlace:"right"}))}}),e.image!==null&&(r.header.img={src:e.src||a.src,alt:e.alt||a.alt}),!e.download&&e.imageRatio!=="default"&&(r.header.img.ratio=e.imageRatio),e.horizontal&&(r.horizontal={},r.horizontal.proportion=e.horizontalProportion),e.variations!=="none"&&(r.variations=[e.variations]),e.assessBytes===!0&&(r.content.assess="bytes"),r},Ce=e=>Re({card:Ve(e)}),t=e=>e.map(r=>Ce(r)).join(`

`),Ue={id:"card",title:"DSFR/Component/Card",render:Ce,argTypes:Ne,args:a},o={args:{}},n={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,size:"sm",description:"Description (optionnelle)"}])},s={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,size:"md",description:"Description (optionnelle)"}])},i={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,size:"lg",description:"Description (optionnelle)"}])},d={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,description:"Description (optionnelle)"}])},l={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,horizontal:!0,hasTag:!0}])},c={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,size:"sm",horizontal:!0,hasTag:!0}])},u={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,size:"md",horizontal:!0,hasTag:!0}])},p={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,size:"lg",horizontal:!0,hasTag:!0}])},g={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,horizontal:!0,horizontalProportion:"tier",hasBadge:!0}])},m={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,horizontal:!0,horizontalProportion:"half",hasBadge:!0}])},h={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,title:"Télécharger le document XX",download:!0,detailEnd:"Détail obligatoire (Extension - Poids - Langue)"}])},b={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,title:"Télécharger le document XX",actionMarkup:"button",download:!0,description:"Description (optionnelle)",detailEnd:"Détail obligatoire (Extension - Poids - Langue)"}])},y={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,title:"Télécharger le document XX",description:"Les détails du document (format, poids) sont injectés en js automatiquement",download:!0,href:"img/placeholder.16x9.pdf",assess:!0,detailEnd:"PDF"}])},f={tags:["autodocs","!dev"],render:()=>t([{enlarge:!0,title:"Télécharger le document XX",description:"Les détails du document (format, poids, langue) sont injectés en js automatiquement et le poids est en Bytes",download:!0,lang:"en",href:"img/placeholder.16x9.pdf",assess:"bytes",detailLabel:"PDF"}])},S={tags:["autodocs","!dev"],render:()=>t([{hasButtons:!0}])},v={tags:["autodocs","!dev"],render:()=>t([{hasLinks:!0}])},z={tags:["autodocs","!dev"],render:()=>t([{variations:"grey"}])},D={tags:["autodocs","!dev"],render:()=>t([{variations:"no-border"}])},x={tags:["autodocs","!dev"],parameters:{docs:{description:{story:"Fonctionne avec une classe utilitaire de background sur un parent pour propager la couleur sur le hover et le clic.<br> Exemple : `fr-background--alt-orange-terre-battue`"}}},render:()=>t([{variations:"no-background"}])},k={tags:["autodocs","!dev"],render:()=>t([{variations:"shadow"}])},E={tags:["autodocs","!dev"],render:()=>t([{disabled:!0,description:"Description (optionnelle)"}])};var L,w,T;o.parameters={...o.parameters,docs:{...(L=o.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {}
}`,...(T=(w=o.parameters)==null?void 0:w.docs)==null?void 0:T.source}}};var q,B,j;n.parameters={...n.parameters,docs:{...(q=n.parameters)==null?void 0:q.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    size: 'sm',
    description: 'Description (optionnelle)'
  }])
}`,...(j=(B=n.parameters)==null?void 0:B.docs)==null?void 0:j.source}}};var A,P,I;s.parameters={...s.parameters,docs:{...(A=s.parameters)==null?void 0:A.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    size: 'md',
    description: 'Description (optionnelle)'
  }])
}`,...(I=(P=s.parameters)==null?void 0:P.docs)==null?void 0:I.source}}};var H,M,X;i.parameters={...i.parameters,docs:{...(H=i.parameters)==null?void 0:H.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    size: 'lg',
    description: 'Description (optionnelle)'
  }])
}`,...(X=(M=i.parameters)==null?void 0:M.docs)==null?void 0:X.source}}};var C,F,R;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    description: 'Description (optionnelle)'
  }])
}`,...(R=(F=d.parameters)==null?void 0:F.docs)==null?void 0:R.source}}};var G,N,V;l.parameters={...l.parameters,docs:{...(G=l.parameters)==null?void 0:G.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    horizontal: true,
    hasTag: true
  }])
}`,...(V=(N=l.parameters)==null?void 0:N.docs)==null?void 0:V.source}}};var _,O,U;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    size: 'sm',
    horizontal: true,
    hasTag: true
  }])
}`,...(U=(O=c.parameters)==null?void 0:O.docs)==null?void 0:U.source}}};var J,K,Q;u.parameters={...u.parameters,docs:{...(J=u.parameters)==null?void 0:J.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    size: 'md',
    horizontal: true,
    hasTag: true
  }])
}`,...(Q=(K=u.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var W,Y,Z;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    size: 'lg',
    horizontal: true,
    hasTag: true
  }])
}`,...(Z=(Y=p.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var $,ee,te;g.parameters={...g.parameters,docs:{...($=g.parameters)==null?void 0:$.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    horizontal: true,
    horizontalProportion: 'tier',
    hasBadge: true
  }])
}`,...(te=(ee=g.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var re,ae,oe;m.parameters={...m.parameters,docs:{...(re=m.parameters)==null?void 0:re.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    horizontal: true,
    horizontalProportion: 'half',
    hasBadge: true
  }])
}`,...(oe=(ae=m.parameters)==null?void 0:ae.docs)==null?void 0:oe.source}}};var ne,se,ie;h.parameters={...h.parameters,docs:{...(ne=h.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    title: 'Télécharger le document XX',
    download: true,
    detailEnd: 'Détail obligatoire (Extension - Poids - Langue)'
  }])
}`,...(ie=(se=h.parameters)==null?void 0:se.docs)==null?void 0:ie.source}}};var de,le,ce;b.parameters={...b.parameters,docs:{...(de=b.parameters)==null?void 0:de.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    title: 'Télécharger le document XX',
    actionMarkup: 'button',
    download: true,
    description: 'Description (optionnelle)',
    detailEnd: 'Détail obligatoire (Extension - Poids - Langue)'
  }])
}`,...(ce=(le=b.parameters)==null?void 0:le.docs)==null?void 0:ce.source}}};var ue,pe,ge;y.parameters={...y.parameters,docs:{...(ue=y.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    title: 'Télécharger le document XX',
    description: 'Les détails du document (format, poids) sont injectés en js automatiquement',
    download: true,
    href: 'img/placeholder.16x9.pdf',
    assess: true,
    detailEnd: 'PDF'
  }])
}`,...(ge=(pe=y.parameters)==null?void 0:pe.docs)==null?void 0:ge.source}}};var me,he,be;f.parameters={...f.parameters,docs:{...(me=f.parameters)==null?void 0:me.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    enlarge: true,
    title: 'Télécharger le document XX',
    description: 'Les détails du document (format, poids, langue) sont injectés en js automatiquement et le poids est en Bytes',
    download: true,
    lang: 'en',
    href: 'img/placeholder.16x9.pdf',
    assess: 'bytes',
    detailLabel: 'PDF'
  }])
}`,...(be=(he=f.parameters)==null?void 0:he.docs)==null?void 0:be.source}}};var ye,fe,Se;S.parameters={...S.parameters,docs:{...(ye=S.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    hasButtons: true
  }])
}`,...(Se=(fe=S.parameters)==null?void 0:fe.docs)==null?void 0:Se.source}}};var ve,ze,De;v.parameters={...v.parameters,docs:{...(ve=v.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    hasLinks: true
  }])
}`,...(De=(ze=v.parameters)==null?void 0:ze.docs)==null?void 0:De.source}}};var xe,ke,Ee;z.parameters={...z.parameters,docs:{...(xe=z.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    variations: 'grey'
  }])
}`,...(Ee=(ke=z.parameters)==null?void 0:ke.docs)==null?void 0:Ee.source}}};var Le,we,Te;D.parameters={...D.parameters,docs:{...(Le=D.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    variations: 'no-border'
  }])
}`,...(Te=(we=D.parameters)==null?void 0:we.docs)==null?void 0:Te.source}}};var qe,Be,je;x.parameters={...x.parameters,docs:{...(qe=x.parameters)==null?void 0:qe.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story: 'Fonctionne avec une classe utilitaire de background sur un parent pour propager la couleur sur le hover et le clic.<br> Exemple : \`fr-background--alt-orange-terre-battue\`'
      }
    }
  },
  render: () => renders([{
    variations: 'no-background'
  }])
}`,...(je=(Be=x.parameters)==null?void 0:Be.docs)==null?void 0:je.source}}};var Ae,Pe,Ie;k.parameters={...k.parameters,docs:{...(Ae=k.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    variations: 'shadow'
  }])
}`,...(Ie=(Pe=k.parameters)==null?void 0:Pe.docs)==null?void 0:Ie.source}}};var He,Me,Xe;E.parameters={...E.parameters,docs:{...(He=E.parameters)==null?void 0:He.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    disabled: true,
    description: 'Description (optionnelle)'
  }])
}`,...(Xe=(Me=E.parameters)==null?void 0:Me.docs)==null?void 0:Xe.source}}};const Je=["CardStory","SizeSmStory","SizeMdStory","SizeLgStory","VerticalStory","HorizontalStory","HorizontalSmStory","HorizontalMdStory","HorizontalLgStory","HorizontalTierStory","HorizontalHalfStory","DownloadStory","DownloadButtonStory","DownloadAssessFileStory","DownloadAssessFileEnglishStory","ActionButtonsStory","ActionLinksStory","GreyCardStory","NoBorderCardStory","NoBackgroundCardStory","ShadowedCardStory","DisabledStory"];export{S as ActionButtonsStory,v as ActionLinksStory,o as CardStory,E as DisabledStory,f as DownloadAssessFileEnglishStory,y as DownloadAssessFileStory,b as DownloadButtonStory,h as DownloadStory,z as GreyCardStory,m as HorizontalHalfStory,p as HorizontalLgStory,u as HorizontalMdStory,c as HorizontalSmStory,l as HorizontalStory,g as HorizontalTierStory,x as NoBackgroundCardStory,D as NoBorderCardStory,k as ShadowedCardStory,i as SizeLgStory,s as SizeMdStory,n as SizeSmStory,d as VerticalStory,Je as __namedExportsOrder,Ue as default};
