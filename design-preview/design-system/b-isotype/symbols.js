// Picture statistics: the symbol set.
// Chart symbols sit on one 48 x 48 unit grid. UI marks sit on a 24 x 24 grid.
// Every mark is a solid, flat silhouette. No strokes, no outlines.
// Detail is cut out as negative space (fill-rule evenodd or a mask), never drawn as a line.
// Color comes from the use site through currentColor. One symbol is one chapter.
(() => {
  'use strict';
  const S = (id, body) => `<symbol id="s-${id}" viewBox="0 0 48 48">${body}</symbol>`;
  const U = (id, body) => `<symbol id="u-${id}" viewBox="0 0 24 24">${body}</symbol>`;

  // One standard figure. Head 1/5 of the height, square shoulders, a trapezoid body, a leg cut.
  const figure = cx => `<circle cx="${cx}" cy="6.5" r="5"/><path d="M${cx - 10.5} 13.5H${cx + 10.5}L${cx + 7} 47H${cx + 1}V32H${cx - 1}V47H${cx - 7}Z"/>`;

  const symbols = [
    S('person', figure(24)),
    // Two standard figures, the same size as one person: two people.
    S('heads', figure(12.5) + figure(35.5)),
    // A brain seen from above: two hemispheres, the lobes cut with straight lines.
    S('brain', `<ellipse cx="24" cy="24.5" rx="19.5" ry="21.5" mask="url(#mk-brain)"/>`),
    // A hierarchy of solid squares: one, two, four.
    S('tree', `<rect x="19" y="2" width="10" height="10"/><rect x="23" y="12" width="2" height="4"/><rect x="11" y="16" width="26" height="2"/><rect x="11" y="18" width="2" height="3"/><rect x="35" y="18" width="2" height="3"/><rect x="7" y="21" width="10" height="10"/><rect x="31" y="21" width="10" height="10"/><rect x="11" y="31" width="2" height="3"/><rect x="35" y="31" width="2" height="3"/><rect x="5" y="34" width="14" height="2"/><rect x="29" y="34" width="14" height="2"/><rect x="5" y="36" width="2" height="2"/><rect x="17" y="36" width="2" height="2"/><rect x="29" y="36" width="2" height="2"/><rect x="41" y="36" width="2" height="2"/><rect x="2" y="38" width="8" height="8"/><rect x="14" y="38" width="8" height="8"/><rect x="26" y="38" width="8" height="8"/><rect x="38" y="38" width="8" height="8"/>`),
    // A picture frame with a landscape inside.
    S('photo', `<path fill-rule="evenodd" d="M3 7H45V43H3Z M7 11V39H41V11Z"/><path d="M10.5 36L19 23.5L25.5 31.5L30.5 26L37.5 36Z"/><circle cx="32" cy="17.5" r="3.5"/>`),
    // A speech block with a square tail and two lines of text cut out.
    S('chat', `<path fill-rule="evenodd" d="M3 6H45V34H21L9 45V34H3Z M10 13.5V17H38V13.5Z M10 22.5V26H30V22.5Z"/>`),
    // A stack of three documents, the front one with lines cut out.
    S('files', `<path d="M3 3H29V6H6V35H3Z"/><path d="M9 9H35V12H12V41H9Z"/><path fill-rule="evenodd" d="M15 15H35L41 21V47H15Z M20 27V30H36V27Z M20 35V38H32V35Z"/>`),
    // The unit of the chart key: one page with lines of text. Used only in keys and tallies.
    S('unit', `<path fill-rule="evenodd" d="M9 4H31L39 12V44H9Z M14 20V23H34V20Z M14 27V30H34V27Z M14 34V37H28V34Z"/>`),
    // One empty sheet.
    S('blank', `<path d="M9 4H31L39 12V44H9Z"/>`),
    // A folded map in three panels.
    S('map', `<path d="M3 9L15 5V39L3 43Z"/><path d="M18 5L30 9V43L18 39Z"/><path d="M33 9L45 5V39L33 43Z"/>`),
    // An archive box: a lid and a body with a handle cut out.
    S('save', `<rect x="3" y="7" width="42" height="9"/><path fill-rule="evenodd" d="M6 19H42V43H6Z M18 24V28H30V24Z"/>`),
    // Not yet: a gray slot with an unknown mark. The only symbol that carries its own colors.
    S('question', `<rect x="3" y="3" width="42" height="42" style="fill: var(--color-gray, #D9D8D3)"/><g style="fill: var(--color-ink, #151515)"><path d="M14 16A10 10 0 0 1 34 16A10 10 0 0 1 24 26L24 20.5A4.5 4.5 0 0 0 28.5 16A4.5 4.5 0 0 0 19.5 16Z"/><rect x="21.25" y="20.5" width="5.5" height="11"/><rect x="21.25" y="34.5" width="5.5" height="5.5"/></g>`),
    // The mission flag at the end of a row.
    S('flag', `<path d="M9 3H14V5H40V27H14V47H9Z"/>`),

    // UI marks, 24 grid.
    U('arrow', `<path d="M3 10.5H14.5V5L22 12L14.5 19V13.5H3Z"/>`),
    U('back', `<path d="M21 10.5H9.5V5L2 12L9.5 19V13.5H21Z"/>`),
    U('chev-r', `<path d="M8 3.5H12.5L21 12L12.5 20.5H8L16.5 12Z"/>`),
    U('chev-l', `<path d="M16 3.5H11.5L3 12L11.5 20.5H16L7.5 12Z"/>`),
    U('flag', `<path d="M4 2H7V3H20V14H7V22H4Z"/>`),
    U('out', `<path d="M4.9 16.9L14.3 7.5H8V4.5H19.5V16H16.5V9.6L7.1 19.1Z"/>`),
  ];

  const masks = `<mask id="mk-brain" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
      <rect width="48" height="48" fill="#fff"/>
      <rect x="22.5" y="0" width="3" height="48" fill="#000"/>
      <rect x="0" y="13.5" width="14" height="3" fill="#000"/><rect x="34" y="13.5" width="14" height="3" fill="#000"/>
      <rect x="0" y="24.5" width="17" height="3" fill="#000"/><rect x="31" y="24.5" width="17" height="3" fill="#000"/>
      <rect x="0" y="35" width="12" height="3" fill="#000"/><rect x="36" y="35" width="12" height="3" fill="#000"/>
    </mask>`;

  const sprite = `<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"><defs>${masks}${symbols.join('')}</defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', sprite);

  // Chapter icon names used by the data, in one place.
  window.ISO = {
    chapterIcons: ['heads', 'brain', 'tree', 'photo', 'chat', 'files'],
    extraIcons: ['blank', 'map', 'save', 'question'],
    sym: (name, cls = '') => `<svg class="sym${cls ? ' ' + cls : ''}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#s-${name}"/></svg>`,
    ui: (name, cls = '') => `<svg class="ui${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#u-${name}"/></svg>`,
  };
})();
