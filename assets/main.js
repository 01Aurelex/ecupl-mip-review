/* 华政 MIP 复习站 · 共享脚本 */

// ——————————————————————— 工具 ———————————————————————

function starStr(n) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="off">★</span>';
  return '<span class="stars">' + s + '</span>';
}

function repoUrl(r) {
  return `https://github.com/${r.owner}/${r.name}`;
}

function esc(s) {
  return String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
}

/* ——————————————————————— 仓库卡片 ——————————————————————— */

function renderRepo(r) {
  const tone = { rose: '', gold: 'gold', lilac: 'plain', sage: 'plain' }[r.tone] || '';
  return `
  <article class="card">
    <div class="flex-between" style="align-items:flex-start">
      <div>
        <a class="mono" href="${repoUrl(r)}" target="_blank" rel="noopener" style="font-weight:600;color:var(--rose-800)">${r.name}</a>
        <div class="source-note" style="margin-top:4px">${r.owner} · ${r.lang} · ${r.stars} ★ · 更新 ${r.updated}</div>
      </div>
      <span class="chip ${tone}">${r.tag}</span>
    </div>

    <div class="pill-row" style="margin:12px 0">
      ${r.stats.map(s => `<span class="chip plain">${s}</span>`).join('')}
    </div>

    <p style="font-size:.92rem;color:var(--ink-soft);margin-bottom:12px">${r.desc}</p>

    <div class="pill-row" style="margin-bottom:12px">
      <span class="chip">${r.matched}</span>
      <span class="chip plain">许可 ${r.license}</span>
      ${starStr(r.score)}<span class="source-note">匹配度</span>
    </div>

    <div class="note plain" style="margin:0 0 12px">
      <span class="nt">用法</span>
      ${r.how}
    </div>

    ${r.highlight ? `<div class="note" style="margin:0 0 12px"><span class="nt">亮点</span>${r.highlight}</div>` : ''}
    ${r.warn ? `<div class="note warn" style="margin:0 0 12px"><span class="nt">注意</span>${r.warn}</div>` : ''}

    <a class="btn btn-ghost btn-sm" href="${repoUrl(r)}" target="_blank" rel="noopener">访问 GitHub</a>
  </article>`;
}

/* ——————————————————————— 教师卡片 ——————————————————————— */

const KEY_TAGS = {
  'AI': ['人工智能', 'AI', '生成式', 'AIGC', '算法', '机器学习', '智能'],
  '竞争法': ['竞争法', '反不正当竞争', '反垄断', '平台', '垄断'],
  '国际': ['国际', '涉外', '比较', 'TRIPS', '外国', '域外', '跨境', '美国', '日本', '欧盟'],
  '管理': ['管理', '战略', '运营', '金融', '质押', '转化', '导航', '合规', '专利质量', '技术锁定', '价值链']
};

function tagMatch(card, tag) {
  const words = KEY_TAGS[tag] || [tag];
  const hay = (card.dataset.name + ' ' + card.dataset.field + ' ' + card.dataset.key).toLowerCase();
  return words.some(w => hay.includes(w.toLowerCase()));
}

function renderFaculty(f) {
  const papers = f.papers.length
    ? f.papers.map(p => {
        const link = p.u
          ? `<div class="f-link"><a href="${p.u}" target="_blank" rel="noopener">${p.k2 || '查看原文'} ↗</a></div>`
          : '';
        return `<li>${esc(p.t)}<span class="yr">${p.y}</span><span class="f-journal">　${p.j}</span>${link}</li>`;
      }).join('')
    : `<li style="color:var(--ink-mute)">近三年未检索到公开论文记录</li>`;

  return `
  <article class="f-card" id="${f.name}" data-name="${f.name}" data-field="${f.field}" data-group="${f.group}" data-key="${(f.name + f.field + f.papers.map(p => p.t + p.j).join() + f.value).toLowerCase()}">
    <div class="f-head">
      <span class="f-name">${f.name}</span>
      <span class="f-title">${f.title}</span>
    </div>
    <span class="f-field">${f.field}</span>
    <ul class="f-papers">${papers}</ul>
    ${f.note ? `<div class="f-note"><span>核验说明</span><p>${f.note}</p></div>` : ''}
    <div class="f-value"><b>备考价值</b><br>${f.value}</div>
  </article>`;
}

