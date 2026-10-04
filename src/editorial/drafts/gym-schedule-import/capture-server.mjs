import http from 'node:http';
// Local fixtures show frontend states. They do not execute OCR or an LLM.
const markdown = '| Time | Monday | Tuesday | Wednesday |\n| --- | --- | --- | --- |\n| 18:00-19:00 | BJJ Fundamentals | No-Gi | BJJ Fundamentals |\n| 19:00-20:00 | Open Mat | Mobility | Open Mat |';
const days = ['Monday', 'Tuesday', 'Wednesday'].map((name, i) => ({name, classes: [{id:`demo-${i}-1`, time:'18:00', endTime:'19:00', name:i===1?'No-Gi':'BJJ Fundamentals'}, {id:`demo-${i}-2`, time:'19:00', endTime:'20:00', name:i===1?'Mobility':'Open Mat'}]}));
http.createServer((req, res) => {
  req.resume();
  const path = req.url;
  let data;
  if (path.endsWith('/get-schedule')) data=[];
  else if (path.endsWith('/parse-schedule-ocr')) data=markdown;
  else if (path.endsWith('/parse-schedule-structured')) data=days;
  else { res.writeHead(403); res.end('Fixture server permits only the capture workflow.'); return; }
  console.log(`${req.method} ${path}`);
  res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify({data}));
}).listen(3015, '127.0.0.1', () => console.log('Capture fixtures: http://127.0.0.1:3015'));
