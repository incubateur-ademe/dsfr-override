import{e as ve,u as r}from"./renderer-BO3bJSWJ.js";import"./_commonjsHelpers-Cpj98o6Y.js";const Se=e=>ve.render("table-wrapper",e),ye=`
  <p class='fr-table__detail'>Nombre de lignes sélectionnées</p>
`,_e=`
  <ul
      class='fr-btns-group fr-btns-group--right fr-btns-group--inline-md fr-btns-group--icon-left'
  >
      <li>
          <button
              id='table-header-button-primary-7842'
              class='fr-btn fr-icon-settings-5-line fr-btn--icon-left fr-btn--secondary'
          >
              Action groupée
          </button>
      </li>
      <li>
          <button
              id='table-header-button-secondary-7843'
              class='fr-btn fr-icon-settings-5-line fr-btn--icon-left fr-btn--secondary'
          >
              Action groupée
          </button>
      </li>
  </ul>
`,ke=`
  <fieldset class='fr-segmented fr-segmented--no-legend'>
      <legend class='fr-segmented__legend'>Type d&#39;affichage</legend>
      <div class='fr-segmented__elements'>
          <div class='fr-segmented__element'>
              <input
                  value='1'
                  checked
                  type='radio'
                  id='table-header-segmented-table-7845'
                  name='table-header-segmented-table'
              />
              <label
                  class='fr-icon-table-line fr-label'
                  for='table-header-segmented-table-7845'
              >
                  Tableau
              </label>
          </div>
          <div class='fr-segmented__element'>
              <input
                  value='2'
                  type='radio'
                  id='table-header-segmented-list-7846'
                  name='table-header-segmented-table'
              />
              <label
                  class='fr-icon-list-unordered fr-label'
                  for='table-header-segmented-list-7846'
              >
                  Liste
              </label>
          </div>
      </div>
  </fieldset>
`,we=`
  <div class="fr-search-bar">
    <label class="fr-label" for="table-search-input">
        Rechercher
    </label>
    <input class="fr-input" aria-describedby="table-search-input-messages" placeholder="Rechercher" id="table-search-input" type="search">
    <div class="fr-messages-group" id="table-search-input-messages" aria-live="polite">
    </div>
    <button title="Rechercher dans les lignes du tableau" type="button" class="fr-btn">Rechercher</button>
  </div>
`,Te=`
  <div class='fr-table__footer--start'>
      <p class='fr-table__detail'>215 lignes</p>
      <div class='fr-select-group'>
          <label class='fr-sr-only fr-label' for='table-footer-select-7847'>
              Nombre de lignes par page
          </label>
          <select class='fr-select' aria-describedby='table-footer-select-7847-messages' id='table-footer-select-7847' name='table-footer-select-7847'>
              <option value='' selected disabled hidden>Nombre de lignes par page</option>
              <option value='4'>4 lignes par page</option>
              <option value='10'>10 lignes par page</option>
              <option value='20'>20 lignes par page</option>
          </select>
          <div class='fr-messages-group' id='table-footer-select-7847-messages' aria-live='polite'>
          </div>
      </div>
  </div>
`,qe=`
  <div class='fr-table__footer--middle'>
      <nav role='navigation' class='fr-pagination' aria-label='Pagination' data-fr-analytics-page-total='3'>
          <ul class='fr-pagination__list'>
              <li>
                  <a class='fr-pagination__link fr-pagination__link--first' id='table-footer-pagination-7851' title='Première page' aria-disabled='true' role='link'>
                      Première page
                  </a>
              </li>
              <li>
                  <a class='fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label' id='table-footer-pagination-7852' title='Précédente' aria-disabled='true' role='link'>
                      Précédente
                  </a>
              </li>
              <li>
                  <a class='fr-pagination__link' id='table-footer-pagination-7848' aria-current='page' title='Page 1'>
                      1
                  </a>
              </li>
              <li>
                  <a class='fr-pagination__link' id='table-footer-pagination-7849' href='#' title='Page 2'>
                      2
                  </a>
              </li>
              <li>
                  <a class='fr-pagination__link fr-hidden fr-unhidden-lg' id='table-footer-pagination-7850' href='#' title='Page 3'>
                      3
                  </a>
              </li>
              <li>
                  <a class='fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label' id='table-footer-pagination-7853' href='#' title='Suivante'>
                      Suivante
                  </a>
              </li>
              <li>
                  <a class='fr-pagination__link fr-pagination__link--last' id='table-footer-pagination-7854' href='#' title='Dernière page'>
                      Dernière page
                  </a>
              </li>
          </ul>
      </nav>
  </div>
`,Ae=`
  <div class='fr-table__footer--end'>
      <ul class='fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-md'>
          <li>
              <button id='table-footer-button-primary-7855' class='fr-btn'>Action tableau</button>
          </li>
          <li>
              <button id='table-footer-button-secondary-7856' class='fr-btn fr-btn--secondary'>Action tableau</button>
          </li>
      </ul>
  </div>
`,he='<span class="fr-sr-only">Sélectionner</span>',T=(e,t=!1)=>`
    <div class='fr-checkbox-group fr-checkbox-group--sm'>
        <input name='row-select' id='table-select-checkbox--${e}' type='checkbox' ${t?"checked":""}>
        <label class='fr-label' for='table-select-checkbox--${e}'>
            Sélectionner la ligne ${e+1}
        </label>
    </div>
  `,Le={caption:{control:"text",description:"Titre du tableau",type:{value:"string",required:!0},table:{category:"caption"}},captionDetail:{control:"text",description:"Description précise du tableau",type:{value:"string"},table:{category:"caption"}},noCaption:{control:"boolean",description:"Cache le texte de la caption",table:{category:"caption"}},captionBottom:{if:{arg:"noCaption",eq:!1},control:"boolean",description:"Positionne la caption en bas",table:{category:"caption"}},bordered:{control:"boolean",description:"ajoute des séparateurs entre chaque ligne",table:{category:"variant"}},noScroll:{control:"boolean",description:"Désactive le scroll horizontal",table:{category:"variant"}},multiline:{control:"boolean",description:"Active le mode multi-lignes pour les cellules du tableau",table:{category:"variant"}},size:{control:{type:"select"},description:"Taille des espacements du tableau",options:["sm","md","lg"],table:{category:"variant"}},hasHeader:{control:"boolean",description:"Affiche un exemple d'en-tête du tableau",table:{category:"header"}},hasHeaderSegmented:{if:{arg:"hasHeader",eq:!0},control:"boolean",description:"Affiche un contrôle segmenté dans l'en-tête du tableau",table:{category:"header"}},hasHeaderSearch:{if:{arg:"hasHeader",eq:!0},control:"boolean",description:"Affiche une barre de recherche dans l'en-tête du tableau",table:{category:"header"}},hasHeaderDetails:{if:{arg:"hasHeader",eq:!0},control:"boolean",description:"Affiche un detail dans l'en-tête du tableau",table:{category:"header"}},hasHeaderButtons:{if:{arg:"hasHeader",eq:!0},control:"boolean",description:"Affiche des boutons d'actions dans l'en-tête du tableau",table:{category:"header"}},hasFooter:{control:"boolean",description:"Affiche un exemple de pied de page du tableau",table:{category:"footer"}},hasFooterSelect:{if:{arg:"hasFooter",eq:!0},control:"boolean",description:"Affiche le nombre d'éléments par page dans le pied de page du tableau",table:{category:"footer"}},hasFooterPagination:{if:{arg:"hasFooter",eq:!0},control:"boolean",description:"Affiche la pagination dans le pied de page du tableau",table:{category:"footer"}},hasFooterButtons:{if:{arg:"hasFooter",eq:!0},control:"boolean",description:"Affiche des boutons d'actions dans le pied de page du tableau",table:{category:"footer"}},table:{control:"object",description:"contenu du tableau",type:{value:"array"},table:{category:"table"}}},i=(e=4,t=4)=>{const a="Lorem ipsum dolor sit ame",o=Array.from(Array(1),()=>[]),s=Array.from(Array(t),()=>[]);for(let l=0;l<t;l++)for(let w=0;w<e;w++)l===0&&o[0].push({content:"th"+w}),s[l].push({content:a});return{thead:o,tbodies:[s]}},xe=(e=void 0)=>{const t=i(),a=e?`@${e}`:"";return t.thead.forEach(o=>{o.unshift({attributes:{role:"columnheader"},classes:[`fr-cell--fixed${a}`]})}),t.tbodies.forEach(o=>{o.forEach((s,l)=>{s.unshift({markup:"th",attributes:{scope:"row"},classes:[`fr-cell--fixed${a}`],content:`th${l}`})})}),t},Fe=()=>{const e=i(),t=["xs","sm","md","lg"];return e.thead.forEach(a=>{a.forEach((o,s)=>{const l=`fr-col--${t[s]}`;o.content=l,o.attributes={class:l}})}),e.tbodies.forEach(a=>{a.forEach(o=>{o.forEach(s=>{s.content="Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua."})})}),e},Ce=()=>{const e=i();return e.thead.forEach(t=>{t.unshift({attributes:{role:"columnheader"},classes:["fr-cell--fixed"],content:he})}),e.tbodies.forEach(t=>{t.forEach((a,o)=>{a.unshift({markup:"th",attributes:{scope:"row"},classes:["fr-cell--fixed"],content:T(o)})})}),e},He=()=>{const e=i();return e.thead.forEach(t=>{t.unshift({attributes:{role:"columnheader"},classes:["fr-cell--fixed"],content:he})}),e.tbodies.forEach(t=>{t.forEach((a,o)=>{a.unshift({markup:"th",attributes:{scope:"row"},classes:["fr-cell--fixed"],content:T(o)})})}),e.tbodies[0][1][0].content=T(1,!0),e},Ee=()=>({thead:[[{attributes:{role:"columnheader",rowspan:2,id:"complex-thead-0-col-0"},classes:["fr-cell--fixed"],content:"Horaires"},{content:"Lundi",attributes:{id:"complex-thead-0-col-1"}},{content:"Mardi",attributes:{id:"complex-thead-0-col-2"}},{attributes:{colspan:2,id:"complex-thead-0-col-3"},content:"Mercredi & Jeudi<br>Exemple de 2 cellules fusionnées dans le Header"},{content:"Vendredi",attributes:{id:"complex-thead-0-col-4"}}],[{attributes:{headers:"complex-thead-0-col-1",id:"complex-thead-1-col-0"},content:"Groupes 1 & 2"},{attributes:{headers:"complex-thead-0-col-2",id:"complex-thead-1-col-1"},content:"Groupes 1 & 2"},{attributes:{headers:"complex-thead-0-col-3",id:"complex-thead-1-col-2"},content:"Groupe 1"},{attributes:{headers:"complex-thead-0-col-3",id:"complex-thead-1-col-3"},content:"Groupe 2"},{attributes:{headers:"complex-thead-0-col-4",id:"complex-thead-1-col-4"},content:"Groupes 1 & 2"}]],tbodies:[[[{markup:"th",attributes:{id:"complex-row-0",headers:"complex-thead-0-col-0"},classes:["fr-cell--fixed"],content:"8h"},{attributes:{headers:"complex-row-0 complex-thead-0-col-1 complex-thead-1-col-1"},content:"Français"},{attributes:{headers:"complex-row-0 complex-thead-0-col-2 complex-thead-1-col-2"},content:"Mathématiques"},{attributes:{headers:"complex-row-0 complex-thead-0-col-3 complex-thead-1-col-3"},content:"LV1"},{attributes:{headers:"complex-row-0 complex-thead-0-col-3 complex-thead-1-col-4"},content:"Histoire - Géographie"},{attributes:{headers:"complex-row-0 complex-thead-0-col-4 complex-thead-1-col-4"},content:"EPS"}],[{markup:"th",attributes:{id:"complex-row-1",headers:"complex-thead-0-col-0"},classes:["fr-cell--fixed"],content:"9h"},{attributes:{colspan:5,headers:"complex-row-1 complex-thead-0-col-1 complex-thead-0-col-2 complex-thead-0-col-3 complex-thead-0-col-4 complex-thead-1-col-1 complex-thead-1-col-2 complex-thead-1-col-3 complex-thead-1-col-4 complex-thead-1-col-4"},content:"Etude dirigée Exemple de colspan sur toute la ligne"}],[{markup:"th",attributes:{id:"complex-row-2",headers:"complex-thead-0-col-0"},classes:["fr-cell--fixed"],content:"10h"},{attributes:{headers:"complex-row-2 complex-thead-0-col-1 complex-thead-1-col-1"},content:"Mathématiques"},{attributes:{headers:"complex-row-2 complex-thead-0-col-2 complex-thead-1-col-2"},content:"Histoire - Géographie"},{attributes:{rowspan:2,headers:"complex-row-2 complex-row-3 complex-thead-0-col-3 complex-thead-1-col-3"},content:"Arts appliqués"},{attributes:{headers:"complex-row-2 complex-thead-0-col-3 complex-thead-1-col-4"},content:"LV2"},{attributes:{headers:"complex-row-2 complex-thead-0-col-4 complex-thead-1-col-4"},content:"Sciences"}],[{markup:"th",attributes:{id:"complex-row-3",headers:"complex-thead-0-col-0"},classes:["fr-cell--fixed"],content:"11h"},{attributes:{headers:"complex-row-3 complex-thead-0-col-1 complex-thead-1-col-1"},content:"Français"},{attributes:{headers:"complex-row-3 complex-thead-0-col-2 complex-thead-1-col-2"},content:"EPS"},{attributes:{headers:"complex-row-3 complex-thead-0-col-3 complex-thead-1-col-4"},content:"Histoire - Géographie"},{attributes:{headers:"complex-row-3 complex-thead-0-col-4 complex-thead-1-col-4"},content:"Physique - Chimie"}],[{markup:"th",attributes:{id:"complex-row-4",headers:"complex-thead-0-col-0"},classes:["fr-cell--fixed"],content:"12h"},{attributes:{headers:"complex-row-4 complex-thead-0-col-1 complex-thead-1-col-1"},content:"Sciences"},{attributes:{headers:"complex-row-4 complex-thead-0-col-2 complex-thead-1-col-2"},content:"LV1"},{attributes:{colspan:2,headers:"complex-row-4 complex-thead-0-col-3 complex-thead-1-col-3 complex-thead-1-col-4"},content:"EPS Exemple de colspan sur 2 cellules"},{attributes:{headers:"complex-row-4 complex-thead-0-col-4 complex-thead-1-col-4"},content:"LV2"}]]]}),De=()=>({thead:[[{attributes:{role:"columnheader"},classes:["fr-cell--fixed"],content:'<span class="fr-sr-only">Sélectionner</span>'},{content:'<span class="fr-cell__title">Titre par défaut</span>'},{content:'<div class="fr-cell__title">Titre par défaut</div><div class="fr-cell__desc">Texte par défaut</div>'},{content:'<div class="fr-cell--sort"><span class="fr-cell__title">Titre par défaut</span> <button type="button" id="table-miscellaneous-thead-sort-asc-desc" class="fr-btn--sort fr-btn fr-btn--sm">Trier</button></div>'},{attributes:{"aria-sort":"descending"},content:'<button type="button" id="table-miscellaneous-thead-sort-descending" class="fr-btn--sort-desc fr-btn fr-btn--sm">Trier</button>'},{content:'<span class="fr-cell__desc">Texte par défaut</span> <button aria-describedby="table-miscellaneous-thead-tooltip" type="button" id="table-default-button-3" class="fr-ml-2v fr-btn--tooltip fr-btn fr-btn--sm">Texte par défaut</button><span class="fr-tooltip fr-placement" id="table-miscellaneous-thead-tooltip" role="tooltip">Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et. Diam maecenas sed enim ut. Accumsan lacus vel facilisis volutpat est. Ut aliquam purus sit amet luctus. Lorem ipsum dolor sit amet consectetur adipiscing elit ut.</span>'},{attributes:{"aria-sort":"ascending"},content:'<button type="button" id="table-miscellaneous-thead-sort-ascending" class="fr-btn--sort-asc fr-btn fr-btn--sm">Trier</button>'},{content:'<p id="table-miscellaneous-thead-badge"  class="fr-badge fr-badge--info">Libellé par défaut</p>'},{content:'<span class="fr-cell__desc">Texte par défaut</span>'},{content:'<span class="fr-cell__title">Titre par défaut</span>'},{content:'<span class="fr-cell__title">Titre par défaut</span><span class="fr-cell__desc fr-ml-2v">Texte par défaut</span>'},{content:'<span class="fr-icon-arrow-right-s-line fr-icon--sm" aria-hidden="true"></span>Texte par défaut'}]],tbodies:[[[{markup:"th",attributes:{scope:"row"},classes:["fr-cell--fixed"],content:'<div class="fr-checkbox-group fr-checkbox-group--sm"><input name="row-select" checked="true" id="table-miscellaneous-select-row-checkbox-1" type="checkbox"><label class="fr-label" for="table-miscellaneous-select-row-checkbox-1">  Sélectionner la ligne 1 : Titre par défaut  </label></div><span class="fr-cell__title">Titre par défaut</span>'},{content:"Texte par défaut"},{content:'<p class="fr-mb-2v fr-badge fr-badge--sm fr-badge--info">Libellé par défaut</p><div class="fr-cell__title fr-mb-2v">Titre par défaut</div><div class="fr-cell__desc">Texte par défaut</div>'},{content:'<p class="fr-mr-2v fr-badge fr-badge--sm fr-badge--success">Libellé par défaut</p>Texte par défaut'},{content:"Texte par défaut"},{content:'<div class="fr-input-group" id="input-group-6"><label class="fr-label" for="text-input-text-1"></label><input class="fr-input" aria-describedby="text-input-text-1-messages" id="text-input-text-1"  type="text"><div class="fr-messages-group" id="text-input-text-1-messages" aria-live="polite"></div></div>'},{content:"30,00&nbsp;€"},{content:'<p class="fr-badge fr-badge--info">Libellé par défaut</p>'},{content:'<button type="button" id="table-default-button-7"  class="fr-btn fr-btn--sm fr-btn--secondary">Libellé bouton</button>'},{content:'<a class="fr-tag" href="#">Libellé par défaut</a>'},{content:'<a id="link-8" download="true" href="/example/img/image.jpg"  class="fr-link fr-link--download">Lien de Téléchargement <span class="fr-link__detail">JPG – 61,88 Ko</span></a>'},{content:'<svg aria-hidden="true" class="fr-artwork" viewBox="0 0 80 80" width="80px" height="80px"><use class="fr-artwork-decorative" href="../../../dist/artwork/pictograms/environment/leaf.svg#artwork-decorative"></use><use class="fr-artwork-minor" href="../../../dist/artwork/pictograms/environment/leaf.svg#artwork-minor"></use><use class="fr-artwork-major" href="../../../dist/artwork/pictograms/environment/leaf.svg#artwork-major"></use></svg>'}],[{markup:"th",attributes:{scope:"row"},classes:["fr-cell--fixed"],content:'<div class="fr-checkbox-group fr-checkbox-group--sm"><input name="row-select" id="table-miscellaneous-select-row-checkbox-2" type="checkbox"><label class="fr-label" for="table-miscellaneous-select-row-checkbox-2">  Sélectionner la ligne 2 : Titre par défaut  </label></div><span class="fr-cell__title">Titre par défaut</span>'},{content:"Texte par défaut"},{content:'<p class="fr-mb-2v fr-badge fr-badge--sm fr-badge--info">Libellé par défaut</p><div class="fr-cell__title fr-mb-2v">Titre par défaut</div><div class="fr-cell__desc">Texte par défaut</div>'},{content:'<p class="fr-mr-2v fr-badge fr-badge--sm fr-badge--success">Libellé par défaut</p>Texte par défaut'},{content:"Texte par défaut"},{content:'<div class="fr-input-group" id="input-group-10"><label class="fr-label" for="text-input-text-2"></label><input class="fr-input" aria-describedby="text-input-text-2-messages" id="text-input-text-2"  type="text"><div class="fr-messages-group" id="text-input-text-2-messages" aria-live="polite"></div></div>'},{content:"30,00&nbsp;€"},{content:'<p class="fr-badge fr-badge--info">Libellé par défaut</p>'},{content:'<button type="button" id="table-default-button-11"  class="fr-btn fr-btn--sm fr-btn--secondary">Libellé bouton</button>'},{content:'<a class="fr-tag" href="#">Libellé par défaut</a>'},{content:'<a id="link-12" download="true" href="/example/img/image.jpg"  class="fr-link fr-link--download">Lien de Téléchargement <span class="fr-link__detail">JPG – 61,88 Ko</span></a>'},{content:'<svg aria-hidden="true" class="fr-artwork" viewBox="0 0 80 80" width="80px" height="80px"><use class="fr-artwork-decorative" href="../../../dist/artwork/pictograms/environment/leaf.svg#artwork-decorative"></use><use class="fr-artwork-minor" href="../../../dist/artwork/pictograms/environment/leaf.svg#artwork-minor"></use><use class="fr-artwork-major" href="../../../dist/artwork/pictograms/environment/leaf.svg#artwork-major"></use></svg>'}]]]}),ze=()=>`
  (Résumé) Emploi du temps horaire des Groupes 1 et 2, le matin des jours de la semaine ouvrée (Lundi au Vendredi) :
  <ul>
    <li>la première colonne représente le planning de la journée de Lundi pour les groupes 1 et 2,</li>
    <li>la deuxième colonne représente le planning de la journée de Mardi pour les groupes 1 et 2,</li>
    <li>la troisième colonne représente le planning des journées de Mercredi et Jeudi pour le groupe 1,</li>
    <li>la quatrième colonne représente le planning des journées de Mercredi et Jeudi pour le groupe 2,</li>
    <li>la cinquième colonne représente le planning de la journée de Vendredi pour les groupes 1 et 2.</li>
  </ul>
`,n={caption:"Titre du tableau (caption)",noCaption:!1,captionBottom:!1,bordered:!1,noScroll:!1,multiline:!1,hasHeader:!1,hasHeaderSegmented:!0,hasHeaderSearch:!1,hasHeaderDetails:!0,hasHeaderButtons:!0,hasFooter:!1,hasFooterSelect:!0,hasFooterPagination:!0,hasFooterButtons:!0,size:"md",table:i()},Me=e=>{const t={size:e.size||n.size,table:{caption:e.caption||n.caption,captionDetail:e.captionDetail||n.captionDetail,thead:e.table.thead||n.table.thead,tbodies:e.table.tbodies||n.table.tbodies,id:e.id||void 0}};if(e.noCaption===!0&&(t.noCaption=e.noCaption),e.captionBottom===!0&&(t.captionBottom=e.captionBottom),e.bordered===!0&&(t.bordered=e.bordered),e.noScroll===!0&&(t.noScroll=e.noScroll),e.multiline===!0&&(t.multiline=e.multiline),e.hasHeader===!0){let a="";e.hasHeaderSegmented===!0&&(a+=ke),e.hasHeaderSearch===!0&&(a+=we),e.hasHeaderDetails===!0&&(a+=ye),e.hasHeaderButtons===!0&&(a+=_e),t.header=a}if(e.hasFooter===!0){let a="";e.hasFooterSelect===!0&&(a+=Te),e.hasFooterPagination===!0&&(a+=qe),e.hasFooterButtons===!0&&(a+=Ae),t.footer=a}return t},Pe=e=>Se({table:Me(e)}),je={id:"table",title:"DSFR/Component/Table",render:Pe,argTypes:Le,args:n},c={tags:["!autodocs"],args:{id:r("table")}},d={tags:["autodocs","!dev"],args:{id:r("table")}},u={tags:["autodocs","!dev"],args:{id:r("table"),size:"sm"}},p={tags:["autodocs","!dev"],args:{id:r("table"),size:"md"}},b={tags:["autodocs","!dev"],args:{id:r("table"),size:"lg"}},f={tags:["autodocs","!dev"],args:{id:r("table"),bordered:!0}},m={tags:["autodocs","!dev"],args:{id:r("table"),noScroll:!0}},g={tags:["autodocs","!dev"],args:{id:r("table"),multiline:!0}},h={tags:["autodocs","!dev"],args:{id:r("table"),multiline:!0,table:Fe()}},x={tags:["autodocs","!dev"],args:{id:r("table"),table:xe()}},v={tags:["autodocs","!dev"],parameters:{docs:{description:{story:"La première colonne est fixe à partir du breakpoint `md`. Existe aussi avec les breakpoints `sm` et `lg`"}}},args:{id:r("table"),table:xe("md")}},S={tags:["autodocs","!dev"],args:{id:r("table"),table:Ce()}},y={tags:["autodocs","!dev"],args:{id:r("table"),table:He()}},_={tags:["autodocs","!dev"],args:{id:r("table"),bordered:!0,captionDetail:ze(),table:Ee()}},k={tags:["autodocs","!dev"],args:{id:r("table"),table:De()}};var q,A,L;c.parameters={...c.parameters,docs:{...(q=c.parameters)==null?void 0:q.docs,source:{originalSource:`{
  tags: ['!autodocs'],
  args: {
    id: uniqueId('table')
  }
}`,...(L=(A=c.parameters)==null?void 0:A.docs)==null?void 0:L.source}}};var F,C,H;d.parameters={...d.parameters,docs:{...(F=d.parameters)==null?void 0:F.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table')
  }
}`,...(H=(C=d.parameters)==null?void 0:C.docs)==null?void 0:H.source}}};var E,D,z;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    size: 'sm'
  }
}`,...(z=(D=u.parameters)==null?void 0:D.docs)==null?void 0:z.source}}};var M,P,B;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    size: 'md'
  }
}`,...(B=(P=p.parameters)==null?void 0:P.docs)==null?void 0:B.source}}};var I,j,G;b.parameters={...b.parameters,docs:{...(I=b.parameters)==null?void 0:I.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    size: 'lg'
  }
}`,...(G=(j=b.parameters)==null?void 0:j.docs)==null?void 0:G.source}}};var V,$,R;f.parameters={...f.parameters,docs:{...(V=f.parameters)==null?void 0:V.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    bordered: true
  }
}`,...(R=($=f.parameters)==null?void 0:$.docs)==null?void 0:R.source}}};var J,N,K;m.parameters={...m.parameters,docs:{...(J=m.parameters)==null?void 0:J.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    noScroll: true
  }
}`,...(K=(N=m.parameters)==null?void 0:N.docs)==null?void 0:K.source}}};var O,U,Q;g.parameters={...g.parameters,docs:{...(O=g.parameters)==null?void 0:O.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    multiline: true
  }
}`,...(Q=(U=g.parameters)==null?void 0:U.docs)==null?void 0:Q.source}}};var W,X,Y;h.parameters={...h.parameters,docs:{...(W=h.parameters)==null?void 0:W.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    multiline: true,
    table: getColSizeTableArgs()
  }
}`,...(Y=(X=h.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,te;x.parameters={...x.parameters,docs:{...(Z=x.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    table: getFixedColTableArgs()
  }
}`,...(te=(ee=x.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ae,oe,re;v.parameters={...v.parameters,docs:{...(ae=v.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story: 'La première colonne est fixe à partir du breakpoint \`md\`. Existe aussi avec les breakpoints \`sm\` et \`lg\`'
      }
    }
  },
  args: {
    id: uniqueId('table'),
    table: getFixedColTableArgs('md')
  }
}`,...(re=(oe=v.parameters)==null?void 0:oe.docs)==null?void 0:re.source}}};var le,se,ne;S.parameters={...S.parameters,docs:{...(le=S.parameters)==null?void 0:le.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    table: getSelectableTableArgs()
  }
}`,...(ne=(se=S.parameters)==null?void 0:se.docs)==null?void 0:ne.source}}};var ie,ce,de;y.parameters={...y.parameters,docs:{...(ie=y.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    table: getSelectableTableSelectedLineArgs()
  }
}`,...(de=(ce=y.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};var ue,pe,be;_.parameters={..._.parameters,docs:{...(ue=_.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    bordered: true,
    captionDetail: getComplexTableCaptionDetails(),
    table: getComplexTableArgs()
  }
}`,...(be=(pe=_.parameters)==null?void 0:pe.docs)==null?void 0:be.source}}};var fe,me,ge;k.parameters={...k.parameters,docs:{...(fe=k.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  tags: ['autodocs', '!dev'],
  args: {
    id: uniqueId('table'),
    table: getMiscellaneousTableArgs()
  }
}`,...(ge=(me=k.parameters)==null?void 0:me.docs)==null?void 0:ge.source}}};const Ge=["TableStory","DefaultStory","SizeSMStory","SizeMDStory","SizeLGStory","VerticalBordersStory","NoScrollStory","MultilineStory","MultilineColMinSizeStory","FixedColumnStory","FixedColumnFromMDStory","SelectableTableStory","SelectableTableSelectedLineStory","ComplexTableStory","MiscellaneousTableStory"];export{_ as ComplexTableStory,d as DefaultStory,v as FixedColumnFromMDStory,x as FixedColumnStory,k as MiscellaneousTableStory,h as MultilineColMinSizeStory,g as MultilineStory,m as NoScrollStory,y as SelectableTableSelectedLineStory,S as SelectableTableStory,b as SizeLGStory,p as SizeMDStory,u as SizeSMStory,c as TableStory,f as VerticalBordersStory,Ge as __namedExportsOrder,je as default};
