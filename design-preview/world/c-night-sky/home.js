(() => {
  const data = window.WORLD;
  const field = document.querySelector('.star-field');
  const map = document.querySelector('#world-map');

  function seeded(index) {
    const value = Math.sin(index * 9187.31) * 10000;
    return value - Math.floor(value);
  }

  for (let i = 0; i < 90; i += 1) {
    const star = document.createElement('i');
    star.className = 'field-star';
    star.style.left = `${seeded(i) * 100}%`;
    star.style.top = `${seeded(i + 100) * 100}%`;
    star.style.setProperty('--size', `${1 + seeded(i + 200) * 2}px`);
    star.style.setProperty('--opacity', `${.18 + seeded(i + 300) * .5}`);
    field.append(star);
  }

  function pointSet(count, id) {
    const seed = [...id].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7);
    return Array.from({length: count}, (_, i) => [6 + i * 88 / Math.max(1, count - 1), 10 + seeded(seed + i) * 28]);
  }

  function constellation(workspace) {
    const link = document.createElement('a');
    link.className = 'constellation-link';
    link.dataset.id = workspace.id;
    link.href = `story.html?w=${workspace.id}`;
    link.setAttribute('aria-label', `Open the ${workspace.name} story. ${workspace.oneLiner}`);
    const points = pointSet(workspace.chapters.length, workspace.id);
    const lines = points.slice(1).map((point, index) => `<line class="constellation-line" x1="${points[index][0]}" y1="${points[index][1]}" x2="${point[0]}" y2="${point[1]}"></line>`).join('');
    const stars = points.map((point, index) => `<circle class="constellation-dot ${workspace.chapters[index].status === 'next' ? 'next' : ''}" cx="${point[0]}" cy="${point[1]}" r="${workspace.id === 'maat' ? 1.7 : 1.5}"></circle>`).join('');
    link.innerHTML = `${workspace.id === 'gcontext' ? '<span class="nebula" aria-hidden="true"></span>' : ''}<svg class="constellation-svg" viewBox="0 0 100 48" aria-hidden="true">${lines}${stars}</svg><span class="constellation-name"><strong>${workspace.name}</strong><small>${workspace.kind}</small></span><span class="map-detail">${workspace.oneLiner}<br><b>Look closer →</b></span>`;
    return link;
  }

  data.workspaces.forEach(workspace => map.append(constellation(workspace)));
  data.products.forEach(product => {
    const link = document.createElement('a');
    link.className = 'product-star';
    link.dataset.id = product.id;
    link.href = product.href;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.innerHTML = `<strong>${product.name}</strong><span class="map-detail">${product.kid}<br>${product.detail}</span>`;
    map.append(link);
  });
  const shootingStar = document.createElement('i');
  shootingStar.className = 'shooting-star';
  shootingStar.setAttribute('aria-hidden', 'true');
  map.append(shootingStar);

  document.querySelector('#about-title').textContent = data.person.name;
  document.querySelector('#person-role').textContent = `${data.person.role}. ${data.person.kid}`;
  document.querySelector('#person-motto').textContent = `${data.person.motto} ${data.person.mottoLong}`;
  document.querySelector('#person-about').innerHTML = data.person.about.map(text => `<p>${text}</p>`).join('');

  const tabs = document.querySelector('#principle-stars');
  const detail = document.querySelector('#principle-detail');
  function selectPrinciple(principle) {
    tabs.querySelectorAll('button').forEach(button => button.setAttribute('aria-selected', String(Number(button.dataset.number) === principle.n)));
    detail.innerHTML = `<span class="principle-number">Star ${principle.n} of ${data.principles.length}</span><h3>${principle.title}</h3><p>${principle.kid}</p><p class="example">${principle.example}</p>`;
  }
  data.principles.forEach((principle, index) => {
    const button = document.createElement('button');
    button.className = 'principle-tab';
    button.type = 'button';
    button.role = 'tab';
    button.dataset.number = principle.n;
    button.setAttribute('aria-selected', String(index === 0));
    button.setAttribute('aria-label', `Show principle ${principle.n}: ${principle.title}`);
    button.innerHTML = `<span>${principle.n}</span>`;
    button.addEventListener('click', () => selectPrinciple(principle));
    button.addEventListener('focus', () => selectPrinciple(principle));
    tabs.append(button);
  });
  selectPrinciple(data.principles[0]);
})();
