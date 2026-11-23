const cases = {
 start: [
  {name: 'low', label: 'Too low', value: 0.00001, message: 'The objects stay in view, but putting Clip Start this close to your viewpoint can make nearby depths hard for the viewport to tell apart. Nearly overlapping surfaces can flicker.', precision: 'close'},
  {name: 'recommended', label: 'Recommended', value: 0.1, message: 'The close object stays intact. This leaves room for close-up work without using an unnecessarily tiny Clip Start.'},
  {name: 'high', label: 'Too high', value: 12, message: 'The near plane crosses the close object. The geometry is still there, but its front is hidden, so the object looks sliced open.'},
 ],
 end: [
  {name: 'low', label: 'Too low', value: 1000, message: 'The bench is past the far plane and disappears from the viewport. The close object still shows.'},
  {name: 'recommended', label: 'Recommended', value: 10000, message: 'The close object and the bench both fit inside the range. Geometry far beyond the workspace stays out of this view.'},
  {name: 'high', label: 'Too high', value: 1000000, message: 'The viewport includes distant geometry that this workspace does not need. Across a very wide range, closely spaced surfaces far away can flicker or show a patchy pattern.', precision: 'distant'},
 ],
};

const recommendedStart = cases.start[1].value;
const recommendedEnd = cases.end[1].value;
const formatDistance = new Intl.NumberFormat('en-US', {maximumFractionDigits: 5});
const distanceText = value => `${formatDistance.format(value)} mm`;

// Log spacing keeps both a millimeter-scale close-up and distant geometry in the illustration.
const position = distance => 126 + Math.log10(1 + distance) * 180;
const shapes = [
 {name: 'Close object', from: 4, to: 32, label: 292, color: '#95c5b0', vertices: [0,242, 0,161, .48,126, 1,158, 1,233, .46,270]},
 {name: 'Bench', from: 1800, to: 4100, label: 748, color: '#b1bdea', vertices: [0,258, 0,164, .46,129, 1,166, 1,222, .78,238, .78,259, .59,268, .59,211, .23,185, .23,243]},
 {name: 'Distant surfaces', from: 39000, to: 120000, label: 1040, color: '#f1cd8e', vertices: [0,242, 0,177, .55,140, 1,165, 1,229, .51,264]},
];

function outline(context, shape) {
 const left = position(shape.from);
 const width = position(shape.to) - left;
 context.beginPath();
 for (let i = 0; i < shape.vertices.length; i += 2) {
  const point = [left + shape.vertices[i] * width, shape.vertices[i + 1]];
  if (i === 0) context.moveTo(...point);
  else context.lineTo(...point);
 }
 context.closePath();
}

function drawScene(canvas, start, end, precision) {
 const context = canvas.getContext('2d');
 const left = position(start);
 const right = position(end);
 const width = right - left;
 context.clearRect(0, 0, canvas.width, canvas.height);
 context.fillStyle = '#233632';
 context.fillRect(left, 48, width, 267);
 context.fillStyle = '#b6ded0';
 context.font = '600 25px BlenderInter, sans-serif';
 context.fillText('Visible range', left + 18, 83);

 for (const shape of shapes) {
  outline(context, shape);
  context.lineWidth = 3;
  context.strokeStyle = '#77837f';
  context.setLineDash([5,5]);
  context.stroke();
  context.setLineDash([]);
  context.save();
  context.beginPath();
  context.rect(left, 48, width, 267);
  context.clip();
  outline(context, shape);
  context.fillStyle = shape.color;
  context.fill();
  context.strokeStyle = '#192120';
  context.stroke();
  context.save();
  context.clip();
  if ((precision === 'close' && shape.name === 'Close object') || (precision === 'distant' && shape.name === 'Distant surfaces')) {
   // Static illustration of a depth conflict, rather than a claim that this scene flickers.
   context.fillStyle = '#665064';
   for (let row = 0; row < 11; row++) {
    for (let column = 0; column < 10; column++) {
     if ((row * 5 + column * 3) % 7 < 2) context.fillRect(position(shape.from) + 8 * column, 143 + 10 * row, 8, 10);
    }
   }
  }
  context.restore();
  context.restore();

  context.fillStyle = '#dce7e3';
  context.textAlign = 'center';
  context.font = '500 25px BlenderInter, sans-serif';
  context.fillText(shape.name, shape.label, 357);
  context.textAlign = 'start';
 }

 for (const [x, name] of [[left, 'Clip Start'], [right, 'Clip End']]) {
  context.strokeStyle = '#e5b46c';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(x, 32);
  context.lineTo(x, 320);
  context.stroke();
  context.fillStyle = '#ffdaa5';
  context.textAlign = x === left ? 'start' : 'end';
  context.font = '600 27px BlenderInter, sans-serif';
  context.fillText(name, x + (x === left ? 7 : -7), 28);
 }
 context.textAlign = 'center';
 context.fillStyle = '#dce7e3';
 context.fillText('Viewpoint', 69, 357);
 context.strokeStyle = '#a9b5b0';
 context.beginPath();
 context.moveTo(65, 327);
 context.lineTo(65, 170);
 context.stroke();
 context.beginPath();
 context.arc(65, 160, 10, 0, 2 * Math.PI);
 context.fill();
 context.textAlign = 'start';
}

