// ── KONFIGURASI FIREBASE ──
const firebaseConfig = {
  apiKey: "AIzaSyCl5CsrD8I-dfmWNtmkavTKMLuGPMw-1r4",
  authDomain: "undangan-richard-dinna.firebaseapp.com",
  // Kunci perbaikan: Menambahkan databaseURL
  databaseURL: "https://undangan-richard-dinna-default-rtdb.firebaseio.com", 
  projectId: "undangan-richard-dinna",
  storageBucket: "undangan-richard-dinna.firebasestorage.app",
  messagingSenderId: "87148860254",
  appId: "1:87148860254:web:cedc8bf6c1cc88b6edb5cf",
  measurementId: "G-TGHXE582CL"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const wishesRef = db.ref('wishes');

const $ = (id) => document.getElementById(id);
const WEDDING_DATE = new Date('2026-11-01T08:00:00');

// ── Cover ──
function openInvitation() {
  const c = $('cover');
  if (c) {
    c.style.opacity = '0';
    c.style.pointerEvents = 'none';
    setTimeout(() => (c.style.display = 'none'), 800);
  }
  if ($('navbar'))$('navbar').classList.add('visible');
  if ($('musicBtn'))$('musicBtn').classList.add('show');
  createPetals(); 
  startCountdown(); 
  listenWishes();
}

// ── Kelopak ──
function createPetals() {
  const box = $('petals');
  if (!box) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.width = Math.random() * 8 + 8 + 'px';
    p.style.height = Math.random() * 10 + 12 + 'px';
    p.style.animationDuration = Math.random() * 6 + 7 + 's';
    p.style.animationDelay = Math.random() * 8 + 's';
    box.appendChild(p);
  }
}

// ── Hitung mundur ──
function startCountdown() {
  const ids = { days: 't-days', hours: 't-hours', mins: 't-mins', secs: 't-secs' };
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const diff = Math.max(0, WEDDING_DATE - new Date());
    const v = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    };
    for (const k in ids) {
      if ($(ids[k]))$(ids[k]).textContent = pad(v[k]);
    }
  };
  tick(); 
  setInterval(tick, 1000);
}

// ── Reveal & progress ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible'));
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  if ($('progress')) {$('progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
  }
});

// ── Navigasi ──
if ($('hamburger')) $('hamburger').addEventListener('click', () =>$('navmenu').classList.toggle('open'));
if ($('navmenu')) $('navmenu').addEventListener('click', () =>$('navmenu').classList.remove('open'));

// ── Tab hadiah ──
document.querySelectorAll('.gift-tab').forEach((btn) => btn.addEventListener('click', () => {
  document.querySelectorAll('.gift-tab, .gift-panel').forEach((el) => el.classList.remove('active'));
  btn.classList.add('active');
  if ($('panel-' + btn.dataset.panel))$('panel-' + btn.dataset.panel).classList.add('active');
}));

// ── Ucapan (Realtime Firebase) ──
const escHtml = (s) => s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';

function listenWishes() {
  wishesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    let wishesList = [];
    if (data) {
      wishesList = Object.keys(data).map(key => data[key]).reverse();
    }
    renderWishes(wishesList);
  });
}

function renderWishes(wishes) {
  const container = $('wishes-list');
  if (!container) return;

  if (!wishes.length) {
    container.innerHTML = `<p class="center" style="color: #888; text-align: center; margin-top: 15px;">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>`;
    return;
  }
  container.innerHTML = wishes.map((w) => `
    <div class="wish-card" style="background: rgba(255,255,255,0.9); padding: 12px; margin-top: 10px; border-radius: 8px; border: 1px solid #eee;">
      <div class="wish-head" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <b style="color: #333;">${escHtml(w.name)}</b>
        <small style="color: #888;">${escHtml(w.date)}</small>
      </div>
      <p style="margin: 5px 0; color: #555;">"${escHtml(w.text)}"</p>
      <small style="color: #d4af37; font-weight: bold;">${escHtml(w.attend)}</small>
    </div>`).join('');
}

if ($('btnWish')) {$('btnWish').addEventListener('click', () => {
    const nameInput = $('wish-name');
    const textInput = $('wish-text');
    const attendInput = $('wish-attend');

    const name = nameInput ? nameInput.value.trim() : '';
    const text = textInput ? textInput.value.trim() : '';
    const attend = attendInput ? attendInput.value : '✅ Hadir';

    if (!name || !text) {
      showToast('Mohon isi nama dan ucapan ✦');
      return;
    }

    const newWish = {
      name: name,
      text: text,
      attend: attend,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      timestamp: Date.now()
    };

    wishesRef.push(newWish)
      .then(() => {
        if (nameInput) nameInput.value = '';
        if (textInput) textInput.value = '';
        showToast('Ucapan terkirim, terima kasih! 🌸');
      })
      .catch((err) => {
        console.error("Firebase Error:", err);
        showToast('Gagal mengirim ucapan.');
      });
  });
}

// ── RSVP ──
let rsvpStatus = 'Hadir';
document.querySelectorAll('.rsvp-btn').forEach((btn) => btn.addEventListener('click', () => {
  document.querySelectorAll('.rsvp-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  rsvpStatus = btn.dataset.val;
}));

if ($('btnRsvp')) {$('btnRsvp').addEventListener('click', () => {
    const name = $('rsvp-name') ?$('rsvp-name').value.trim() : '';
    const phone = $('rsvp-phone') ?$('rsvp-phone').value.trim() : '';
    if (!name || !phone) return showToast('Mohon isi nama dan nomor HP');
    
    db.ref('rsvp').push({
      name: name,
      phone: phone,
      status: rsvpStatus,
      guests: $('rsvp-guests') ?$('rsvp-guests').value : '1 orang',
      timestamp: Date.now()
    });

    showToast(`Terima kasih, ${name}! Kehadiran: ${rsvpStatus} 🎊`);
    if ($('rsvp-name'))$('rsvp-name').value = '';
    if ($('rsvp-phone'))$('rsvp-phone').value = '';
  });
}

// ── Lightbox ──
document.querySelectorAll('.g-item').forEach((item) => item.addEventListener('click', () => {
  const img = document.createElement('img');
  img.src = item.dataset.src;
  if ($('lb-content'))$('lb-content').replaceChildren(img);
  if ($('lightbox'))$('lightbox').classList.add('open');
}));
if ($('lightbox')) $('lightbox').addEventListener('click', () =>$('lightbox').classList.remove('open'));

// ── Salin & toast ──
document.querySelectorAll('.copy-btn').forEach((btn) => btn.addEventListener('click', () => {
  navigator.clipboard.writeText(btn.dataset.copy).catch(() => {});
  showToast('Nomor rekening disalin! ✦');
}));

function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Musik ──
let bgMusic;
if ($('musicBtn')) {$('musicBtn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (!bgMusic) {
      bgMusic = new Audio('lagu2.mp3'); 
      bgMusic.loop = true; 
      bgMusic.volume = 0.5; 
      bgMusic.play().catch((err) => console.error("Gagal memutar audio:", err));
      btn.classList.add('playing');
    } else {
      bgMusic.pause();
      bgMusic = null;
      btn.classList.remove('playing');
    }
  });
}

if ($('btnOpen'))$('btnOpen').addEventListener('click', openInvitation);
if ($('cover'))$('cover').addEventListener('click', openInvitation);
