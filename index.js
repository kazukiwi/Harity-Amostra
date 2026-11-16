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
    particles = Array.from({ length: Math.min(68, Math.floor(width / 19)) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .24, vy: (Math.random() - .5) * .24,
      r: Math.random() * 1.4 + .5, a: Math.random() * .36 + .11,
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
        if (d < 105) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(153,163,255,${.09 * (1 - d / 105)})`;
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
        button.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.07}px,${(e.clientY-r.top-r.height/2)*.12-2}px)`;
      });
      button.addEventListener('pointerleave', () => button.style.transform = '');
    });
    const art = document.querySelector('.hero-art');
    art.addEventListener('pointermove', e => {
      const r = art.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
      art.style.transform = `rotateY(${x*5}deg) rotateX(${-y*4}deg)`;
    });
    art.addEventListener('pointerleave', () => art.style.transform = '');
    const manifesto = document.querySelector('.manifesto');
    addEventListener('scroll', () => {
      const r = manifesto.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        const shift = (innerHeight-r.top) * .035;
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

