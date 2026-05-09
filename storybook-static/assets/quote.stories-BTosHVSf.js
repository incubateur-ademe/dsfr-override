import{e as j}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const w=e=>j.render("quote",e),z={hasImage:{control:"boolean",description:"Si true, ajoute une image à la citation",table:{category:"Image"}},src:{if:{arg:"hasImage",eq:!0},control:"text",description:"Source de l'image",type:{value:"string"},table:{category:"Image"}},alt:{if:{arg:"hasImage",eq:!0},control:"text",description:"L'alternative de l'image doit rester vide car l'image est illustrative et ne doit pas être restituée aux technologies d’assistance)",type:{value:"string"},table:{category:"Image"}}},O={accent:{control:{type:"select"},description:"Couleur d'accentuation de la citation",options:["défaut","green-tilleul-verveine","green-bourgeon","green-emeraude","green-menthe","green-archipel","blue-ecume","blue-cumulus","purple-glycine","pink-macaron","pink-tuile","yellow-tournesol","yellow-moutarde","orange-terre-battue","brown-cafe-creme","brown-caramel","brown-opera","beige-gris-galet"],table:{category:"variant"}}},R={text:{control:"text",description:"Texte de la citation",type:{value:"string",required:!0}},size:{control:{type:"select"},description:"Taille du texte de citation",options:["md","lg","xl"]},hasAuthor:{control:"boolean",description:"Si true, ajoute un auteur à la citation",table:{category:"Author"}},author:{if:{arg:"hasAuthor",eq:!0},control:"text",description:"Nom de l'auteur",type:{value:"string"},table:{category:"Author"}},hasDetails:{control:"boolean",description:"Si true, ajoute des textes de détail à la citation",table:{category:"Sources"}},sources:{if:{arg:"hasDetails",eq:!0},control:"object",description:"Tableau des textes de détail",type:{value:"array"},table:{category:"Sources"}},...z,...O},t={text:"Lorem [...] elit ut.",size:"md",hasAuthor:!0,author:"Auteur",hasImage:!0,src:"img/placeholder.1x1.png",alt:"",hasDetails:!0,sources:["<cite>Ouvrage</cite>","Détail 1","Détail 2","Détail 3",'<a target="_blank" rel="noopener external" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="[À MODIFIER | Lien vers la sources ou des infos complémentaires]">Détail 4</a>'],accent:"défaut"},E=e=>{const r={text:e.text||t.text,size:e.size||t.size,href:"[À MODIFIER | https://lien-vers-la-source.fr || supprimer l'attribut si pas d'url pour la source]"};return e.hasAuthor&&(r.author=e.author||t.author),e.hasDetails&&(r.sources=e.sources||t.sources),e.accent!=="défaut"&&(r.accent=e.accent||t.accent),e.hasImage&&(r.image={src:e.src||t.src,alt:e.alt||t.alt}),r},F=e=>w({quote:E(e)}),k={id:"quote",title:"DSFR/Component/Quote",render:F,argTypes:R,args:t},a={tags:["!autodocs"],args:{}},o={tags:["autodocs","!dev"],args:{}},s={tags:["autodocs","!dev"],args:{hasAuthor:!1}},c={tags:["autodocs","!dev"],args:{sources:[]}},n={tags:["autodocs","!dev"],args:{hasImage:!1}},u={tags:["autodocs","!dev"],args:{accent:"green-menthe"}};var i,l,d;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(d=(l=a.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var g,p,m;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {}
}`,...(m=(p=o.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var h,y,S;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasAuthor: false
  }
}`,...(S=(y=s.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var f,v,b;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    sources: []
  }
}`,...(b=(v=c.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};var x,I,A;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasImage: false
  }
}`,...(A=(I=n.parameters)==null?void 0:I.docs)==null?void 0:A.source}}};var D,q,T;u.parameters={...u.parameters,docs:{...(D=u.parameters)==null?void 0:D.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    accent: 'green-menthe'
  }
}`,...(T=(q=u.parameters)==null?void 0:q.docs)==null?void 0:T.source}}};const L=["QuoteStory","DefaultStory","AuthorlessStory","SourcelessStory","ImagelessStory","AccentStory"];export{u as AccentStory,s as AuthorlessStory,o as DefaultStory,n as ImagelessStory,a as QuoteStory,c as SourcelessStory,L as __namedExportsOrder,k as default};