/* ——————————————————————— 交互 ——————————————————————— */

function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabs => {
    const btns = tabs.querySelectorAll('.tab');
    const panels = tabs.parentElement.querySelectorAll(':scope > .tab-panel');
    btns.forEach((b, i) => {
      b.addEventListener('click', () => {
        btns.forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        panels.forEach((p, j) => p.classList.toggle('on', i === j));
      });
    });
  });
}

function initFilter(opts) {
  const input = document.querySelector(opts.input);
  const grid = document.querySelector(opts.grid);
  const chips = document.querySelectorAll(opts.chip);
  const countEl = document.querySelector(opts.count);
  if (!input || !grid) return;

  let activeFilter = 'all';
  let keyword = '';

  function apply() {
    let visible = 0;
    grid.querySelectorAll('.f-card').forEach(card => {
      const matchKw = !keyword || card.dataset.key.includes(keyword);
      const matchF = activeFilter === 'all' || card.dataset.group === activeFilter || tagMatch(card, activeFilter);
      const show = matchKw && matchF;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (countEl) countEl.textContent = `共 ${visible} 位教师`;
  }

  input.addEventListener('input', e => { keyword = e.target.value.trim().toLowerCase(); apply(); });
  chips.forEach(c => {
    c.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      activeFilter = c.dataset.filter;
      apply();
    });
  });
  apply();
}

/* ——————————————————————— 题库 ——————————————————————— */

