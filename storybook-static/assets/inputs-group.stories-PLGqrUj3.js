import{a}from"./input-arg-types-zaCPfvie.js";import{f as s,a as b}from"./form-arg-types-BB7YawXK.js";import{u as n}from"./renderer-BO3bJSWJ.js";import{r as j}from"./fieldset-BA-83frp.js";import"./_commonjsHelpers-Cpj98o6Y.js";const O={id:{...b.id,type:{value:"string"}},legend:{...b.legend,description:"Légende de l’ensemble des inputs"},hint:{...a.hint,description:"Texte additionnel sous la légende"},inline:{...b.inline},disabled:{...a.disabled,description:"Désactive l’ensemble des inputs"},status:{...a.status},errorMessage:{...a.errorMessage},validMessage:{...a.validMessage},inputs:{control:{type:"object"},description:"Liste des inputs",type:{value:"array"}}},B={legend:"Légende pour l’ensemble des éléments",hint:s.hint,disabled:s.disabled,inline:s.inline,status:"default",errorMessage:"Texte d’erreur",validMessage:"Texte de succès",inputs:[{id:n("input"),label:"Label 1",name:"input1",hint:"Texte d’aide",disabled:!1},{id:n("input"),label:"Label 2",name:"input2",hint:"Texte d’aide",disabled:!1},{id:n("input"),label:"Label 3",name:"input3",hint:"Texte d’aide",disabled:!1}],id:s.id},H=e=>({id:e.id||void 0,legend:e.legend,disabled:e.disabled,hint:e.hint!==""?e.hint||s.hint:void 0,choice:!0,status:e.status||s.status,error:e.status==="error"?e.errorMessage||s.errorMessage:void 0,valid:e.status==="valid"?e.validMessage||s.validMessage:void 0,elements:e.inputs.map((t,i)=>({type:"input",inline:e.inline||t.inline,grow:t.grow,modifier:t.modifier,data:{label:t.label,id:t.id,name:t.name,hint:t.hint,disabled:t.disabled}}))}),J=e=>j({fieldset:H(e)}),Y={id:"inputs-group",title:"DSFR/Component/Input/Inputs-Group",render:J,argTypes:O,args:B},r=(e,f=3)=>{const t=[];for(let i=0;i<f;i++)t.push({label:`Libellé ${i}`,id:`${e}-${i}`,name:`input${i}`,hint:"",disabled:!1});return t},u={tags:["!autodocs"],args:{inputs:r(n("input"))}},o={tags:["autodocs","!dev"],args:{inputs:r(n("input"))}},d={tags:["autodocs","!dev"],args:{inline:!0,inputs:r(n("input"))}},p={tags:["autodocs","!dev"],parameters:{docs:{description:{story:"Passe en inline à partir du breakpoint MD"}}},args:{inline:"md",inputs:r(n("input"))}},l={tags:["autodocs","!dev"],parameters:{docs:{description:{story:"Il existe plusieurs modificateurs de tailles : <br> - `fr-fieldset__element--inline-grow` : grandit au maximum <br> - `fr-fieldset__element--number` : taille d'un petit nombre (80px) <br> - `fr-fieldset__element--postal` : taille d'un code postal (240px) <br> - `fr-fieldset__element--year` : taille d'une année (112px)"}}},args:{inputs:[{id:`input-${n("input")}-0`,label:"Numéro",name:"street-number",modifier:"number",inline:!0},{id:`input-${n("input")}-1`,label:"Rue",name:"street-name",inline:!0,grow:!0},{id:`input-${n("input")}-2`,label:"Code postal",name:"street-name",modifier:"postal"},{id:`input-${n("input")}-3`,label:"Année",name:"year",modifier:"year"}],elementsType:"input"}},m={tags:["autodocs","!dev"],args:{disabled:!0,inputs:r(n("input"))}},c={tags:["autodocs","!dev"],args:{status:"error",inputs:r(n("input"))}},g={tags:["autodocs","!dev"],args:{status:"valid",inputs:r(n("input"))}};var y,S,v;u.parameters={...u.parameters,docs:{...(y=u.parameters)==null?void 0:y.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {
    inputs: inputsData(uniqueId('input'))
  }
}`,...(v=(S=u.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};var x,I,_;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    inputs: inputsData(uniqueId('input'))
  }
}`,...(_=(I=o.parameters)==null?void 0:I.docs)==null?void 0:_.source}}};var D,h,M;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    inline: true,
    inputs: inputsData(uniqueId('input'))
  }
}`,...(M=(h=d.parameters)==null?void 0:h.docs)==null?void 0:M.source}}};var G,q,T;p.parameters={...p.parameters,docs:{...(G=p.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
    inputs: inputsData(uniqueId('input'))
  }
}`,...(T=(q=p.parameters)==null?void 0:q.docs)==null?void 0:T.source}}};var $,A,E;l.parameters={...l.parameters,docs:{...($=l.parameters)==null?void 0:$.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story: 'Il existe plusieurs modificateurs de tailles : <br> - \`fr-fieldset__element--inline-grow\` : grandit au maximum <br> - \`fr-fieldset__element--number\` : taille d\\'un petit nombre (80px) <br> - \`fr-fieldset__element--postal\` : taille d\\'un code postal (240px) <br> - \`fr-fieldset__element--year\` : taille d\\'une année (112px)'
      }
    }
  },
  args: {
    inputs: [{
      id: \`input-\${uniqueId('input')}-0\`,
      label: 'Numéro',
      name: 'street-number',
      modifier: 'number',
      inline: true
    }, {
      id: \`input-\${uniqueId('input')}-1\`,
      label: 'Rue',
      name: 'street-name',
      inline: true,
      grow: true
    }, {
      id: \`input-\${uniqueId('input')}-2\`,
      label: 'Code postal',
      name: 'street-name',
      modifier: 'postal'
    }, {
      id: \`input-\${uniqueId('input')}-3\`,
      label: 'Année',
      name: 'year',
      modifier: 'year'
    }],
    elementsType: 'input'
  }
}`,...(E=(A=l.parameters)==null?void 0:A.docs)==null?void 0:E.source}}};var L,w,P;m.parameters={...m.parameters,docs:{...(L=m.parameters)==null?void 0:L.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    disabled: true,
    inputs: inputsData(uniqueId('input'))
  }
}`,...(P=(w=m.parameters)==null?void 0:w.docs)==null?void 0:P.source}}};var C,R,k;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    status: 'error',
    inputs: inputsData(uniqueId('input'))
  }
}`,...(k=(R=c.parameters)==null?void 0:R.docs)==null?void 0:k.source}}};var z,F,N;g.parameters={...g.parameters,docs:{...(z=g.parameters)==null?void 0:z.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    status: 'valid',
    inputs: inputsData(uniqueId('input'))
  }
}`,...(N=(F=g.parameters)==null?void 0:F.docs)==null?void 0:N.source}}};const Z=["InputsGroupStory","DefaultGroupStory","InlineGroupStory","InlineMDStory","SizeModifiersStory","DisabledStory","ErrorStory","SuccessStory"];export{o as DefaultGroupStory,m as DisabledStory,c as ErrorStory,d as InlineGroupStory,p as InlineMDStory,u as InputsGroupStory,l as SizeModifiersStory,g as SuccessStory,Z as __namedExportsOrder,Y as default};
