import{e as k,u as I}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const y=t=>k.render("sidemenu",t),v={hasTitle:{control:"boolean",description:"Si true, ajoute un titre au menu latéral"},title:{if:{arg:"hasTitle",eq:!0},control:"text",description:"Titre du menu latéral",type:{value:"string",required:!0}},modifier:{control:{type:"select",labels:{default:"Défaut",sticky:"Sticky",right:"Aligné à droite","sticky-full-height":"Sticky et sur toute la hauteur"}},description:"Modifier de style de sidemenu",options:["default","sticky","right","sticky-full-height"]},buttonLabel:{control:"text",description:"Titre du bouton accordéon en mobile",type:{value:"string",required:!0}}},e=(t,s="link",b=!1)=>{const r={};return r.id=s==="link"?`sidemenu-item-${t}`:`sidemenu-${t}`,r.label=`Titre du lien ${t}`,r.href=s==="link"&&"#",r.type=s,r.active=b,r.isCollapsible=s==="menu",r.collapseId=s==="menu"?`sidemenu-${t}`:void 0,r},o={hasTitle:!0,title:"Titre de rubrique",buttonLabel:"Dans cette rubrique",modifier:"default",items:[{...e(1,"menu",!0),items:[e("1-1"),e("1-2","link",!0),e("1-3")]},e(2),{...e(3,"menu"),items:[e("3-1"),{...e("3-2","menu"),items:[e("3-2-1"),e("3-2-2"),e("3-2-3")]},e("3-3")]}]},A=t=>{const s={title:t.hasTitle?t.title:void 0,titleId:t.titleId||"sidemenu-title",buttonLabel:t.buttonLabel||o.buttonLabel,collapseId:t.collapseId||I("sidemenu-collapse"),items:t.items||o.items};return t.modifier!=="default"&&(s.modifier=t.modifier),s},h=t=>y({sidemenu:A(t)}),q={id:"sidemenu",title:"DSFR/Component/Sidemenu",render:h,argTypes:v,args:o},i={tags:["autodocs"],args:{}},n={tags:["autodocs","!dev"],args:{items:[e("01"),e("02","link",!0),e("03")]}},u={tags:["autodocs","!dev"],args:{items:[{...e("sous-niveau 01","menu",!0),items:[e("1-1"),e("1-2","link",!0),e("1-3")]},e("sous-niveau 02"),e("sous-niveau 03")]}};var a,d,m;i.parameters={...i.parameters,docs:{...(a=i.parameters)==null?void 0:a.docs,source:{originalSource:`{
  tags: ['autodocs'],
  args: {}
}`,...(m=(d=i.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var l,c,g;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    items: [getItemArgs('01'), getItemArgs('02', 'link', true), getItemArgs('03')]
  }
}`,...(g=(c=n.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};var p,S,f;u.parameters={...u.parameters,docs:{...(p=u.parameters)==null?void 0:p.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    items: [{
      ...getItemArgs('sous-niveau 01', 'menu', true),
      items: [getItemArgs('1-1'), getItemArgs('1-2', 'link', true), getItemArgs('1-3')]
    }, getItemArgs('sous-niveau 02'), getItemArgs('sous-niveau 03')]
  }
}`,...(f=(S=u.parameters)==null?void 0:S.docs)==null?void 0:f.source}}};const x=["SidemenuStory","LinkSidemenuStory","SubmenuSidemenuStory"];export{n as LinkSidemenuStory,i as SidemenuStory,u as SubmenuSidemenuStory,x as __namedExportsOrder,q as default};
