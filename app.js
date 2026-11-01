const API = 'https://eblyyyaklqichtztcezg.supabase.co/functions/v1';
const PLANS = {
  monthly: { name: 'Mensal', price: 'R$ 14,90' },
  semester: { name: 'Semestral', price: 'R$ 59,90' },
  annual: { name: 'Anual', price: 'R$ 89,90' },
  lifetime: { name: 'Vitalício', price: 'R$ 149,90' },
};
const $ = (s, r = document) => r.querySelector(s);

// aparece ao rolar
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('on'), io.unobserve(e.target))), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
addEventListener('scroll', () => $('#nav').classList.toggle('solid', scrollY > 40), { passive: true });

async function post(path, body) {
  const r = await fetch(`${API}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || 'falha');
  return j;
}
function msg(el, text, cls) {
  el.textContent = text;
  el.className = 'fmsg ' + (cls || '');
}

// ---------- compra ----------
const modal = $('#buy');
let plan = null;
function openBuy(p) {
  plan = p;
  $('#bplan').textContent = 'Plano ' + PLANS[p].name;
  $('#bprice').textContent = PLANS[p].price;
  msg($('#bmsg'), '');
  modal.hidden = false;
  try { const e = localStorage.getItem('fye-email'); if (e) $('#bform').email.value = $('#bform').email2.value = e; } catch {}
  setTimeout(() => $('#bform').email.focus(), 50);
}
document.querySelectorAll('.buy').forEach((b) => (b.onclick = () => openBuy(b.dataset.plan)));
modal.addEventListener('click', (e) => (e.target === modal || e.target.closest('[data-close]')) && (modal.hidden = true));
addEventListener('keydown', (e) => e.key === 'Escape' && (modal.hidden = true));
const pre = new URLSearchParams(location.search).get('plano');
if (pre && PLANS[pre]) openBuy(pre);

$('#bform').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const email = f.email.value.trim().toLowerCase();
  if (email !== f.email2.value.trim().toLowerCase()) return msg($('#bmsg'), 'Os emails não são iguais.', 'err');
  const btn = f.querySelector('button');
  btn.disabled = true;
  msg($('#bmsg'), 'Abrindo o pagamento...');
  try {
    try { localStorage.setItem('fye-email', email); } catch {}
    const r = await post('checkout', { plan, email });
    location.href = r.url;
  } catch {
    msg($('#bmsg'), 'Não deu para abrir o pagamento agora. Tente de novo em instantes ou fale com o suporte.', 'err');
    btn.disabled = false;
  }
};

// ---------- suporte ----------
$('#sform').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const btn = f.querySelector('button');
  btn.disabled = true;
  msg($('#smsg'), 'Enviando...');
  try {
    await post('support', { name: f.name.value.trim(), email: f.email.value.trim(), topic: f.topic.value, message: f.message.value.trim(), site: f.site.value });
    f.reset();
    msg($('#smsg'), 'Mensagem enviada! Você recebe a resposta no seu email.', 'ok');
  } catch {
    msg($('#smsg'), 'Não deu para enviar agora. Chama a gente no Instagram @fye.visuais.', 'err');
  }
  btn.disabled = false;
};
