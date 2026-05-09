import{e as I,u as a}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const T={status:{control:{type:"select",labels:{default:"Défaut",error:"Erreur",valid:"Succès"}},description:"Statut du message",options:["default","error","valid"],type:{value:"string"},table:{category:"message"}},errorMessage:{if:{arg:"status",eq:"error"},control:"text",description:"Texte du message d'erreur",type:{value:"string"},table:{category:"message"}},validMessage:{if:{arg:"status",eq:"valid"},control:"text",description:"Texte du message de succès",type:{value:"string"},table:{category:"message"}}},E={id:{control:"text",description:"Attribut id de l'ajout de fichier",type:{value:"string",required:!0},table:{category:"attributes"}},label:{control:"text",description:"Libellé de l'ajout de fichier",type:{value:"string",required:!0}},name:{control:"text",description:"Attribut name de l'ajout de fichier",type:{value:"string"},table:{category:"attributes"}},hint:{control:"text",description:"Texte additionnel de l'ajout de fichier. Donne des informations sur les formats acceptés, la taille maximale, etc.",type:{value:"string",required:!0}},disabled:{control:"boolean",description:"Désactive l'ajout de fichier",type:{value:"boolean"}},multiple:{control:"boolean",description:"Active la selection multiple de fichiers [defaut: false]",type:{value:"boolean"}},...T},t={label:"libellé de l'ajout de fichier",hint:"Indication : taille maximale : 500 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles. Lorem ipsum dolor sit amet, consectetur adipiscing.",disabled:!1,multiple:!1,status:"default",errorMessage:"Format de fichier non supporté",validMessage:"Fichier correctement ajouté",id:"upload-id",name:"upload"},F=e=>({id:e.id||t.id,label:e.label||t.label,name:e.name||t.name,hint:e.hint!==""?e.hint||t.hint:void 0,disabled:e.disabled||t.disabled,multiple:e.multiple||t.multiple,inline:e.inline||!1,status:e.status||t.status,error:e.status==="error"?e.errorMessage||t.errorMessage:void 0,valid:e.status==="valid"?e.validMessage||t.validMessage:void 0}),U=e=>I.render("upload",e),_=e=>U({upload:F(e)}),V={id:"upload",title:"DSFR/Component/Upload",render:_,argTypes:E,args:t},r={tags:["!autodocs"],args:{}},s={tags:["autodocs","!dev"],args:{id:a("upload")}},o={tags:["autodocs","!dev"],args:{id:a("upload"),multiple:!0,label:"Ajouter des fichiers"}},d={tags:["autodocs","!dev"],args:{id:a("upload"),disabled:!0}},i={tags:["autodocs","!dev"],args:{id:a("upload"),status:"error"}},l={tags:["autodocs","!dev"],args:{id:a("upload"),status:"valid"}};var u,n,c;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(c=(n=r.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var p,m,g;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('upload')
  }
}`,...(g=(m=s.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var b,f,v;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('upload'),
    multiple: true,
    label: 'Ajouter des fichiers'
  }
}`,...(v=(f=o.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var y,S,h;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('upload'),
    disabled: true
  }
}`,...(h=(S=d.parameters)==null?void 0:S.docs)==null?void 0:h.source}}};var x,j,q;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('upload'),
    status: 'error'
  }
}`,...(q=(j=i.parameters)==null?void 0:j.docs)==null?void 0:q.source}}};var M,A,D;l.parameters={...l.parameters,docs:{...(M=l.parameters)==null?void 0:M.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('upload'),
    status: 'valid'
  }
}`,...(D=(A=l.parameters)==null?void 0:A.docs)==null?void 0:D.source}}};const C=["UploadStory","DefaultStory","MultipleStory","DisabledStory","ErrorStory","ValidStory"];export{s as DefaultStory,d as DisabledStory,i as ErrorStory,o as MultipleStory,r as UploadStory,l as ValidStory,C as __namedExportsOrder,V as default};