function initQuiz() {
  const mount = document.querySelector('[data-quiz]');
  if (!mount || !window.QUESTIONS) return;

  const ALL = window.QUESTIONS;
  const topicSel = document.querySelector('#qTopic');
  const modeSel = document.querySelector('#qMode');
  const countEl = document.querySelector('#qCount');
  const listEl = document.querySelector('#qList');
  const srcEl = document.querySelector('#qSource');

  // 填充专题下拉
  const topics = [...new Set(ALL.map(q => q.topic))].sort((a, b) => a.localeCompare(b, 'zh'));
  topics.forEach(t => {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = `${t}（${ALL.filter(q => q.topic === t).length}）`;
    topicSel.appendChild(o);
  });
  const secOpt = document.createElement('option');
  secOpt.value = '__all__';
  secOpt.textContent = `全部专题（${ALL.length}）`;
  topicSel.prepend(secOpt);

  if (srcEl && window.QUESTION_SOURCES) {
    srcEl.innerHTML = window.QUESTION_SOURCES.map(s => `
      <p>题库来源：<a href="${s.url}" target="_blank" rel="noopener">github.com/${s.owner}/${s.name}</a>
      ｜ 在线版：<a href="${s.pages}" target="_blank" rel="noopener">${s.pages}</a><br>
      ${s.desc}　原始文件：<span class="mono">${s.files.join('</span>、<span class="mono">')}</span></p>
    `).join('');
  }

  function current() {
    const t = topicSel.value;
    const m = modeSel.value;
    let list = t === '__all__' ? ALL : ALL.filter(q => q.topic === t);
    if (m === 's') list = list.filter(q => q.k === 's');
    if (m === 'm') list = list.filter(q => q.k === 'm');
    return list;
  }

  function render() {
    const list = current();
    countEl.innerHTML = `本组 <b>${list.length}</b> 题`;
    if (!list.length) {
      listEl.innerHTML = '<div class="q-empty">该组合下没有题目，请调整筛选条件。</div>';
      return;
    }
    listEl.innerHTML = list.map((q, i) => `
      <div class="q-card" data-qid="${q.id}">
        <div class="q-meta">
          <span class="chip">${q.k === 'm' ? '多选' : '单选'}</span>
          <span class="chip plain">${q.topic}</span>
          ${q.page ? `<span class="chip plain">教材 P${q.page}</span>` : ''}
          <span class="chip plain">${q.s}</span>
        </div>
        <div class="q-stem">${i + 1}. ${esc(q.t)}</div>
        <div class="q-opts">
          ${q.o.map((o, j) => `<div class="q-opt" data-opt="${String.fromCharCode(65 + j)}"><span class="k">${String.fromCharCode(65 + j)}</span><span>${esc(o)}</span></div>`).join('')}
        </div>
        <div class="q-actions">
          <button class="btn btn-primary btn-sm q-check">提交答案</button>
          <button class="btn btn-ghost btn-sm q-reset" style="display:none">重做</button>
          <span class="q-hint">正确答案：${q.a.split('').join(' / ')}</span>
        </div>
        <div class="q-exp" style="display:none">
          <div class="eh">解析</div>${esc(q.e || '（本题源数据未附解析）')}
        </div>
        <div class="q-src">题号 ${q.id}　源 ID ${q.src}　来源 ${window.QUESTION_SOURCES[0].owner}/${window.QUESTION_SOURCES[0].name}</div>
      </div>`).join('');

    // 绑定交互
    listEl.querySelectorAll('.q-card').forEach(card => {
      const q = list.find(x => x.id === card.dataset.qid);
      const opts = card.querySelectorAll('.q-opt');
      const checkBtn = card.querySelector('.q-check');
      const resetBtn = card.querySelector('.q-reset');
      const exp = card.querySelector('.q-exp');
      const hint = card.querySelector('.q-hint');
      let sel = new Set();

      opts.forEach(o => o.addEventListener('click', () => {
        if (card.dataset.done) return;
        const k = o.dataset.opt;
        if (q.k === 's') {
          sel.clear();
          opts.forEach(x => x.classList.remove('sel'));
          sel.add(k);
          o.classList.add('sel');
        } else {
          if (sel.has(k)) { sel.delete(k); o.classList.remove('sel'); }
          else { sel.add(k); o.classList.add('sel'); }
        }
      }));

      checkBtn.addEventListener('click', () => {
        if (!sel.size) { hint.textContent = '请先选择答案'; hint.style.color = 'var(--err)'; return; }
        card.dataset.done = '1';
        const right = new Set(q.a.split(''));
        const correct = sel.size === right.size && [...sel].every(x => right.has(x));
        opts.forEach(o => {
          const k = o.dataset.opt;
          o.classList.add('locked');
          if (right.has(k)) o.classList.add('right');
          else if (sel.has(k)) o.classList.add('wrong');
        });
        hint.innerHTML = correct
          ? `<span style="color:var(--ok);font-weight:700">回答正确</span>`
          : `<span style="color:var(--err);font-weight:700">回答错误</span>　正确答案是 ${q.a.split('').join(' / ')}`;
        exp.style.display = 'block';
        checkBtn.style.display = 'none';
        resetBtn.style.display = '';
      });

      resetBtn.addEventListener('click', () => {
        delete card.dataset.done;
        sel.clear();
        opts.forEach(x => x.classList.remove('sel', 'right', 'wrong', 'locked'));
        exp.style.display = 'none';
        checkBtn.style.display = '';
        resetBtn.style.display = 'none';
        hint.textContent = `正确答案：${q.a.split('').join(' / ')}`;
        hint.style.color = '';
      });
    });
  }

  topicSel.addEventListener('change', render);
  modeSel.addEventListener('change', render);
  render();
}

