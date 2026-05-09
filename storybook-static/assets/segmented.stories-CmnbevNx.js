import{u as F,e as O}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const P={size:{control:{type:"select"},description:"Taille du contrôle segmenté",options:["sm","md"]},legend:{control:"text",description:"Légende du contrôle segmenté",type:{value:"string"}},legendInline:{control:"boolean",description:"Si true, affiche la légende sur la même ligne que le contrôle segmenté",type:{value:"boolean"}},noLegend:{control:"boolean",description:"Si true, n'affiche pas la légende",type:{value:"boolean"}},hint:{control:"text",description:"Texte additionnel du contrôle segmenté",type:{value:"string"}},hasIcon:{control:"boolean",description:"Le contrôle segmenté a une icône"}},n=(e=3,s=!1)=>{const t=[],p=F("segmented");for(let o=1;o<=e;o++)t.push({checked:o===1,label:`libellé ${o}`,name:p,value:o,icon:"checkbox-circle-line",disabled:s&&o===3||!1,id:`${p}-${o}`});return t},u={size:"md",legend:"Légende",legendInline:!1,noLegend:!1,hint:void 0,hasIcon:!1,elements:n()},w=e=>{const s={size:e.size||u.size,legend:e.legend||u.legend,legendInline:e.legendInline||!1,noLegend:e.noLegend||!1,hint:e.hint!==""?e.hint||u.hint:void 0,elements:[...e.elements],id:e.id||void 0};for(let t=0;t<s.elements.length;t++)e.hasIcon?s.elements[t].icon=s.elements[t].icon||"checkbox-circle-line":s.elements[t].icon=void 0;return s},B=e=>O.render("segmented",e),G=e=>B({segmented:w(e)}),M={id:"segmented",title:"DSFR/Component/Segmented",render:G,argTypes:P,args:u},r={tags:["!autodocs"],args:{elements:n()}},a={tags:["autodocs","!dev"],args:{elements:n()}},d={tags:["autodocs","!dev"],args:{hasIcon:!0,elements:n()}},c={tags:["autodocs","!dev"],args:{size:"sm",elements:n()}},l={tags:["autodocs","!dev"],args:{legendInline:!0,elements:n()}},i={tags:["autodocs","!dev"],args:{hint:"Texte de description additionnel",elements:n()}},g={tags:["autodocs","!dev"],args:{noLegend:!0,elements:n()}},m={tags:["autodocs","!dev"],args:{elements:n(3,!0)}};var S,y,f;r.parameters={...r.parameters,docs:{...(S=r.parameters)==null?void 0:S.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {
    elements: getSegmentedData()
  }
}`,...(f=(y=r.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var h,v,I;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    elements: getSegmentedData()
  }
}`,...(I=(v=a.parameters)==null?void 0:v.docs)==null?void 0:I.source}}};var D,L,b;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hasIcon: true,
    elements: getSegmentedData()
  }
}`,...(b=(L=d.parameters)==null?void 0:L.docs)==null?void 0:b.source}}};var x,z,T;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    size: 'sm',
    elements: getSegmentedData()
  }
}`,...(T=(z=c.parameters)==null?void 0:z.docs)==null?void 0:T.source}}};var H,k,_;l.parameters={...l.parameters,docs:{...(H=l.parameters)==null?void 0:H.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    legendInline: true,
    elements: getSegmentedData()
  }
}`,...(_=(k=l.parameters)==null?void 0:k.docs)==null?void 0:_.source}}};var $,q,A;i.parameters={...i.parameters,docs:{...($=i.parameters)==null?void 0:$.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    hint: 'Texte de description additionnel',
    elements: getSegmentedData()
  }
}`,...(A=(q=i.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};var N,R,W;g.parameters={...g.parameters,docs:{...(N=g.parameters)==null?void 0:N.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    noLegend: true,
    elements: getSegmentedData()
  }
}`,...(W=(R=g.parameters)==null?void 0:R.docs)==null?void 0:W.source}}};var j,C,E;m.parameters={...m.parameters,docs:{...(j=m.parameters)==null?void 0:j.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    elements: getSegmentedData(3, true)
  }
}`,...(E=(C=m.parameters)==null?void 0:C.docs)==null?void 0:E.source}}};const Q=["SegmentedStory","DefaultStory","WithIconStory","SizeSmStory","LegendInlineStory","HintStory","NoLegendStory","HasDisabledStory"];export{a as DefaultStory,m as HasDisabledStory,i as HintStory,l as LegendInlineStory,g as NoLegendStory,r as SegmentedStory,c as SizeSmStory,d as WithIconStory,Q as __namedExportsOrder,M as default};
