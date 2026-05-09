import{r as k}from"./modal-CRznpJDZ.js";import{r as h}from"./button-DXzyz14T.js";import{u as o}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const x=`<ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left">
<li>
<button class="fr-btn fr-icon-checkbox-circle-line fr-btn--icon-left">Libellé bouton</button>
</li>
<li>
<button class="fr-btn fr-icon-checkbox-circle-line fr-btn--icon-left fr-btn--secondary">Libellé bouton</button>
</li>
</ul>`,A=`<p>Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et. Diam maecenas sed enim ut. Accumsan lacus vel facilisis volutpat est. Ut aliquam purus sit amet luctus. Lorem ipsum dolor sit amet consectetur adipiscing elit ut.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et. Diam maecenas sed enim ut. Accumsan lacus vel facilisis volutpat est. Ut aliquam purus sit amet luctus. Lorem ipsum dolor sit amet consectetur adipiscing elit ut.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et. Diam maecenas sed enim ut. Accumsan lacus vel facilisis volutpat est. Ut aliquam purus sit amet luctus. Lorem ipsum dolor sit amet consectetur adipiscing elit ut.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et. Diam maecenas sed enim ut. Accumsan lacus vel facilisis volutpat est. Ut aliquam purus sit amet luctus. Lorem ipsum dolor sit amet consectetur adipiscing elit ut.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et. Diam maecenas sed enim ut. Accumsan lacus vel facilisis volutpat est. Ut aliquam purus sit amet luctus. Lorem ipsum dolor sit amet consectetur adipiscing elit ut.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et. Diam maecenas sed enim ut. Accumsan lacus vel facilisis volutpat est. Ut aliquam purus sit amet luctus. Lorem ipsum dolor sit amet consectetur adipiscing elit ut.</p>`,M={id:{control:"text",description:"Identifiant unique de la modale",type:{value:"string",required:!0}},title:{control:"text",description:"Titre de la modale",type:{value:"string"}},icon:{control:"text",description:"Nom de l'icône associée au titre",type:{value:"string"}},size:{control:{type:"select"},description:"Taille de la modale",options:["sm","md","lg"]},top:{control:"boolean",description:"Positionnement de la modale en haut en mobile",type:{value:"string"}},concealingBackdrop:{control:"boolean",description:"Fermeture au clic à l'exterieur de la modale",type:{value:"boolean"}},markup:{control:{type:"select"},description:"Type de balise HTML",options:["div","dialog"]},footer:{control:"boolean",description:"Modale avec footer",type:{value:"boolean"}}},t={id:"modal-default",markup:"dialog",title:"Titre de la modale",size:"md",icon:"info-line",concealingBackdrop:!0,top:!1,footer:!1},D=e=>({id:e.id||t.id,markup:e.markup||t.markup,title:e.title||t.title,icon:e.icon||void 0,size:e.size||t.size,top:e.top||t.top,concealingBackdrop:e.concealingBackdrop,footer:e.footer===!0?x:void 0,body:A}),I=e=>h({button:{label:"Ouvrir la modale",attributes:{"aria-controls":e.id,"data-fr-opened":!1}}})+k({modal:D(e)}),_={id:"modal",title:"DSFR/Component/Modal",render:I,argTypes:M,args:t},i={tags:["!autodocs"],args:{id:o("modal")}},a={tags:["autodocs","!dev"],args:{id:o("modal"),size:"sm"}},s={tags:["autodocs","!dev"],args:{id:o("modal"),size:"md"}},r={tags:["autodocs","!dev"],args:{id:o("modal"),size:"lg"}},n={tags:["autodocs","!dev"],args:{id:o("modal"),size:"md",icon:"info-line",footer:!0}};var l,u,c;i.parameters={...i.parameters,docs:{...(l=i.parameters)==null?void 0:l.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {
    id: uniqueId('modal')
  }
}`,...(c=(u=i.parameters)==null?void 0:u.docs)==null?void 0:c.source}}};var d,m,p;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('modal'),
    size: 'sm'
  }
}`,...(p=(m=a.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var g,b,f;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('modal'),
    size: 'md'
  }
}`,...(f=(b=s.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var q,v,y;r.parameters={...r.parameters,docs:{...(q=r.parameters)==null?void 0:q.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('modal'),
    size: 'lg'
  }
}`,...(y=(v=r.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var S,z,L;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('modal'),
    size: 'md',
    icon: 'info-line',
    footer: true
  }
}`,...(L=(z=n.parameters)==null?void 0:z.docs)==null?void 0:L.source}}};const O=["ModalStory","SizeSmStory","SizeMdStory","SizeLgStory","FooterStory"];export{n as FooterStory,i as ModalStory,r as SizeLgStory,s as SizeMdStory,a as SizeSmStory,O as __namedExportsOrder,_ as default};
