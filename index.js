(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  document.querySelector('#year').textContent = new Date().getFullYear();

  const updateHeader = () => header.classList.toggle('scrolled', scrollY > 24);
  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
  }));

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -25px 0px' });
    reveals.forEach(item => observer.observe(item));
  } else reveals.forEach(item => item.classList.add('visible'));

  const canvas = document.querySelector('#particles');
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, particles = [];
  const mouse = { x: -1000, y: -1000 };
  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 1.7);
    width = innerWidth; height = innerHeight;
    canvas.width = width * ratio; canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.min(112, Math.floor(width / 12)) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .24, vy: (Math.random() - .5) * .24,
      r: Math.random() * 1.8 + .7, a: Math.random() * .48 + .22,
      hue: Math.random() > .55 ? 194 : 216
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -8) p.x = width + 8; if (p.x > width + 8) p.x = -8;
        if (p.y < -8) p.y = height + 8; if (p.y > height + 8) p.y = -8;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 110 && d > 0) { p.x += dx / d * .55; p.y += dy / d * .55; }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},82%,79%,${p.a})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 132) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(85,181,255,${.17 * (1 - d / 132)})`;
          ctx.lineWidth = .65; ctx.stroke();
        }
      }
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  }
  resize(); draw();
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('pointerout', e => { if (!e.relatedTarget) { mouse.x = -1000; mouse.y = -1000; } });

  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(button => {
      button.addEventListener('pointermove', e => {
        const r = button.getBoundingClientRect();
        button.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .07}px,${(e.clientY - r.top - r.height / 2) * .12 - 2}px)`;
      });
      button.addEventListener('pointerleave', () => button.style.transform = '');
    });
    const art = document.querySelector('.hero-art');
    art.addEventListener('pointermove', e => {
      const r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      art.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
    });
    art.addEventListener('pointerleave', () => art.style.transform = '');
    const manifesto = document.querySelector('.manifesto');
    addEventListener('scroll', () => {
      const r = manifesto.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        const shift = (innerHeight - r.top) * .035;
        manifesto.querySelector('.orb-one').style.translate = `0 ${shift}px`;
        manifesto.querySelector('.orb-two').style.translate = `0 ${-shift}px`;
      }
    }, { passive: true });
  }
})();

// Luz ambiente, progresso de leitura e inclinação suave dos cartões.
const cards = document.querySelectorAll('.idea-card');
let framePending = false;
addEventListener('pointermove', event => {
  if (matchMedia('(pointer: fine)').matches) {
    document.body.style.setProperty('--mouse-x', `${event.clientX}px`);
    document.body.style.setProperty('--mouse-y', `${event.clientY}px`);
  }
  if (reduceMotion || !matchMedia('(pointer: fine)').matches) return;
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
    card.style.setProperty('--card-rx', `${((event.clientY - rect.top) / rect.height - .5) * -4}deg`);
    card.style.setProperty('--card-ry', `${((event.clientX - rect.left) / rect.width - .5) * 5}deg`);
  });
}, { passive: true });
cards.forEach(card => card.addEventListener('pointerleave', () => {
  card.style.setProperty('--card-rx', '0deg');
  card.style.setProperty('--card-ry', '0deg');
}));
function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  document.body.style.setProperty('--scroll-progress', max > 0 ? scrollY / max : 0);
  framePending = false;
}
addEventListener('scroll', () => {
  if (!framePending) { requestAnimationFrame(updateScrollProgress); framePending = true; }
}, { passive: true });
updateScrollProgress();

// Ripples nos botões e pequenas faíscas ao interagir com os cards.
document.querySelectorAll('.button').forEach(button => {
  button.addEventListener('pointerdown', event => {
    if (reduceMotion) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.append(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});
document.querySelectorAll('.idea-card').forEach(card => {
  card.addEventListener('pointerdown', event => {
    if (reduceMotion || !matchMedia('(pointer: fine)').matches) return;
    const rect = card.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('i');
      const angle = Math.PI * 2 * i / 6;
      const distance = 22 + Math.random() * 25;
      spark.className = 'spark';
      spark.style.left = `${event.clientX - rect.left}px`;
      spark.style.top = `${event.clientY - rect.top}px`;
      spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
      card.append(spark);
      setTimeout(() => spark.remove(), 700);
    }
  });
});


// O traço do processo cresce à medida que a seção entra na tela.
const processSection = document.querySelector('.process-section');
if (processSection && !reduceMotion) {
  const updateProcess = () => {
    const rect = processSection.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (rect.height + innerHeight * .35)));
    processSection.style.setProperty('--flow-progress', progress);
  };
  addEventListener('scroll', updateProcess, { passive: true });
  updateProcess();
}

