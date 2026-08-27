/* =========================================================
   RS GESTÃO & CONSULTORIA EM QUALIDADE — app.js
   ---------------------------------------------------------
   TUDO QUE VOCÊ PRECISA EDITAR ESTÁ NO BLOCO "CONFIG" ABAIXO.
   ========================================================= */

/* Marca que o JS está ativo — só então o CSS esconde os blocos animados */
document.documentElement.classList.add('js');

const CONFIG = {
  /* Número do WhatsApp no formato internacional, só dígitos */
  whatsapp: '5519996268077',

  /* Quantas vagas de diagnóstico gratuito você abre por mês.
     Mantenha este número verdadeiro — é ele que aparece no site. */
  vagas: 3,

  /* Vire para true depois de preencher os 3 depoimentos no index.html */
  mostrarDepoimentos: false,

  /* Pop-up de saída (aparece 1x por visita, quando o mouse sai da página) */
  exitIntent: true,

  /* No celular não existe "mouse saindo": o pop-up aparece após X ms de leitura */
  exitDelayMobile: 50000
};

/* ---------------------------------------------------------
   1. LINKS DE WHATSAPP
   --------------------------------------------------------- */
const waLink = (msg) =>
  'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || 'Olá Rejane! Vim pelo site.');

document.querySelectorAll('[data-wa]').forEach((el) => {
  el.setAttribute('href', waLink(el.dataset.msg));
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener');
  el.addEventListener('click', () => track('whatsapp_click', el.dataset.wa));
});

/* Ponto único para plugar Google Analytics / Meta Pixel depois */
function track(evento, origem) {
  if (window.dataLayer) window.dataLayer.push({ event: evento, origem: origem });
  if (typeof gtag === 'function') gtag('event', evento, { origem: origem });
  if (typeof fbq === 'function') fbq('trackCustom', evento, { origem: origem });
}

/* ---------------------------------------------------------
   2. MÊS ATUAL, VAGAS E ANO
   --------------------------------------------------------- */
(function () {
  const meses = ['janeiro','fevereiro','março','abril','maio','junho',
                 'julho','agosto','setembro','outubro','novembro','dezembro'];
  const agora = new Date();
  const mes = meses[agora.getMonth()];
  const vagas = CONFIG.vagas + (CONFIG.vagas === 1 ? ' vaga' : ' vagas');

  document.querySelectorAll('#mesAtual, #mesAtual2').forEach(e => e.textContent = mes);
  document.querySelectorAll('#vagasTxt, #vagasTxt2').forEach(e => e.textContent = vagas);
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = agora.getFullYear();
})();

/* ---------------------------------------------------------
   3. CONTAGEM REGRESSIVA — até o fim do mês corrente
   --------------------------------------------------------- */
(function () {
  const box = document.getElementById('countdown');
  if (!box) return;
  const alvos = {
    d: box.querySelector('[data-cd="d"]'),
    h: box.querySelector('[data-cd="h"]'),
    m: box.querySelector('[data-cd="m"]'),
    s: box.querySelector('[data-cd="s"]')
  };
  const pad = (n) => String(n).padStart(2, '0');

  function fimDoMes() {
    const a = new Date();
    return new Date(a.getFullYear(), a.getMonth() + 1, 0, 23, 59, 59).getTime();
  }

  function tick() {
    let resta = fimDoMes() - Date.now();
    if (resta < 0) resta = 0;
    const s = Math.floor(resta / 1000);
    alvos.d.textContent = pad(Math.floor(s / 86400));
    alvos.h.textContent = pad(Math.floor((s % 86400) / 3600));
    alvos.m.textContent = pad(Math.floor((s % 3600) / 60));
    alvos.s.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------------------------------------------------------
   4. BARRA DE CONFIANÇA (marquee infinito)
   --------------------------------------------------------- */
(function () {
  const trilha = document.getElementById('trustTrack');
  if (!trilha) return;
  const itens = [
    'ISO 9001:2015', 'ISO 14001:2015', 'Auditorias Internas', 'Programa 5S',
    'Ciclo PDCA', 'Padronização de Processos', 'Formação de Auditores Internos',
    'Indicadores e KPIs', 'Gestão de Riscos', 'Americana e região'
  ];
  const marca =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#i-check"/></svg>';
  const bloco = itens.map(t => '<span class="trustbar__item">' + marca + t + '</span>').join('');
  trilha.innerHTML = bloco + bloco; /* duplicado para o loop ficar contínuo */
})();

/* ---------------------------------------------------------
   5. ANIMAÇÃO DE ENTRADA
   --------------------------------------------------------- */
(function () {
  const alvos = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    alvos.forEach(e => e.classList.add('is-in'));
    return;
  }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  alvos.forEach(e => obs.observe(e));

  /* Rede de segurança: o que já está na tela ao carregar aparece de imediato,
     mesmo que o observer demore (aba em segundo plano, navegador antigo etc.). */
  function revelarVisiveis() {
    document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.classList.add('is-in');
    });
  }
  window.addEventListener('load', revelarVisiveis);
  setTimeout(revelarVisiveis, 1200);
})();

/* ---------------------------------------------------------
   6. SCROLL: header fixo, barra de progresso e barra mobile
   --------------------------------------------------------- */
(function () {
  const header = document.getElementById('header');
  const progress = document.getElementById('progress');
  const bar = document.getElementById('mobileBar');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle('is-stuck', y > 40);
    progress.style.width = alturaTotal > 0 ? (y / alturaTotal) * 100 + '%' : '0%';
    if (bar) bar.classList.toggle('is-visible', y > window.innerHeight * 0.7);

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
})();

