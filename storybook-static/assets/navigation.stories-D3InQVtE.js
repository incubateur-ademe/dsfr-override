import{e as C,u as n}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const x=a=>C.render("navigation",a),E={id:{control:"text",description:"Attribut id de la navigation principale",type:{value:"string",required:!0}},ariaLabel:{control:"text",description:"Attribut aria-label de la navigation principale",type:{value:"string",required:!0}}},e=(a,m="link",p=!1)=>{const i={};switch(i.id=m==="link"?`navigation-item-${a}`:`navigation-${a}`,i.type=m,i.active=p,i.collapsable=m==="menu"||m==="mega-menu",i.collapseId=m==="menu"||m==="mega-menu"?`navigation-${a}`:void 0,m){case"link":i.label="Intitulé lien",i.href="#";break;case"menu":i.label="Intitulé menu";break;case"mega-menu":i.label="Intitulé mega menu",i.close="Fermer le menu",i.leader={title:"Titre éditorialisé",text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit.",link:{id:"link-leader-"+a,label:"Voir toute la rubrique",iconPlace:"right",icon:"arrow-right-line"}};break}return i},r={id:"header-navigation",ariaLabel:"Menu principal",items:[{...e("01","menu",!0),items:[e("01-1"),e("01-2","link",!0),e("01-3")]},e("02"),{...e("03","menu"),items:[e("03-1"),{...e("03-2","menu"),items:[e("03-2-1"),e("03-2-2"),e("03-2-3")]},e("03-3")]},{...e("04","mega-menu"),categories:[{label:"Catégorie 1",href:"#",items:[e("04-1-1","link"),e("04-1-2","link"),e("04-1-3","link")]},{label:"Catégorie 2",href:"#",items:[e("04-2-1","link"),e("04-2-2","link"),e("04-2-3","link")]},{label:"Catégorie 3",href:"#",items:[e("04-3-1","link"),e("04-3-2","link"),e("04-3-3","link")]},{label:"Catégorie 4",href:"#",items:[e("04-4-1","link"),e("04-4-2","link"),e("04-4-3","link")]}]}]},S=a=>({id:a.id||r.id,ariaLabel:a.ariaLabel||r.ariaLabel,items:a.items||r.items}),L=a=>x({navigation:S(a)}),N={id:"navigation",title:"DSFR/Component/Navigation",render:L,argTypes:E,args:r},t={tags:["!autodocs"],args:{}},s={tags:["autodocs","!dev"],args:{id:n("navigation-links"),items:[e(n("nav-links")),e(n("nav-links")),e(n("nav-links"),"link",!0),e(n("nav-links"))]}},u={tags:["autodocs","!dev"],args:{id:n("navigation-menus"),items:[{...e(n("nav-menus"),"menu",!0),items:[e(n("nav-menus")),e(n("nav-menus"),"link",!0),e(n("nav-menus"))]},{...e(n("nav-menus"),"menu"),items:[e(n("nav-menus")),e(n("nav-menus")),e(n("nav-menus"))]},{...e(n("nav-menus"),"menu"),items:[e(n("nav-menus")),{...e(n("nav-menus"),"menu"),items:[e(n("nav-menus")),e(n("nav-menus")),e(n("nav-menus"))]},e(n("nav-menus"))]}]}},g={tags:["autodocs","!dev"],args:{id:n("navigation-mega-menus"),items:[{...e(n("nav-mega-menus"),"mega-menu"),categories:[{label:"Catégorie 1",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 2",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 3",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 4",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]}]},{...e(n("nav-mega-menus"),"mega-menu",!0),categories:[{label:"Catégorie 1",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 2",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link",!0),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 3",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 4",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]}]},{...e(n("nav-mega-menus"),"mega-menu"),categories:[{label:"Catégorie 1",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 2",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 3",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]},{label:"Catégorie 4",href:"#",items:[e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link"),e(n("nav-mega-menus"),"link")]}]}]}};var l,o,v;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(v=(o=t.parameters)==null?void 0:o.docs)==null?void 0:v.source}}};var d,I,k;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('navigation-links'),
    items: [getItemArgs(uniqueId('nav-links')), getItemArgs(uniqueId('nav-links')), getItemArgs(uniqueId('nav-links'), 'link', true), getItemArgs(uniqueId('nav-links'))]
  }
}`,...(k=(I=s.parameters)==null?void 0:I.docs)==null?void 0:k.source}}};var c,q,A;u.parameters={...u.parameters,docs:{...(c=u.parameters)==null?void 0:c.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('navigation-menus'),
    items: [{
      ...getItemArgs(uniqueId('nav-menus'), 'menu', true),
      items: [getItemArgs(uniqueId('nav-menus')), getItemArgs(uniqueId('nav-menus'), 'link', true), getItemArgs(uniqueId('nav-menus'))]
    }, {
      ...getItemArgs(uniqueId('nav-menus'), 'menu'),
      items: [getItemArgs(uniqueId('nav-menus')), getItemArgs(uniqueId('nav-menus')), getItemArgs(uniqueId('nav-menus'))]
    }, {
      ...getItemArgs(uniqueId('nav-menus'), 'menu'),
      items: [getItemArgs(uniqueId('nav-menus')), {
        ...getItemArgs(uniqueId('nav-menus'), 'menu'),
        items: [getItemArgs(uniqueId('nav-menus')), getItemArgs(uniqueId('nav-menus')), getItemArgs(uniqueId('nav-menus'))]
      }, getItemArgs(uniqueId('nav-menus'))]
    }]
  }
}`,...(A=(q=u.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};var b,h,f;g.parameters={...g.parameters,docs:{...(b=g.parameters)==null?void 0:b.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('navigation-mega-menus'),
    items: [{
      ...getItemArgs(uniqueId('nav-mega-menus'), 'mega-menu'),
      categories: [{
        label: 'Catégorie 1',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 2',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 3',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 4',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }]
    }, {
      ...getItemArgs(uniqueId('nav-mega-menus'), 'mega-menu', true),
      categories: [{
        label: 'Catégorie 1',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 2',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link', true), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 3',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 4',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }]
    }, {
      ...getItemArgs(uniqueId('nav-mega-menus'), 'mega-menu'),
      categories: [{
        label: 'Catégorie 1',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 2',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 3',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }, {
        label: 'Catégorie 4',
        href: '#',
        items: [getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link'), getItemArgs(uniqueId('nav-mega-menus'), 'link')]
      }]
    }]
  }
}`,...(f=(h=g.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};const T=["NavigationStory","LinkStory","MenuStory","MegaMenuStory"];export{s as LinkStory,g as MegaMenuStory,u as MenuStory,t as NavigationStory,T as __namedExportsOrder,N as default};
