// Draws four little illustrated "sample shots" used for the film previews on the
// selection screen. The real film functions are then applied to them, so each
// preview strip honestly shows what the film does to colour and contrast.

const W = 400;
const H = 300;

function pose(ctx: CanvasRenderingContext2D, i: number) {
  // curtain backdrop
  ctx.fillStyle = '#E7B29C';
  ctx.fillRect(0, 0, W, H);
  for (let x = -10; x < W; x += 34) {
    const g = ctx.createLinearGradient(x, 0, x + 34, 0);
    g.addColorStop(0, 'rgba(120,50,40,0.18)');
    g.addColorStop(0.5, 'rgba(255,240,230,0.14)');
    g.addColorStop(1, 'rgba(120,50,40,0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 34, H);
  }
  // soft light spot
  const spot = ctx.createRadialGradient(200, 120, 20, 200, 140, 260);
  spot.addColorStop(0, 'rgba(255,248,235,0.45)');
  spot.addColorStop(1, 'rgba(60,20,20,0.15)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, W, H);

  const tilt = [0, 0.14, -0.05, -0.12][i];
  const ink = '#2E211C';

  // body
  ctx.fillStyle = ['#5A85B5', '#D9A33A', '#7A9C6A', '#C45B6E'][i];
  ctx.beginPath();
  ctx.ellipse(200, 330, 130, 110, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E0AC88';
  ctx.fillRect(182, 196, 36, 34);

  ctx.save();
  ctx.translate(200, 150);
  ctx.rotate(tilt);
  // hair back
  ctx.fillStyle = '#4A3127';
  ctx.beginPath();
  ctx.ellipse(0, 4, 74, 78, 0, 0, Math.PI * 2);
  ctx.fill();
  // face
  ctx.fillStyle = '#EDBF9C';
  ctx.beginPath();
  ctx.ellipse(0, 10, 58, 64, 0, 0, Math.PI * 2);
  ctx.fill();
  // fringe
  ctx.fillStyle = '#4A3127';
  ctx.beginPath();
  ctx.moveTo(-62, 0);
  ctx.quadraticCurveTo(-50, -66, 6, -62);
  ctx.quadraticCurveTo(58, -60, 64, 0);
  ctx.quadraticCurveTo(30, -30, -10, -28);
  ctx.quadraticCurveTo(-40, -24, -62, 0);
  ctx.fill();
  // cheeks
  ctx.fillStyle = 'rgba(232,120,120,0.45)';
  ctx.beginPath(); ctx.ellipse(-32, 30, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(32, 30, 12, 8, 0, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  const dot = (x: number) => { ctx.beginPath(); ctx.ellipse(x, 10, 5.5, 7, 0, 0, Math.PI * 2); ctx.fill(); };
  const arc = (x: number) => { ctx.beginPath(); ctx.arc(x, 14, 8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); };
  if (i === 0) { dot(-22); dot(22); }
  if (i === 1) { dot(-22); arc(22); }
  if (i === 2) { dot(-22); dot(22); }
  if (i === 3) { arc(-22); arc(22); }
  // mouth
  if (i === 3) {
    ctx.fillStyle = '#8E3B3F';
    ctx.beginPath();
    ctx.moveTo(-16, 38);
    ctx.quadraticCurveTo(0, 64, 16, 38);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 32, 14, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
  ctx.restore();

  // peace sign hand
  if (i === 2) {
    ctx.fillStyle = '#EDBF9C';
    ctx.save();
    ctx.translate(292, 170);
    ctx.rotate(0.2);
    ctx.beginPath(); ctx.ellipse(0, 22, 22, 24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-16, -38, 13, 54, 7); ctx.fill();
    ctx.beginPath(); ctx.roundRect(2, -40, 13, 56, 7); ctx.rotate(0.25); ctx.fill();
    ctx.restore();
  }
  // a little heart prop
  if (i === 0) {
    ctx.fillStyle = '#E85C7A';
    ctx.save();
    ctx.translate(96, 214);
    ctx.rotate(-0.3);
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.bezierCurveTo(-30, -2, -14, -26, 0, -8);
    ctx.bezierCurveTo(14, -26, 30, -2, 0, 18);
    ctx.fill();
    ctx.restore();
  }
}

let cache: HTMLCanvasElement[] | null = null;
export function sampleShots() {
  if (cache) return cache;
  cache = [0, 1, 2, 3].map((i) => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    pose(c.getContext('2d')!, i);
    return c;
  });
  return cache;
}
