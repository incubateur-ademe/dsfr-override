import{a as M}from"./link-CddyzMJy.js";import{l as e,a as c}from"./link-arg-types-ByTAq21D.js";import"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const L={size:{...c.size},id:{control:"text",description:"Attribut 'id' du groupe de liens",table:{category:"attributes"}},hasIcon:{...c.hasIcon,table:void 0},iconPlace:{if:{arg:"hasIcon",eq:!0},...c.iconPlace,table:void 0},inline:{control:"boolean",description:"Groupe de liens en ligne"}},C={size:e.size,hasIcon:e.hasIcon,iconPlace:e.iconPlace,inline:!1,id:"",links:[{label:e.label+" 1",disabled:!1,icon:!1},{label:e.label+" 2",disabled:!1,icon:!1},{label:e.label+" 3",disabled:!1,icon:!1}]},F=l=>{const n={size:l.size,id:l.id||void 0,inline:l.inline,links:l.links};return l.hasIcon&&(n.iconPlace=l.iconPlace),n},I=l=>M({linksGroup:F(l)}),d=l=>l.map(n=>I(n)).join(`

`),X={id:"links-group",title:"DSFR/Component/Link/Links-Group",render:I,argTypes:L,args:C},a={tags:["!autodocs"],args:{}},r={tags:["autodocs","!dev"],render:()=>d([{size:"sm",links:[{label:e.label+" 1"},{label:e.label+" 2"},{label:e.label+" 3"}]}])},s={tags:["autodocs","!dev"],render:()=>d([{size:"md",links:[{label:e.label+" 1"},{label:e.label+" 2"},{label:e.label+" 3"}]}])},o={tags:["autodocs","!dev"],render:()=>d([{size:"lg",links:[{label:e.label+" 1"},{label:e.label+" 2"},{label:e.label+" 3"}]}])},t={tags:["autodocs","!dev"],render:()=>d([{links:[{label:e.label+" 1",href:"https://www.example.com/document.pdf",download:!0,detail:"PDF – 1,2 Mo"},{label:e.label+" 2",href:"https://www.example.com/document.docx",download:!0,detail:"DOCX – 500 ko"},{label:e.label+" 3",href:"https://www.example.com/document.zip",download:!0,detail:"ZIP – 2,5 Mo"}]}])},i={tags:["autodocs","!dev"],args:{inline:!0}};var u,p,b;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(b=(p=a.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var m,g,k;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    size: 'sm',
    links: [{
      label: linkArgs.label + ' 1'
    }, {
      label: linkArgs.label + ' 2'
    }, {
      label: linkArgs.label + ' 3'
    }]
  }])
}`,...(k=(g=r.parameters)==null?void 0:g.docs)==null?void 0:k.source}}};var S,w,f;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    size: 'md',
    links: [{
      label: linkArgs.label + ' 1'
    }, {
      label: linkArgs.label + ' 2'
    }, {
      label: linkArgs.label + ' 3'
    }]
  }])
}`,...(f=(w=s.parameters)==null?void 0:w.docs)==null?void 0:f.source}}};var z,h,A;o.parameters={...o.parameters,docs:{...(z=o.parameters)==null?void 0:z.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    size: 'lg',
    links: [{
      label: linkArgs.label + ' 1'
    }, {
      label: linkArgs.label + ' 2'
    }, {
      label: linkArgs.label + ' 3'
    }]
  }])
}`,...(A=(h=o.parameters)==null?void 0:h.docs)==null?void 0:A.source}}};var y,G,x;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    links: [{
      label: linkArgs.label + ' 1',
      href: 'https://www.example.com/document.pdf',
      download: true,
      detail: 'PDF – 1,2 Mo'
    }, {
      label: linkArgs.label + ' 2',
      href: 'https://www.example.com/document.docx',
      download: true,
      detail: 'DOCX – 500 ko'
    }, {
      label: linkArgs.label + ' 3',
      href: 'https://www.example.com/document.zip',
      download: true,
      detail: 'ZIP – 2,5 Mo'
    }]
  }])
}`,...(x=(G=t.parameters)==null?void 0:G.docs)==null?void 0:x.source}}};var P,v,D;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    inline: true
  }
}`,...(D=(v=i.parameters)==null?void 0:v.docs)==null?void 0:D.source}}};const Z=["LinksGroupStory","SizeSMStory","SizeMDStory","SizeLGStory","DownloadStory","HorizontalStory"];export{t as DownloadStory,i as HorizontalStory,a as LinksGroupStory,o as SizeLGStory,s as SizeMDStory,r as SizeSMStory,Z as __namedExportsOrder,X as default};
