/* ─────────────────────────────────────────────────────────────
   CampusConnect — Full Frontend JS
   Connects to Express backend at http://localhost:3000
   ───────────────────────────────────────────────────────────── */

const API = "/api";

document.addEventListener('DOMContentLoaded', async () => {
    // ── Check Login State ────────────────────────────────────────
    const userJson = localStorage.getItem('user');
    const navActions = document.querySelector('.nav-actions');
    if (userJson && navActions) {
        const user = JSON.parse(userJson);
        navActions.innerHTML = `
            <span style="color:var(--text-secondary);font-size:0.9rem;margin-right:0.5rem;">Hi, ${user.email.split('@')[0]}</span>
            <button id="logout-btn" class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.875rem;">Logout</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload();
        });
    }



    // ── Navbar scroll effect ─────────────────────────────────────
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.7)';
            navbar.style.backgroundColor = 'rgba(11, 17, 32, 0.97)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.backgroundColor = 'rgba(11, 17, 32, 0.8)';
        }
    });

    // ── Scroll-reveal (Intersection Observer) ────────────────────
    function observeReveal() {
        const els = document.querySelectorAll('.reveal:not(.active)');
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px' });
        els.forEach(el => observer.observe(el));
    }
    observeReveal();

    // ── Toast notification ───────────────────────────────────────
    function showToast(icon, message, duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 600);
        }, duration);
    }

    // ── Counter animation for stats ──────────────────────────────
    function animateCounter(el, target, suffix = '') {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { start = target; clearInterval(timer); }
            el.textContent = (target >= 1000 ? Math.floor(start / 1000) + 'k' : Math.floor(start)) + suffix;
        }, 20);
    }

    // ── Fetch Stats ──────────────────────────────────────────────
    async function loadStats() {
        try {
            const res = await fetch(`${API}/stats`);
            const data = await res.json();
            const statEls = document.querySelectorAll('.stat-item');
            if (statEls[0]) animateCounter(statEls[0].querySelector('h3'), data.companies, '+');
            if (statEls[1]) animateCounter(statEls[1].querySelector('h3'), data.studentsPlaced, '+');
            if (statEls[2]) animateCounter(statEls[2].querySelector('h3'), data.successRate, '%');
        } catch (e) {
            console.warn('Stats API unavailable, showing defaults.');
        }
    }

    let currentSector = 'all';

    // ── Sector Tabs ──
    document.querySelectorAll('.sector-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sector-tab').forEach(t => {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.color = 'var(--text-secondary)';
                t.style.border = '2px solid var(--border-light)';
            });
            tab.classList.add('active');
            tab.style.background = 'var(--gradient-btn)';
            tab.style.color = '#fff';
            tab.style.border = 'none';
            currentSector = tab.dataset.sector;
            filterJobsBySector();
        });
    });

    function filterJobsBySector() {
        const privateSection = document.getElementById('private-jobs-section');
        const govtSection = document.getElementById('government-jobs-section');
        
        if (currentSector === 'all') {
            privateSection.style.display = 'block';
            govtSection.style.display = 'block';
        } else if (currentSector === 'private') {
            privateSection.style.display = 'block';
            govtSection.style.display = 'none';
        } else if (currentSector === 'government') {
            privateSection.style.display = 'none';
            govtSection.style.display = 'block';
        }
    }

    let allJobs = [];
    let filteredJobs = [];

    // ── Fetch & Render Jobs ──────────────────────────────────────
    async function loadJobs() {
        const container = document.getElementById('jobs-container');
        if (!container) return;
        
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;">Loading jobs…</p>';
        
        try {
            const res = await fetch(`${API}/jobs`);
            allJobs = await res.json();
            filteredJobs = [...allJobs];
            
            renderJobs();
            loadBookmarks();
        } catch (e) {
            container.innerHTML = '<p style="color:#ef4444;text-align:center;">⚠️ Could not load jobs.</p>';
        }
    }

    function renderJobs() {
        const container = document.getElementById('jobs-container');
        if (!container) return;
        
        container.innerHTML = '';
        if (filteredJobs.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No jobs match your search.</p>';
            return;
        }
        
        filteredJobs.forEach((job, i) => {
            const card = document.createElement('div');
            card.className = 'feature-card reveal';
            card.style.transitionDelay = `${i * 80}ms`;
            card.innerHTML = renderJobCard(job, i);
            container.appendChild(card);
        });
        
        observeReveal();
        
        // Apply buttons
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = `apply.html?id=${btn.dataset.id}`;
            });
        });
        
        // Bookmark buttons
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', toggleBookmark);
        });
    }

    function renderJobCard(job, i) {
        const isBookmarked = isJobBookmarked(job._id);
        return `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">
                <h3 style="font-size:1.1rem;">${job.title}</h3>
                <button class="bookmark-btn" data-id="${job._id}" style="background:none;border:none;color:${isBookmarked ? '#8b5cf6' : 'var(--text-secondary)'};cursor:pointer;font-size:1.2rem;">${isBookmarked ? '⭐' : '☆'}</button>
            </div>
            <p style="color:var(--${job.colorClass === 'accent' ? 'accent' : 'primary'});font-weight:600;margin-bottom:0.5rem;">${job.company}</p>
            <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:0.35rem;">💰 ${job.details}</p>
            <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.25rem;">📍 ${job.location}</p>
            <div style="display:flex;gap:0.5rem;">
                <button class="btn btn-outline apply-btn" style="flex:1;" data-id="${job._id}" data-title="${job.title}" data-company="${job.company}">Apply Now</button>
                <span style="font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:999px;
                    background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);
                    color:#8b5cf6;white-space:nowrap;">${job.type}</span>
            </div>`;
    }

    // ── Search & Filter ──────────────────────────────────────────
    function searchJobs() {
        const query = document.getElementById('job-search')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('job-type-filter')?.value || '';
        
        filteredJobs = allJobs.filter(job => {
            const matchesQuery = !query || 
                job.title.toLowerCase().includes(query) || 
                job.company.toLowerCase().includes(query) || 
                job.location.toLowerCase().includes(query);
            const matchesType = !typeFilter || job.type === typeFilter;
            return matchesQuery && matchesType;
        });
        
        renderJobs();
    }

    // ── Bookmarks ─────────────────────────────────────────────────
    let userBookmarks = [];

    async function loadBookmarks() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        
        try {
            const res = await fetch(`${API}/bookmarks`, {
                headers: { 'user-email': user.email }
            });
            userBookmarks = await res.json();
            renderJobs(); // Re-render to show bookmark states
        } catch (e) {
            console.warn('Could not load bookmarks');
        }
    }

    function isJobBookmarked(jobId) {
        return userBookmarks.some(b => b.jobId === jobId);
    }

    async function toggleBookmark(e) {
        e.stopPropagation();
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            showToast('⚠️', 'Please login to bookmark jobs');
            return;
        }
        
        const jobId = e.target.dataset.id;
        const isBookmarked = isJobBookmarked(jobId);
        
        try {
            if (isBookmarked) {
                await fetch(`${API}/bookmarks/${jobId}`, {
                    method: 'DELETE',
                    headers: { 'user-email': user.email }
                });
                userBookmarks = userBookmarks.filter(b => b.jobId !== jobId);
            } else {
                await fetch(`${API}/bookmarks`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'user-email': user.email 
                    },
                    body: JSON.stringify({ jobId })
                });
                userBookmarks.push({ jobId });
            }
            renderJobs();
            showToast(isBookmarked ? '⭐' : '☆', isBookmarked ? 'Removed from saved jobs' : 'Added to saved jobs');
        } catch (err) {
            showToast('❌', 'Failed to update bookmark');
        }
    }

    function showSavedJobs() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            showToast('⚠️', 'Please login to view saved jobs');
            return;
        }
        
        filteredJobs = allJobs.filter(job => isJobBookmarked(job._id));
        renderJobs();
        document.getElementById('job-search').value = '';
        document.getElementById('job-type-filter').value = '';
    }

    // ── Fetch & Render Application Status ───────────────────────
    async function loadStatus() {
        const container = document.getElementById('status-container');
        if (!container) return;
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            container.innerHTML = `
                <div style="text-align:center; padding:3rem; background:rgba(255,255,255,0.02); border:1px dashed var(--border-light); border-radius:var(--radius-lg);">
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Please sign in to track your applications.</p>
                    <a href="login.html" class="btn btn-gradient">Login Now</a>
                </div>`;
            return;
        }

        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:1rem;">Loading…</p>';
        try {
            const res = await fetch(`${API}/status`);
            const allApps = await res.json();
            const userApps = allApps.filter(a => a.email === user.email);

            container.innerHTML = '';
            if (userApps.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">You haven\'t applied to any jobs yet.</p>';
                return;
            }

            const themeMap = {
                accent: { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', color: 'var(--accent)' },
                neutral: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
            };

            userApps.forEach((app, i) => {
                const t = themeMap[app.theme] || themeMap.neutral;
                const statusLower = (app.status || 'Under Review').toLowerCase();
                let statusClass = 'status-pending';
                let statusColor = '#10b981';
                if (statusLower.includes('accept')) {
                    statusClass = 'status-accepted';
                    statusColor = '#22c55e';
                } else if (statusLower.includes('reject')) {
                    statusClass = 'status-rejected';
                    statusColor = '#ef4444';
                }
                
                const row = document.createElement('div');
                row.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;${i < userApps.length - 1 ? 'border-bottom:1px solid var(--border-light);' : ''}`;
                row.innerHTML = `
                    <div>
                        <h3 style="color:var(--text-primary);margin-bottom:0.4rem;font-size:1.1rem;">${app.jobTitle}</h3>
                        <p style="color:var(--text-secondary);font-size:0.9rem;">${app.company}</p>
                    </div>
                    <div class="status-badge ${statusClass}" style="background:rgba(${statusLower.includes('accept') ? '34,197,94' : statusLower.includes('reject') ? '239,68,68' : '16,185,129'},0.15);color:${statusColor};border:1px solid rgba(${statusLower.includes('accept') ? '34,197,94' : statusLower.includes('reject') ? '239,68,68' : '16,185,129'},0.3);">${app.status || 'Under Review'}</div>`;
                container.appendChild(row);
            });
        } catch (e) {
            container.innerHTML = '<p style="color:#ef4444;text-align:center;">⚠️ Failed to load status.</p>';
        }
    }


    // ── Event Listeners for Search & Saved Jobs ──────────────────
    document.getElementById('search-btn')?.addEventListener('click', searchJobs);
    document.getElementById('job-search')?.addEventListener('input', searchJobs);
    document.getElementById('job-type-filter')?.addEventListener('change', searchJobs);
    document.getElementById('saved-jobs-btn')?.addEventListener('click', showSavedJobs);
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.trim() === 'Explore Jobs') {
            btn.addEventListener('click', () => document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' }));
        }
        if (btn.textContent.trim() === 'Track Applications') {
            btn.addEventListener('click', () => document.getElementById('status').scrollIntoView({ behavior: 'smooth' }));
        }
        if (btn.textContent.trim() === 'View All Jobs') {
            btn.addEventListener('click', () => document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' }));
        }
    });

    // ── Live Toast Notifications (simulated live feed) ───────────
    const liveMessages = [
        { icon: '🏢', text: 'TechCorp Global just posted 3 new roles!' },
        { icon: '🎓', text: 'Priya M. received an offer from InnovateX!' },
        { icon: '📋', text: 'DataSys Inc. is reviewing applications now.' },
        { icon: '🚀', text: 'New company "Nebula Systems" joined CampusConnect!' },
        { icon: '✅', text: 'Rajan K. placed at Creative Solutions!' },
    ];
    let msgIdx = 0;
    setTimeout(() => {
        function nextToast() {
            showToast(liveMessages[msgIdx].icon, liveMessages[msgIdx].text);
            msgIdx = (msgIdx + 1) % liveMessages.length;
            setTimeout(nextToast, 8000);
        }
        nextToast();
    }, 3000);

    // ── Initialise ───────────────────────────────────────────────
    await loadStats();
    await loadJobs();
    await loadStatus();
});