export function mountClippingComparison(container, {complete, completed = false}) {
 const document = container.ownerDocument;
 const panel = document.createElement('section');
 const stylesheet = document.createElement('link');
 stylesheet.rel = 'stylesheet';
 stylesheet.href = new URL('./clipping-comparison.css', import.meta.url).href;
 panel.className = 'bl-clip-comparison';
 panel.setAttribute('aria-labelledby', 'bl-clip-title');
 panel.innerHTML = `
  <header class="bl-clip-heading">
   <h3 id="bl-clip-title">Compare clipping distances</h3>
   <span role="status" class="bl-clip-progress"></span>
  </header>
  <div class="bl-clip-content">
   <div class="bl-clip-settings"></div>
   <figure class="bl-clip-preview">
    <figcaption><strong>View from the side</strong><span class="bl-clip-range"></span></figcaption>
    <canvas width="1260" height="390" aria-hidden="true"></canvas>
    <p class="bl-clip-effect" aria-live="polite">Choose a value to see its effect. The other limit stays at its recommended value.</p>
    <p class="bl-clip-note">Distances are compressed to fit. Outlines show geometry outside the visible range.</p>
   </figure>
  </div>`;
 panel.prepend(stylesheet);
 const visited = new Set();
 const buttons = [];
 const settings = panel.querySelector('.bl-clip-settings');
 const progress = panel.querySelector('.bl-clip-progress');
 const canvas = panel.querySelector('canvas');
 const range = panel.querySelector('.bl-clip-range');
 const effect = panel.querySelector('.bl-clip-effect');
 const note = panel.querySelector('.bl-clip-note');

 function updateProgress() {
  progress.textContent = `${completed ? 6 : visited.size} of 6 settings compared`;
 }

 function render(start, end, precision) {
  range.textContent = `${distanceText(start)} – ${distanceText(end)}`;
  drawScene(canvas, start, end, precision);
  note.textContent = precision
   ? 'Patchy shading illustrates a possible depth precision artifact. Distances are compressed to fit.'
   : 'Distances are compressed to fit. Outlines show geometry outside the visible range.';
 }

 for (const [limit, variants] of Object.entries(cases)) {
  const field = document.createElement('fieldset');
  field.innerHTML = `<legend>${limit === 'start' ? 'Clip Start' : 'Clip End'}</legend>`;
  for (const choice of variants) {
   const button = document.createElement('button');
   button.type = 'button';
   button.dataset.clipLimit = limit;
   button.dataset.clipCase = choice.name;
   button.setAttribute('aria-pressed', 'false');
   button.innerHTML = `<span>${choice.label} <span class="bl-clip-visited" aria-hidden="true">✓</span></span><strong>${distanceText(choice.value)}</strong>`;
   if (completed) button.dataset.viewed = 'true';
   buttons.push(button);
   button.addEventListener('click', () => {
    for (const option of buttons) option.setAttribute('aria-pressed', String(option === button));
    effect.textContent = choice.message;
    render(limit === 'start' ? choice.value : recommendedStart, limit === 'end' ? choice.value : recommendedEnd, choice.precision);
    visited.add(button);
    button.dataset.viewed = 'true';
    updateProgress();
    if (!completed && visited.size === buttons.length) {
     completed = true;
     complete();
    }
   });
   field.append(button);
  }
  settings.append(field);
 }

 // Stage-level controls should not turn a comparison click or keypress into viewport input.
 for (const event of ['pointerdown', 'pointermove', 'pointerup', 'click', 'dblclick', 'keydown', 'wheel']) {
  panel.addEventListener(event, event => event.stopPropagation());
 }
 container.append(panel);
 function sizePanel() {
  const bounds = container.getBoundingClientRect();
  if (bounds.width <= 0 || container.offsetWidth <= 0) return;
  panel.style.width = `${bounds.width}px`;
  panel.style.height = `${bounds.height}px`;
  panel.style.transform = `scale(${container.offsetWidth / bounds.width})`;
 }
 const observer = new document.defaultView.ResizeObserver(sizePanel);
 observer.observe(container);
 observer.observe(container.parentElement);
 sizePanel();
 updateProgress();
 render(recommendedStart, recommendedEnd);
 return () => {
  observer.disconnect();
  panel.remove();
 };
}
