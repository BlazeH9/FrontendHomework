const page = document.body.dataset.page;

function setupPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.textContent = visible ? '隐藏' : '显示';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', `${visible ? '隐藏' : '显示'}${input.id.includes('confirm') ? '确认密码' : '密码'}`);
      input.focus();
    });
  });
}

function setupFormFeedback(form, status) {
  form.addEventListener('invalid', () => {
    status.textContent = '请按提示检查表单内容。';
    status.classList.add('error');
  }, true);
  form.addEventListener('input', () => {
    if (status.classList.contains('error')) {
      status.textContent = '';
      status.classList.remove('error');
    }
  });
}

function setupRegister() {
  const form = document.getElementById('register-form');
  const status = document.getElementById('register-status');
  const password = document.getElementById('reg-password');
  const confirm = document.getElementById('reg-confirm');
  const confirmHint = document.getElementById('confirm-hint');
  setupFormFeedback(form, status);

  function validateConfirmation() {
    const mismatch = confirm.value !== '' && confirm.value !== password.value;
    confirm.setCustomValidity(mismatch ? '两次输入的密码不一致' : '');
    confirmHint.classList.toggle('is-error', mismatch);
    confirmHint.textContent = mismatch ? '两次输入的密码不一致，请重新确认。' : '请再次输入相同密码。';
  }
  password.addEventListener('input', validateConfirmation);
  confirm.addEventListener('input', validateConfirmation);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateConfirmation();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const profile = {
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      stage: String(data.get('stage')),
      interests: data.getAll('interests')
    };
    sessionStorage.setItem('zhixu-profile', JSON.stringify(profile));
    status.classList.remove('error');
    status.innerHTML = '学习档案已创建！<a href="login.html">前往登录 →</a>（演示模式，密码未保存）';
    form.querySelector('.form-submit').textContent = '学习档案已创建 ✓';
    form.querySelector('.form-submit').disabled = true;
  });
}

function setupLogin() {
  const form = document.getElementById('login-form');
  const status = document.getElementById('login-status');
  const email = document.getElementById('login-email');
  const remember = document.getElementById('remember-email');
  setupFormFeedback(form, status);
  const rememberedEmail = localStorage.getItem('zhixu-remembered-email');
  if (rememberedEmail) {
    email.value = rememberedEmail;
    remember.checked = true;
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const address = email.value.trim();
    if (remember.checked) localStorage.setItem('zhixu-remembered-email', address);
    else localStorage.removeItem('zhixu-remembered-email');
    const saved = JSON.parse(sessionStorage.getItem('zhixu-profile') || 'null');
    const name = saved && saved.email.toLowerCase() === address.toLowerCase()
      ? saved.name : address.split('@')[0];
    sessionStorage.setItem('zhixu-active-name', name);
    status.classList.remove('error');
    status.textContent = '登录演示成功，正在进入答疑首页…';
    window.setTimeout(() => { window.location.href = 'index.html'; }, 650);
  });
}

const subjectAdvice = {
  '数学': ['先把题目里的已知量、未知量和关系写出来。', '找到对应的定义或公式，并试着代入一个简单例子。', '回到原题，检查每一步推导是否符合条件。'],
  '语文': ['先圈出关键词，确认题目真正要求回答什么。', '结合原文语境，找出能支撑观点的句子。', '用“观点 + 依据 + 解释”的顺序组织答案。'],
  '英语': ['先抓住题目或段落中的关键词，判断核心意思。', '结合上下文理解词句，不急着逐字翻译。', '用自己的话复述，再检查语法和表达。'],
  '物理': ['画出简单示意图，标清研究对象和已知条件。', '判断涉及的物理规律，写出对应关系式。', '代入单位和数值，检查结果是否符合实际。'],
  '化学': ['先辨认物质、反应条件和题目中的变化。', '用化学概念或方程式串起因果关系。', '核对守恒、单位与实验现象，再整理答案。'],
  '学习方法': ['把大目标拆成今天能完成的一个小任务。', '用短时间专注练习，并记录最容易卡住的地方。', '隔一段时间回看错误，调整下一次的练习重点。'],
  '通用': ['先用一句话说清楚：你已经知道什么、哪里还不明白。', '把问题拆成更小的部分，逐个找概念或例子。', '试着自己复述一遍，再用一个新例子检验理解。']
};

function setupHome() {
  const activeName = sessionStorage.getItem('zhixu-active-name');
  const savedProfile = JSON.parse(sessionStorage.getItem('zhixu-profile') || 'null');
  if (activeName) {
    document.querySelector('.hero-proof span:last-child').textContent = `欢迎回来，${activeName}。今天从一个问题开始。`;
    const loginLink = document.querySelector('.header-login');
    loginLink.innerHTML = '切换账号 <span aria-hidden="true">↗</span>';
  }
  const form = document.getElementById('question-form');
  const question = document.getElementById('question');
  const subject = document.getElementById('subject');
  if (savedProfile && activeName === savedProfile.name && savedProfile.interests.length) {
    const firstInterest = savedProfile.interests[0];
    if ([...subject.options].some((option) => option.value === firstInterest)) subject.value = firstInterest;
  }
  const count = document.getElementById('question-count');
  question.addEventListener('input', () => {
    count.value = String(question.value.length);
    question.setCustomValidity('');
  });
  document.querySelectorAll('[data-question]').forEach((chip) => {
    chip.addEventListener('click', () => {
      question.value = chip.dataset.question;
      subject.value = chip.dataset.subject;
      question.dispatchEvent(new Event('input'));
      question.focus();
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const topic = subject.value;
    const prompt = question.value.trim();
    if (!prompt) {
      question.setCustomValidity('请输入具体的问题');
      question.reportValidity();
      return;
    }
    let intro = `这是一个值得细想的${topic === '通用' ? '' : topic}问题。可以先沿着下面的思路，把它拆开来看：`;
    let steps = subjectAdvice[topic] || subjectAdvice['通用'];
    if (topic === '数学' && prompt.includes('判别式')) {
      intro = '一元二次方程 ax² + bx + c = 0（a ≠ 0）的判别式是 Δ = b² − 4ac。它告诉我们方程有几个实数解。';
      steps = ['把方程整理为 ax² + bx + c = 0，找出 a、b、c。', '算出 Δ = b² − 4ac：大于 0 时有两个不相等的实数根；等于 0 时有一个重复实数根；小于 0 时没有实数根。', '用图像想象：抛物线与 x 轴分别相交两次、相切一次，或没有交点。'];
    } else if (topic === '英语' && prompt.includes('阅读')) {
      intro = '阅读题做不完时，可以先减少无目标的逐字阅读，把时间留给定位和核对。';
      steps = ['先看题目，圈出人名、时间、转折词等定位信息。', '快速读每段首尾句，了解文章结构，再回到相关段落细读。', '用原文证据核对选项；遇到生词先结合上下文推测，不必每个词都查。'];
    }
    document.getElementById('answer-placeholder').hidden = true;
    document.getElementById('answer-content').hidden = false;
    document.getElementById('answer-question').textContent = prompt;
    document.getElementById('answer-intro').textContent = intro;
    const list = document.getElementById('answer-steps');
    list.replaceChildren(...steps.map((step) => {
      const item = document.createElement('li');
      item.textContent = step;
      return item;
    }));
    document.getElementById('answer-next').textContent = '下一步：试着补充你的具体题目或已尝试的方法，思路会更清楚。';
    document.getElementById('answer-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

setupPasswordToggles();
if (page === 'register') setupRegister();
if (page === 'login') setupLogin();
if (page === 'home') setupHome();
