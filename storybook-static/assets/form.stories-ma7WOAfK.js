import{e as P,u as t}from"./renderer-BO3bJSWJ.js";import{f as k,a as z,b as n,c as N}from"./form-arg-types-BB7YawXK.js";import"./_commonjsHelpers-Cpj98o6Y.js";const V=e=>P.render("form",e),h=e=>P.render("message",e),B=e=>V({form:N(e)}),G=e=>h({message:e}),H=e=>e.map(j=>G(j)).join(`

`),Q={id:"form",title:"DSFR/Component/Form",render:B,argTypes:z,args:k},r={tags:["!autodocs"],args:{}},s={tags:["autodocs","!dev"],args:{elementsType:"input",inputsData:n("input",t("input"))}},a={tags:["autodocs","!dev"],args:{inline:!0,elementsType:"input",inputsData:n("input",t("input"))}},i={tags:["autodocs","!dev"],parameters:{docs:{description:{story:"Passe en inline à partir du breakpoint MD"}}},args:{inline:"md",elementsType:"input",inputsData:n("input",t("input"))}},o={tags:["autodocs","!dev"],parameters:{docs:{description:{story:"Il existe plusieurs modificateurs de tailles : <br> - `fr-fieldset__element--inline-grow` : grandit au maximum <br> - `fr-fieldset__element--number` : taille d'un petit nombre (80px) <br> - `fr-fieldset__element--postal` : taille d'un code postal (240px) <br> - `fr-fieldset__element--year` : taille d'une année (112px)"}}},args:{inputsData:[{id:`input-${t("input")}-1`,label:"Numéro",name:"street-number",modifier:"number",inline:!0},{id:`input-${t("input")}-2`,label:"Rue",name:"street-name",inline:!0,grow:!0},{id:`input-${t("input")}-3`,label:"Code postal",name:"street-name",modifier:"postal"},{id:`input-${t("input")}-4`,label:"Année",name:"year",modifier:"year"}],elementsType:"input"}},u={tags:["autodocs","!dev"],args:{elementsType:"input",inputsData:n("input",t("input")),status:"valid"}},d={tags:["autodocs","!dev"],args:{elementsType:"input",inputsData:n("input",t("input")),status:"error"}},p={tags:["autodocs","!dev"],render:()=>H([{type:"error",text:"Message d'erreur"},{type:"warning",text:"Message d'avertissement"},{type:"info",text:"Message d'information"},{type:"valid",text:"Message de succès"}])};var m,l,c;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {}
}`,...(c=(l=r.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var g,y,f;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    elementsType: 'input',
    inputsData: fieldsetElementsData('input', uniqueId('input'))
  }
}`,...(f=(y=s.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var S,b,x;a.parameters={...a.parameters,docs:{...(S=a.parameters)==null?void 0:S.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    inline: true,
    elementsType: 'input',
    inputsData: fieldsetElementsData('input', uniqueId('input'))
  }
}`,...(x=(b=a.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var D,v,M;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story: 'Passe en inline à partir du breakpoint MD'
      }
    }
  },
  args: {
    inline: 'md',
    elementsType: 'input',
    inputsData: fieldsetElementsData('input', uniqueId('input'))
  }
}`,...(M=(v=i.parameters)==null?void 0:v.docs)==null?void 0:M.source}}};var _,I,E;o.parameters={...o.parameters,docs:{...(_=o.parameters)==null?void 0:_.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story: 'Il existe plusieurs modificateurs de tailles : <br> - \`fr-fieldset__element--inline-grow\` : grandit au maximum <br> - \`fr-fieldset__element--number\` : taille d\\'un petit nombre (80px) <br> - \`fr-fieldset__element--postal\` : taille d\\'un code postal (240px) <br> - \`fr-fieldset__element--year\` : taille d\\'une année (112px)'
      }
    }
  },
  args: {
    inputsData: [{
      id: \`input-\${uniqueId('input')}-1\`,
      label: 'Numéro',
      name: 'street-number',
      modifier: 'number',
      inline: true
    }, {
      id: \`input-\${uniqueId('input')}-2\`,
      label: 'Rue',
      name: 'street-name',
      inline: true,
      grow: true
    }, {
      id: \`input-\${uniqueId('input')}-3\`,
      label: 'Code postal',
      name: 'street-name',
      modifier: 'postal'
    }, {
      id: \`input-\${uniqueId('input')}-4\`,
      label: 'Année',
      name: 'year',
      modifier: 'year'
    }],
    elementsType: 'input'
  }
}`,...(E=(I=o.parameters)==null?void 0:I.docs)==null?void 0:E.source}}};var T,q,$;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    elementsType: 'input',
    inputsData: fieldsetElementsData('input', uniqueId('input')),
    status: 'valid'
  }
}`,...($=(q=u.parameters)==null?void 0:q.docs)==null?void 0:$.source}}};var w,F,A;d.parameters={...d.parameters,docs:{...(w=d.parameters)==null?void 0:w.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    elementsType: 'input',
    inputsData: fieldsetElementsData('input', uniqueId('input')),
    status: 'error'
  }
}`,...(A=(F=d.parameters)==null?void 0:F.docs)==null?void 0:A.source}}};var O,R,C;p.parameters={...p.parameters,docs:{...(O=p.parameters)==null?void 0:O.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  render: () => renderOnlyMessages([{
    type: 'error',
    text: 'Message d\\'erreur'
  }, {
    type: 'warning',
    text: 'Message d\\'avertissement'
  }, {
    type: 'info',
    text: 'Message d\\'information'
  }, {
    type: 'valid',
    text: 'Message de succès'
  }])
}`,...(C=(R=p.parameters)==null?void 0:R.docs)==null?void 0:C.source}}};const U=["FormStory","DefaultStory","InlineStory","InlineMDStory","SizeModifiersStory","ValidStory","ErrorStory","MessagesStandaloneStory"];export{s as DefaultStory,d as ErrorStory,r as FormStory,i as InlineMDStory,a as InlineStory,p as MessagesStandaloneStory,o as SizeModifiersStory,u as ValidStory,U as __namedExportsOrder,Q as default};