/* ——————————————————————— 装配 ——————————————————————— */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initFilter({ input: '#facSearch', grid: '[data-faculty]', chip: '.filter-row .tab', count: '#facCount' });
  initQuiz();

  // 导航
  const navSlot = document.querySelector('[data-nav]');
  if (navSlot) {
    const base = navSlot.dataset.base || '';
    navSlot.innerHTML = `
      <a class="brand" href="${base}index.html">
        <span class="brand-text">
          <span class="brand-title">华政 MIP 复习站</span>
          <span class="brand-sub">　知识产权硕士</span>
        </span>
      </a>
      <nav class="nav-links">
        <a href="${base}index.html">首页</a>
        <a href="${base}pages/647.html">647 基础</a>
        <a href="${base}pages/821.html">821 综合</a>
        <a href="${base}pages/quiz.html">题库</a>
        <a href="${base}pages/faculty.html">教师论文</a>
        <a href="${base}pages/resources.html">资源清单</a>
        <a href="${base}pages/writing.html">论文复试</a>
        <a href="${base}pages/plan.html">30 天计划</a>
      </nav>`;
  }

  // 页脚
  const footSlot = document.querySelector('[data-footer]');
  if (footSlot) {
    const fbase = footSlot.dataset.base || (document.querySelector('[data-nav]')?.dataset.base) || '';
    footSlot.innerHTML = `
      <div class="footer-inner">
        <div>
          <h5>华东政法大学 知识产权硕士 MIP</h5>
          <p>Master of Intellectual Property · 华东政法大学知识产权学院<br>
          初试：101 政治 / 204 英语（二）/ 647 知识产权基础 / 821 知识产权综合<br>
          2025 首年招生 · 学费 3.3 万元/年 · 设全日制与非全日制</p>
        </div>
        <div>
          <h5>备考模块</h5>
          <a href="${fbase}pages/647.html">647 知识产权基础</a>
          <a href="${fbase}pages/821.html">821 知识产权综合</a>
          <a href="${fbase}pages/quiz.html">知识产权题库</a>
          <a href="${fbase}pages/faculty.html">任课教师论文</a>
          <a href="${fbase}pages/resources.html">GitHub 资源清单</a>
          <a href="${fbase}pages/writing.html">论文写作与复试</a>
          <a href="${fbase}pages/plan.html">30 天冲刺计划</a>
        </div>
        <div>
          <h5>数据说明</h5>
          <p>教师论文经公开学术检索整理，均附原文链接；未检出的附核验线索。题库来自 GitHub 公开仓库 patent-exam-2026。考纲与科目以华政知识产权学院及研招网最新公告为准。本站不构成法律意见。</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 华政 MIP 复习站 · 个人备考工具</span>
        <span>引用请核对法条时效与原文</span>
      </div>`;
  }

  // 仓库列表
  const repoGrid = document.querySelector('[data-repos]');
  if (repoGrid && window.REPOS) {
    const ids = repoGrid.dataset.repos ? repoGrid.dataset.repos.split(',') : null;
    const list = ids ? ids.map(i => window.REPOS.find(r => r.id === i)).filter(Boolean) : window.REPOS;
    repoGrid.innerHTML = list.map(renderRepo).join('');
  }

  // 教师列表
  const facGrid = document.querySelector('[data-faculty]');
  if (facGrid && window.FACULTY) facGrid.innerHTML = window.FACULTY.map(renderFaculty).join('');

  // 数字滚动
  const stats = document.querySelectorAll('[data-count]');
  if (stats.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count;
        let cur = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const t = setInterval(() => {
          cur += step;
          if (cur >= target) { cur = target; clearInterval(t); }
          el.textContent = cur;
        }, 20);
        io.unobserve(el);
      });
    }, { threshold: .4 });
    stats.forEach(s => io.observe(s));
  }

  // 锚点直达教师
  if (location.hash && document.querySelector('.f-card')) {
    const name = decodeURIComponent(location.hash.replace('#', ''));
    const card = document.querySelector(`.f-card[id="${name}"]`);
    if (card) {
      card.style.borderColor = 'var(--rose-400)';
      setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }
});
