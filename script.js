document.addEventListener('DOMContentLoaded', () => {
    const USER = 'DaFi-1';
    const API_REPOS = `https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`;
    const OG_BASE = 'https://opengraph.githubassets.com';
    const RAW_BASE = 'https://raw.githubusercontent.com';
    const CERT_BASE = 'certifications/';

    const els = {
        filterBtns: document.querySelectorAll('.filter-btn'),
        grid: document.getElementById('projects-grid'),
        filters: document.querySelector('.filters'),
        backToTop: document.getElementById('backToTop')
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

    const renderRepos = async (repos) => {
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
                    ? '<span class="badge badge-success">✓ Concluído</span>'
                    : '<span class="badge badge-development">Em desenvolvimento</span>';
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
            els.grid.innerHTML = '<p style="text-align:center;color:#64748b;grid-column:1/-1;">Erro ao carregar projetos.</p>';
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

    // Init
    init();
});
