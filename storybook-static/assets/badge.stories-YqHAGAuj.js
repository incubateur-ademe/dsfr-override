import{b as L,a as M,r as T,c as j}from"./badge-arg-types-BggA2urd.js";import"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const D=c=>T({badge:j(c)}),u=c=>c.map(_=>D(_)).join(`

`),P={id:"badge",title:"DSFR/Component/Badge",render:D,argTypes:M,args:L},s={tags:["!autodocs"],args:{}},t={tags:["autodocs","!dev"],args:{}},e={tags:["autodocs","!dev"],args:{size:"sm"}},a={tags:["autodocs","!dev"],render:()=>u([{type:"status",status1:"success"},{type:"status",status:"warning"},{type:"status",status:"error"},{type:"status",status:"info"},{type:"status",status:"new"}])},r={tags:["autodocs","!dev"],render:()=>u([{type:"status",status:"success",hasNoIcon:!0},{type:"status",status:"warning",hasNoIcon:!0},{type:"status",status:"error",hasNoIcon:!0},{type:"status",status:"info",hasNoIcon:!0},{type:"status",status:"new",hasNoIcon:!0}])},o={tags:["autodocs","!dev"],render:()=>u([{type:"accent",accent:"green-menthe"}])},n={tags:["autodocs","!dev"],render:()=>u([{ellipsis:!0,label:"Libellé très long qui sera tronqué lorem ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus sit amet luctus"}])};var d,p,i;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(i=(p=s.parameters)==null?void 0:p.docs)==null?void 0:i.source}}};var g,m,l;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {}
}`,...(l=(m=t.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};var y,S,h;e.parameters={...e.parameters,docs:{...(y=e.parameters)==null?void 0:y.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'sm'
  }
}`,...(h=(S=e.parameters)==null?void 0:S.docs)==null?void 0:h.source}}};var v,I,N;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    type: 'status',
    status1: 'success'
  }, {
    type: 'status',
    status: 'warning'
  }, {
    type: 'status',
    status: 'error'
  }, {
    type: 'status',
    status: 'info'
  }, {
    type: 'status',
    status: 'new'
  }])
}`,...(N=(I=a.parameters)==null?void 0:I.docs)==null?void 0:N.source}}};var b,f,w;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    type: 'status',
    status: 'success',
    hasNoIcon: true
  }, {
    type: 'status',
    status: 'warning',
    hasNoIcon: true
  }, {
    type: 'status',
    status: 'error',
    hasNoIcon: true
  }, {
    type: 'status',
    status: 'info',
    hasNoIcon: true
  }, {
    type: 'status',
    status: 'new',
    hasNoIcon: true
  }])
}`,...(w=(f=r.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};var q,E,x;o.parameters={...o.parameters,docs:{...(q=o.parameters)==null?void 0:q.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    type: 'accent',
    accent: 'green-menthe'
  }])
}`,...(x=(E=o.parameters)==null?void 0:E.docs)==null?void 0:x.source}}};var z,A,B;n.parameters={...n.parameters,docs:{...(z=n.parameters)==null?void 0:z.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renders([{
    ellipsis: true,
    label: 'Libellé très long qui sera tronqué lorem ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus sit amet luctus'
  }])
}`,...(B=(A=n.parameters)==null?void 0:A.docs)==null?void 0:B.source}}};const R=["BadgeStory","DefaultStory","SizeSMStory","StatusStory","StatusNoIconStory","AccentStory","EllipsisStory"];export{o as AccentStory,s as BadgeStory,t as DefaultStory,n as EllipsisStory,e as SizeSMStory,r as StatusNoIconStory,a as StatusStory,R as __namedExportsOrder,P as default};