/* ---------------------------------------------------------
   7. MENU MOBILE
   --------------------------------------------------------- */
(function () {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  function fechar() {
    burger.classList.remove('is-open');
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const abrindo = !menu.classList.contains('is-open');
    burger.classList.toggle('is-open', abrindo);
    menu.classList.toggle('is-open', abrindo);
    burger.setAttribute('aria-expanded', String(abrindo));
    document.body.style.overflow = abrindo ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', fechar));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
})();

/* ---------------------------------------------------------
   8. FAQ (acordeão)
   --------------------------------------------------------- */
document.querySelectorAll('.faq__q').forEach((botao) => {
  botao.addEventListener('click', () => {
    const item = botao.parentElement;
    const resposta = item.querySelector('.faq__a');
    const aberto = item.classList.contains('is-open');

    /* fecha os demais */
    document.querySelectorAll('.faq__item.is-open').forEach((outro) => {
      if (outro !== item) {
        outro.classList.remove('is-open');
        outro.querySelector('.faq__a').style.maxHeight = null;
        outro.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      }
    });

    item.classList.toggle('is-open', !aberto);
    botao.setAttribute('aria-expanded', String(!aberto));
    resposta.style.maxHeight = aberto ? null : resposta.scrollHeight + 'px';
  });
});

/* ---------------------------------------------------------
   9. FORMULÁRIO → WHATSAPP
   --------------------------------------------------------- */
(function () {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const tel = document.getElementById('whatsapp');

  /* máscara (99) 99999-9999 */
  tel.addEventListener('input', () => {
    let v = tel.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, v.length - 4) + '-' + v.slice(-4);
    else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    else if (v.length > 0) v = '(' + v;
    tel.value = v;
  });

  function erro(campo, tem) {
    campo.closest('.field').classList.toggle('has-error', tem);
    return !tem;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome');
    const digitos = tel.value.replace(/\D/g, '');

    const okNome = erro(nome, nome.value.trim().length < 2);
    const okTel = erro(tel, digitos.length < 10);

    if (!okNome || !okTel) {
      const primeiro = form.querySelector('.field.has-error input');
      if (primeiro) primeiro.focus();
      return;
    }

    const val = (id) => {
      const el = document.getElementById(id);
      return el && el.value ? el.value.trim() : '';
    };

    const linhas = [
      'Olá Rejane! Vim pelo site da RS Consultoria e quero agendar o diagnóstico gratuito.',
      '',
      '*Nome:* ' + nome.value.trim(),
      '*WhatsApp:* ' + tel.value
    ];
    if (val('empresa')) linhas.push('*Empresa:* ' + val('empresa'));
    if (val('cidade')) linhas.push('*Cidade:* ' + val('cidade'));
    if (val('porte')) linhas.push('*Colaboradores:* ' + val('porte'));
    if (val('interesse')) linhas.push('*Preciso de:* ' + val('interesse'));
    if (val('prazo')) linhas.push('*Quero começar:* ' + val('prazo'));

    track('lead_formulario', val('interesse') || 'nao_informado');
    toast('Perfeito! Abrindo o WhatsApp com a sua mensagem…');

    const url = waLink(linhas.join('\n'));
    setTimeout(() => window.open(url, '_blank', 'noopener'), 500);
  });

  /* limpa o estado de erro assim que o usuário corrige */
  form.querySelectorAll('input, select').forEach((campo) => {
    campo.addEventListener('input', () => campo.closest('.field').classList.remove('has-error'));
  });
})();

/* ---------------------------------------------------------
   10. TOAST
   --------------------------------------------------------- */
let toastTimer;
function toast(mensagem) {
  const el = document.getElementById('toast');
  const txt = document.getElementById('toastMsg');
  if (!el) return;
  txt.textContent = mensagem;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
}

/* ---------------------------------------------------------
   11. POP-UP DE SAÍDA (1x por visita)
   --------------------------------------------------------- */
(function () {
  if (!CONFIG.exitIntent) return;
  const modal = document.getElementById('exitModal');
  if (!modal) return;
  if (sessionStorage.getItem('rs_exit_visto')) return;

  let mostrado = false;

  function abrir() {
    if (mostrado) return;
    mostrado = true;
    sessionStorage.setItem('rs_exit_visto', '1');
    modal.classList.add('is-open');
    track('exit_intent', 'abriu');
  }
  function fechar() {
    modal.classList.remove('is-open');
  }

  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && e.clientY <= 8) abrir();
  });

  /* celular / tablet: aparece depois de um tempo de leitura */
  if (window.matchMedia('(max-width:900px)').matches) {
    setTimeout(() => { if (window.scrollY > window.innerHeight) abrir(); }, CONFIG.exitDelayMobile);
  }

  document.getElementById('exitClose').addEventListener('click', fechar);
  document.getElementById('exitDismiss').addEventListener('click', fechar);
  modal.addEventListener('click', (e) => { if (e.target === modal) fechar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });
  modal.querySelectorAll('[data-wa]').forEach(a => a.addEventListener('click', fechar));
})();

/* ---------------------------------------------------------
   12. DEPOIMENTOS (liberar quando existirem)
   --------------------------------------------------------- */
(function () {
  const sec = document.getElementById('depoimentos');
  if (sec && CONFIG.mostrarDepoimentos) sec.removeAttribute('hidden');
})();