// Esfera WebGL: iluminação, linhas de latitude e resposta ao ponteiro.
(() => {
  const canvas = document.querySelector('.webgl-orb');
  const stage = document.querySelector('.hero-art');
  const gl = canvas?.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!gl || !stage) return;

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main(){ v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision mediump float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform float u_time;
    void main(){
      vec2 p = (v_uv - 0.5) * 2.0;
      p.x *= u_resolution.x / u_resolution.y;
      float radius = 0.84;
      float d = length(p);
      if (d > radius) { gl_FragColor = vec4(0.0); return; }
      float z = sqrt(max(radius * radius - dot(p,p), 0.0));
      vec3 n = normalize(vec3(p, z));
      float spin = u_time * 0.13;
      n.xz = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * n.xz;
      n.yz = mat2(cos(spin*.54), -sin(spin*.54), sin(spin*.54), cos(spin*.54)) * n.yz;
      vec3 lightDir = normalize(vec3(-0.48 + u_pointer.x*.32, 0.58 - u_pointer.y*.32, 0.86));
      float diffuse = max(dot(n, lightDir), 0.0);
      float specular = pow(max(dot(reflect(-lightDir,n), vec3(0.0,0.0,1.0)),0.0), 34.0);
      float fresnel = pow(1.0 - max(n.z,0.0), 2.0);
      float longitude = pow(1.0 - abs(sin(atan(n.x,n.z)*13.0)), 20.0);
      float latitude = pow(1.0 - abs(sin(asin(clamp(n.y,-1.0,1.0))*15.0)), 27.0);
      float grid = max(longitude, latitude) * .25;
      vec3 base = mix(vec3(.018,.075,.17), vec3(.035,.34,.63), smoothstep(-.35,.75,n.y + n.x*.23));
      vec3 color = base * (.55 + diffuse*.7);
      color += vec3(.08,.36,.67) * fresnel * .85;
      color += vec3(.44,.82,1.0) * specular * .95;
      color += vec3(.14,.55,.85) * grid;
      float edge = 1.0 - smoothstep(radius-.018, radius, d);
      float alpha = edge * (.88 + fresnel*.12);
      gl_FragColor = vec4(color, alpha);
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'u_resolution');
  const pointerUniform = gl.getUniformLocation(program, 'u_pointer');
  const timeUniform = gl.getUniformLocation(program, 'u_time');
  const pointer = { x: 0, y: 0 };
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    render(0);
  }
  stage.addEventListener('pointermove', event => {
    const rect = stage.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    pointer.y = -((event.clientY - rect.top) / rect.height - .5) * 2;
  }, { passive: true });
  function render(now) {
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(pointerUniform, pointer.x, pointer.y);
    gl.uniform1f(timeUniform, motion ? now * .001 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (motion && !document.hidden) requestAnimationFrame(render);
  }
  resize();
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && motion) requestAnimationFrame(render); });
  stage.classList.add('webgl-ready');
})();

// Cursor circular discreto; o cursor nativo permanece em celulares e com movimento reduzido.
(() => {
  const finePointer = matchMedia('(pointer: fine)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reducedMotion) return;
  const ring = document.createElement('div');
  const dot = document.createElement('div');
  ring.className = 'cursor-ring'; dot.className = 'cursor-dot';
  document.body.append(ring, dot);
  document.body.classList.add('custom-cursor-enabled');
  const point = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
  addEventListener('pointermove', event => {
    point.tx = event.clientX; point.ty = event.clientY;
    dot.style.transform = `translate3d(${point.tx}px,${point.ty}px,0) translate(-50%,-50%)`;
  }, { passive: true });
  function follow() {
    point.x += (point.tx - point.x) * .19;
    point.y += (point.ty - point.y) * .19;
    ring.style.transform = `translate3d(${point.x}px,${point.y}px,0) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  }
  follow();
  const interactive = 'a,button,[role="button"],.idea-card,.member-card,.project-card,.float-tag';
  document.addEventListener('pointerover', event => {
    if (event.target.closest(interactive)) ring.classList.add('is-interactive');
  });
  document.addEventListener('pointerout', event => {
    if (event.target.closest(interactive) && !event.relatedTarget?.closest(interactive)) ring.classList.remove('is-interactive');
  });
  document.addEventListener('pointerdown', () => ring.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => ring.classList.remove('is-pressed'));
  addEventListener('blur', () => { document.body.classList.remove('custom-cursor-enabled'); ring.style.opacity = '0'; dot.style.opacity = '0'; });
  addEventListener('focus', () => { document.body.classList.add('custom-cursor-enabled'); ring.style.opacity = ''; dot.style.opacity = ''; });
})();
