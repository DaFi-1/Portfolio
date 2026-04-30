document.addEventListener('DOMContentLoaded', () => {
    const USER = 'DaFi-1';
    const API_REPOS = `https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`;
    const OG_BASE = 'https://opengraph.githubassets.com';
    const RAW_BASE = 'https://raw.githubusercontent.com';
    const CERT_BASE = 'certifications/';

    const i18n = {
        pt: {
            role: 'Developer',
            bio: 'Trabalho bem com pessoas e sou fanático por rotinas.',
            email: 'contato@da.fi',
            aboutTitle: 'Quem Sou',
            aboutP1: 'Sou um desenvolvedor autodidata com experiência prática em dezenas de projetos reais. Minha trajetória começou da curiosidade e da disciplina diária — aprendendo, quebrando coisas e reconstruindo melhor a cada iteração.',
            aboutP2: 'Atuo como generalista: backend, frontend, DevOps, automação e inteligência artificial não são barreiras para mim, são ferramentas. Cada stack é uma peça do puzzle que uso para entregar soluções completas e eficientes para meus clientes.',
            openSourceTitle: 'Open Source',
            openSource1: 'Colaboração ativa em projetos <a href="https://suckless.org" target="_blank" rel="noopener">suckless.org</a>',
            openSource2: 'Colaboração ativa OpenStack <a href="https://www.openstack.org" target="_blank" rel="noopener">openstack.org</a>',
            openSource3: 'Colaboração ativa Python <a href="https://www.python.org" target="_blank" rel="noopener">python.org</a>',
            filterProjects: 'Projects',
            filterEbooks: 'Ebooks Projects',
            filterCertifications: 'Certifications',
            backToTop: 'Voltar ao topo',
            errorLoad: 'Erro ao carregar projetos.',
            badgeCompleted: '✓ Concluído',
            badgeDev: 'Em desenvolvimento',
        },
        en: {
            role: 'Developer',
            bio: 'I work well with people and I\'m fanatical about routines.',
            email: 'contact@da.fi',
            aboutTitle: 'About Me',
            aboutP1: 'I\'m a self-taught developer with hands-on experience across dozens of real-world projects. My journey started from curiosity and daily discipline — learning, breaking things, and rebuilding them better with every iteration.',
            aboutP2: 'I operate as a generalist: backend, frontend, DevOps, automation, and artificial intelligence aren\'t barriers — they\'re tools. Each stack is a piece of the puzzle I use to deliver complete, efficient solutions for my clients.',
            openSourceTitle: 'Open Source',
            openSource1: 'Active collaboration in <a href="https://suckless.org" target="_blank" rel="noopener">suckless.org</a> projects',
            openSource2: 'Active OpenStack collaboration <a href="https://www.openstack.org" target="_blank" rel="noopener">openstack.org</a>',
            openSource3: 'Active Python collaboration <a href="https://www.python.org" target="_blank" rel="noopener">python.org</a>',
            filterProjects: 'Projects',
            filterEbooks: 'Ebooks Projects',
            filterCertifications: 'Certifications',
            backToTop: 'Back to top',
            errorLoad: 'Error loading projects.',
            badgeCompleted: '✓ Completed',
            badgeDev: 'In development',
        },
        zh: {
            role: '开发者',
            bio: '我善于与人合作，对日常规律充满热情。',
            email: 'contact@da.fi',
            aboutTitle: '关于我',
            aboutP1: '我是一名自学成才的开发者，拥有数十个真实项目的实战经验。我的旅程始于好奇心和每日自律——学习、打破、并在每次迭代中重建得更好。',
            aboutP2: '我是一名全栈型开发者：后端、前端、DevOps、自动化和人工智能不是障碍，而是工具。每个技术栈都是我为客户交付完整高效解决方案的拼图之一。',
            openSourceTitle: '开源',
            openSource1: '积极参与 <a href="https://suckless.org" target="_blank" rel="noopener">suckless.org</a> 项目协作',
            openSource2: '积极参与 OpenStack 协作 <a href="https://www.openstack.org" target="_blank" rel="noopener">openstack.org</a>',
            openSource3: '积极参与 Python 协作 <a href="https://www.python.org" target="_blank" rel="noopener">python.org</a>',
            filterProjects: '项目',
            filterEbooks: '电子书项目',
            filterCertifications: '认证',
            backToTop: '回到顶部',
            errorLoad: '加载项目时出错。',
            badgeCompleted: '✓ 已完成',
            badgeDev: '开发中',
        }
    };

    let currentLang = 'en';

    const setLanguage = (lang) => {
        if (!i18n[lang]) return;
        currentLang = lang;
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang === 'zh' ? 'zh-CN' : 'en';

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (i18n[lang][key] !== undefined) {
                if (i18n[lang][key].includes('<')) {
                    el.innerHTML = i18n[lang][key];
                } else {
                    el.textContent = i18n[lang][key];
                }
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.dataset.i18nTitle;
            if (i18n[lang][key]) el.title = i18n[lang][key];
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        if (loadedRepos) {
            document.querySelectorAll('.github-preview[data-category="ebooks-projects"] .badge').forEach(badge => {
                const isCompleted = badge.classList.contains('badge-success');
                badge.outerHTML = isCompleted
                    ? `<span class="badge badge-success">${i18n[lang].badgeCompleted}</span>`
                    : `<span class="badge badge-development">${i18n[lang].badgeDev}</span>`;
            });
        }

        const emailEl = document.querySelector('.banner-email');
        if (emailEl) emailEl.href = `mailto:${i18n[lang].email}`;

        if (loadedRepos && els.grid.querySelector('p[style]')) {
            els.grid.innerHTML = `<p style="text-align:center;color:#64748b;grid-column:1/-1;">${i18n[lang].errorLoad}</p>`;
        }

        localStorage.setItem('lang', lang);
    };

    const els = {
        filterBtns: document.querySelectorAll('.filter-btn'),
        grid: document.getElementById('projects-grid'),
        filters: document.querySelector('.filters'),
        backToTop: document.getElementById('backToTop'),
        langBtns: document.querySelectorAll('.lang-btn')
    };

    const isEbook = (name) => name.toLowerCase().startsWith('ebook');
    const getCategory = (name) => isEbook(name) ? 'ebooks-projects' : 'project';
    const getEbookCover = (repo) => `${RAW_BASE}/${USER}/${repo.name}/${repo.default_branch}/res/ebook.png`;
    const getOGImage = (repo) => `${OG_BASE}/${repo.id}/${USER}/${repo.name}`;

    const fetchJSON = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed: ${url}`);
        return res.json();
    };

    const checkFileExists = async (url) => {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            return res.ok;
        } catch { return false; }
    };

    const applyFilter = (value) => {
        els.grid.querySelectorAll('.github-preview, .cert-preview').forEach(el => {
            el.classList.toggle('hidden', value !== 'all' && el.dataset.category !== value);
        });
    };

    const updateCounts = () => {
        ['project', 'ebooks-projects', 'certification'].forEach(cat => {
            const count = els.grid.querySelectorAll(`[data-category="${cat}"]`).length;
            const btn = document.querySelector(`.filter-btn[data-filter="${cat}"] .count`);
            if (btn) btn.textContent = count;
        });
    };

    const loadCertifications = async () => {
        const fragment = document.createDocumentFragment();
        let i = 1;
        const tryLoad = () => new Promise(resolve => {
            const img = new Image();
            const src = `${CERT_BASE}certification_${i}.png`;
            img.onload = () => {
                const cert = document.createElement('div');
                cert.className = 'cert-preview';
                cert.dataset.category = 'certification';
                cert.dataset.link = src;
                cert.innerHTML = `<img class="preview-image" src="${src}" alt="Certification ${i}" loading="lazy">`;
                fragment.appendChild(cert);
                i++;
                i <= 20 ? tryLoad().then(resolve) : resolve();
            };
            img.onerror = () => resolve();
            img.src = src;
        });
        await tryLoad();
        els.grid.appendChild(fragment);
    };

    let loadedRepos = null;

    const renderRepos = async (repos) => {
        loadedRepos = repos;
        const fragment = document.createDocumentFragment();

        const sorted = (await Promise.all(
            repos.map(async repo => {
                const category = getCategory(repo.name);
                const completed = category === 'ebooks-projects' && await checkFileExists(
                    `${RAW_BASE}/${USER}/${repo.name}/${repo.default_branch}/res/check`
                );
                return { repo, category, completed };
            })
        )).sort((a, b) => {
            if (a.category === 'project' && b.category === 'ebooks-projects') return -1;
            if (a.category === 'ebooks-projects' && b.category === 'project') return 1;
            return 0;
        });

        sorted.forEach(({ repo, category, completed }) => {
            const imgSrc = category === 'ebooks-projects' ? getEbookCover(repo) : getOGImage(repo);
            const preview = document.createElement('div');
            preview.className = 'github-preview';
            preview.dataset.category = category;
            preview.dataset.link = repo.html_url;

            let footer = '';
            if (category === 'ebooks-projects') {
                const badge = completed
                    ? `<span class="badge badge-success">${i18n[currentLang].badgeCompleted}</span>`
                    : `<span class="badge badge-development">${i18n[currentLang].badgeDev}</span>`;
                footer = `<div class="preview-footer"><span class="preview-title">${repo.name}</span>${badge}</div>`;
            }

            preview.innerHTML = `
                <img class="preview-image" src="${imgSrc}" alt="${repo.name}" loading="lazy" onerror="this.onerror=null;this.src='${getOGImage(repo)}'">
                <svg class="github-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21.87 2.33.66 2.87 1.34-.16 2.65-.76 3.38-1.74.11-.18.55-.42.48-.97-.05-.48-.39-.46-.66-.43 0 0-2.11.21-4.93-.94 0 0-.75-.32-1.59.35-.19.18-.56.26-.93.26-.37 0-.76-.08-.93-.26-.84-.67-1.59-.35-1.59-.35-2.82 1.15-4.93.94-4.93.94-.27.03-.61.05-.66.43-.07.55.37.79.48.97.73.98 2.04 1.58 3.38 1.74-.27.24-.39.6-.39 1.08 0 .79.01 1.65.01 1.87 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                ${footer}
            `;
            fragment.appendChild(preview);
        });

        els.grid.appendChild(fragment);
    };

    const init = async () => {
        try {
            const repos = await fetchJSON(API_REPOS);
            await renderRepos(repos);
            await loadCertifications();
            applyFilter(document.querySelector('.filter-btn.active')?.dataset.filter || 'project');
            updateCounts();
        } catch (error) {
            console.error(error);
            els.grid.innerHTML = `<p style="text-align:center;color:#64748b;grid-column:1/-1;">${i18n[currentLang].errorLoad}</p>`;
        }
    };

    // Event Listeners
    els.grid.addEventListener('click', (e) => {
        const card = e.target.closest('.github-preview, .cert-preview');
        if (card?.dataset.link) window.open(card.dataset.link, "_blank", "noopener");
    });

    els.filters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        els.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
    });

    window.addEventListener('scroll', () => {
        els.backToTop?.classList.toggle('visible', window.scrollY > 400);
    });

    els.backToTop?.addEventListener('click', () => window.scrollTo({ top: 0 }));

    els.langBtns.forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    const savedLang = localStorage.getItem('lang');
    if (savedLang && i18n[savedLang]) setLanguage(savedLang);
    else setLanguage('pt');

    init();
});
