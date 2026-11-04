// Draw and fill the shared story path. Content and links are rendered by Astro.
(() => {
const page = document.querySelector('.story-page');
const journey = page?.querySelector('.journey');
if (!journey) return;
const steps = [...journey.querySelectorAll('.work-step')];
if (!steps.length) return;
const finalStep = steps.at(-1);
const finalMarker = finalStep.querySelector('.marker');
const links = [...page.querySelectorAll('.area-nav a')];
const routeBase = journey.querySelector('.route-base');
const routeRead = journey.querySelector('.route-read');
const routeCursor = journey.querySelector('.route-cursor');
let routeLength = 0;
let routePoints = [];
let frame = 0;
function draw() {
  const bounds = journey.getBoundingClientRect();
  const points = steps.map(step => {
    const dot = step.querySelector('.marker').getBoundingClientRect();
    const row = step.getBoundingClientRect();
    return {x:dot.left - bounds.left + dot.width/2, y:dot.top - bounds.top + dot.height/2, top:row.top - bounds.top, bottom:row.bottom - bounds.top};
  });
  const svg = journey.querySelector('.route');
  svg.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height);
  let path = 'M' + points[0].x + ' ' + points[0].y;
  points.slice(1).forEach((point,index) => {
    const previous = points[index];
    const tangent = (point.y - previous.y) * .5;
    path += 'C' + previous.x + ' ' + (previous.y + tangent) + ' ' + point.x + ' ' + (point.y - tangent) + ' ' + point.x + ' ' + point.y;
  });
  routeBase.setAttribute('d', path);
  routeRead.setAttribute('d', path);
  routeLength = routeBase.getTotalLength();
  routePoints = points;
  update();
}
function update() {
  const baseReadingLine = Math.min(innerHeight * .4, 340);
  const scrollEnd = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const remaining = Math.max(0, scrollEnd - scrollY);
  const complete = remaining <= 2;
  const finalBounds = finalMarker.getBoundingClientRect();
  const finalAtBottom = finalBounds.top + finalBounds.height / 2 - remaining;
  const finishWindow = Math.min(innerHeight * .6, Math.max(200, finalStep.offsetHeight));
  const t = Math.max(0, Math.min(1, 1 - remaining / finishWindow));
  const eased = t * t * (3 - 2 * t);
  // Let the reading position reach the last node during the final stretch of scroll.
  const readingLine = baseReadingLine + Math.max(0, finalAtBottom - baseReadingLine) * eased;
  finalStep.classList.toggle('route-finished', complete);
  if (complete) {
    finalMarker.setAttribute('role', 'img');
    finalMarker.setAttribute('aria-label', 'Journey complete');
  } else {
    finalMarker.removeAttribute('role');
    finalMarker.removeAttribute('aria-label');
  }
  if (routeLength && routePoints.length) {
    const y = readingLine - journey.getBoundingClientRect().top;
    let low = 0, high = routeLength;
    for (let i = 0; i < 18; i++) {
      const middle = (low + high) / 2;
      if (routeBase.getPointAtLength(middle).y < y) low = middle;
      else high = middle;
    }
    const distance = complete ? routeLength : y <= routePoints[0].y ? 0 : y >= routePoints.at(-1).y ? routeLength : (low + high) / 2;
    routeRead.style.strokeDasharray = distance + ' ' + (routeLength + 1);
    routeRead.style.visibility = distance > 0 ? '' : 'hidden';
    const point = routeBase.getPointAtLength(distance);
    routeCursor.setAttribute('cx', point.x);
    routeCursor.setAttribute('cy', point.y);
    routeCursor.style.visibility = distance > 0 && distance < routeLength ? '' : 'hidden';
    steps.forEach((step,index) => step.classList.toggle('is-read', complete || routePoints[index].y <= y));
  }
  let nearest = 0;
  const positions = steps.map(step => step.querySelector('.marker').getBoundingClientRect());
  positions.forEach((position,index) => { if (Math.abs(position.top + position.height / 2 - readingLine) < Math.abs(positions[nearest].top + positions[nearest].height / 2 - readingLine)) nearest = index; });
  if (complete) nearest = steps.length - 1;
  steps.forEach((step,index) => {
    step.classList.toggle('is-current', index === nearest);
    if (index === nearest) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  });
  const insideJourney = journey.getBoundingClientRect().top < innerHeight * .6;
  links.forEach((link,index) => {
    if (insideJourney && link.dataset.part === steps[nearest].dataset.part) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', () => {
  if (frame) return;
  frame = requestAnimationFrame(() => { frame = 0; update(); });
}, {passive:true});
window.addEventListener('resize', draw);
new ResizeObserver(draw).observe(journey);
document.fonts.ready.then(draw);
draw();

})();
