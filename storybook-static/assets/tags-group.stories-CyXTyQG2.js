import{t as u,a as c,c as P}from"./tag-arg-types-DVwVtffX.js";import{u as _}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const q={size:{...c.size,description:"Taille des tags dans le groupe"},type:{...c.type,description:"Type des tags dans le groupe",table:void 0},groupMarkup:{control:{type:"select"},description:"Type de balise HTML pour la liste du groupe de tags",options:["div","ul"]},hasIcon:{if:{arg:"type",neq:"dismissible"},control:"boolean",description:"Si true, ajoute une icone dans le titre des onglets"}},t=(e=3)=>{const s=[];for(let a=1;a<=e;a++)s.push({label:`${u.label} ${a}`,accent:"défaut",size:"md",href:"[URL - à modifier]",icon:"arrow-right-line",pressed:!1,blank:!1,title:void 0,disabled:!1,id:_("tag-group")});return s},r={size:u.size,type:u.type,groupMarkup:"ul",hasIcon:!1,tags:t()},w=e=>{const s={size:e.size||r.size,type:e.type||r.type,groupMarkup:e.groupMarkup||r.groupMarkup,tags:e.tags||r.tags};for(const a of s.tags)a.type=e.type;for(let a=0;a<s.tags.length;a++)e.hasIcon?s.tags[a].icon=s.tags[a].icon||"arrow-right-line":s.tags[a].icon=void 0;return s},L=e=>P({tagsGroup:w(e)}),E={id:"tags-group",title:"DSFR/Component/Tag/Tags-Group",render:L,argTypes:q,args:r},o={tags:["!autodocs"],args:{type:"default"}},n={tags:["autodocs","!dev"],args:{size:"md",type:"default",tags:t()}},g={tags:["autodocs","!dev"],args:{size:"sm",type:"default",tags:t()}},p={tags:["autodocs","!dev"],args:{type:"clickable",tags:t()}},i={tags:["autodocs","!dev"],args:{type:"pressable",tags:t().map((e,s)=>(s===1&&(e.pressed=!0),e))}},d={tags:["autodocs","!dev"],args:{type:"dismissible",tags:t()}};var l,m,y;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {
    type: 'default'
  }
}`,...(y=(m=o.parameters)==null?void 0:m.docs)==null?void 0:y.source}}};var f,S,T;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'md',
    type: 'default',
    tags: getTagsData()
  }
}`,...(T=(S=n.parameters)==null?void 0:S.docs)==null?void 0:T.source}}};var b,z,G;g.parameters={...g.parameters,docs:{...(b=g.parameters)==null?void 0:b.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'sm',
    type: 'default',
    tags: getTagsData()
  }
}`,...(G=(z=g.parameters)==null?void 0:z.docs)==null?void 0:G.source}}};var v,k,D;p.parameters={...p.parameters,docs:{...(v=p.parameters)==null?void 0:v.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'clickable',
    tags: getTagsData()
  }
}`,...(D=(k=p.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};var h,M,x;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'pressable',
    tags: getTagsData().map((tag, index) => {
      if (index === 1) {
        tag.pressed = true;
      }
      return tag;
    })
  }
}`,...(x=(M=i.parameters)==null?void 0:M.docs)==null?void 0:x.source}}};var A,I,C;d.parameters={...d.parameters,docs:{...(A=d.parameters)==null?void 0:A.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    type: 'dismissible',
    tags: getTagsData()
  }
}`,...(C=(I=d.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};const F=["TagsGroupStory","SizeMdStory","SizeSmStory","TagsGroupClickableStory","TagsGroupPressableStory","TagsGroupDismissibleStory"];export{n as SizeMdStory,g as SizeSmStory,p as TagsGroupClickableStory,d as TagsGroupDismissibleStory,i as TagsGroupPressableStory,o as TagsGroupStory,F as __namedExportsOrder,E as default};
