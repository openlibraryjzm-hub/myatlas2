/**
 * Reddit Exporter - Popup Controller Script (Manual Tracking Mode)
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const maxPostsInput = document.getElementById('maxPostsInput');
    const btnToggleTracking = document.getElementById('btnToggleTracking');
    const btnClear = document.getElementById('btnClear');
    
    const postCountEl = document.getElementById('postCount');
    const postCapDisplayEl = document.getElementById('postCapDisplay');
    const progressBarEl = document.getElementById('progressBar');
    const statusMessageEl = document.getElementById('statusMessage');
    const statusBadgeEl = document.getElementById('statusBadge');
    
    const btnExportJson = document.getElementById('btnExportJson');
    const btnExportCsv = document.getElementById('btnExportCsv');
    const btnCopyJson = document.getElementById('btnCopyJson');
    
    const searchInput = document.getElementById('searchInput');
    const previewList = document.getElementById('previewList');

    let currentPosts = [];
    let isTrackingActive = false;

    // Load initial state
    loadState();

    // Listen to chrome storage changes for live UI updates
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.redditExporterState) {
            updateUI(changes.redditExporterState.newValue);
        }
    });

    // Toggle Tracking Handler
    btnToggleTracking.addEventListener('click', () => {
        const nextState = !isTrackingActive;
        const maxPosts = parseInt(maxPostsInput.value, 10) || 500;

        chrome.runtime.sendMessage({
            type: 'TOGGLE_TRACKING',
            enable: nextState,
            maxPosts: maxPosts
        }, () => {
            loadState();
        });
    });

    btnClear.addEventListener('click', () => {
        if (confirm('Clear all extracted posts data?')) {
            chrome.runtime.sendMessage({ type: 'CLEAR_DATA' }, () => {
                loadState();
            });
        }
    });

    // Export Handlers
    btnExportJson.addEventListener('click', () => {
        if (!currentPosts || currentPosts.length === 0) return;
        
        const jsonStr = JSON.stringify(currentPosts, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `reddit_posts_${getSubredditName()}_${timestamp}.json`;

        chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
        });
    });

    btnExportCsv.addEventListener('click', () => {
        if (!currentPosts || currentPosts.length === 0) return;

        const csvStr = convertToCSV(currentPosts);
        const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `reddit_posts_${getSubredditName()}_${timestamp}.csv`;

        chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
        });
    });

    btnCopyJson.addEventListener('click', () => {
        if (!currentPosts || currentPosts.length === 0) return;

        const jsonStr = JSON.stringify(currentPosts, null, 2);
        navigator.clipboard.writeText(jsonStr).then(() => {
            const originalText = btnCopyJson.innerText;
            btnCopyJson.innerText = 'Copied!';
            setTimeout(() => {
                btnCopyJson.innerText = originalText;
            }, 1800);
        });
    });

    // Live search filter
    searchInput.addEventListener('input', () => {
        renderPreviewList(currentPosts, searchInput.value.trim().toLowerCase());
    });

    function loadState() {
        chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
            if (chrome.runtime.lastError) return;
            updateUI(state);
        });
    }

    function updateUI(state) {
        if (!state) return;

        currentPosts = state.posts || [];
        isTrackingActive = !!state.isExtracting;
        const maxPosts = state.maxPosts || 500;
        const count = currentPosts.length;

        maxPostsInput.value = maxPosts;

        // Update Toggle Button
        if (isTrackingActive) {
            btnToggleTracking.className = 'btn btn-danger';
            btnToggleTracking.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
                Disable Tracking
            `;
            statusBadgeEl.className = 'status-badge badge-active';
            statusBadgeEl.textContent = 'Tracking ON';
        } else {
            btnToggleTracking.className = 'btn btn-primary';
            btnToggleTracking.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Enable Tracking
            `;
            statusBadgeEl.className = 'status-badge badge-idle';
            statusBadgeEl.textContent = count > 0 ? 'Paused' : 'Disabled';
        }

        const hasPosts = count > 0;
        btnExportJson.disabled = !hasPosts;
        btnExportCsv.disabled = !hasPosts;
        btnCopyJson.disabled = !hasPosts;

        // Stats
        postCountEl.textContent = count;
        postCapDisplayEl.textContent = maxPosts;

        const percent = Math.min(100, Math.round((count / maxPosts) * 100));
        progressBarEl.style.width = `${percent}%`;

        // Status
        statusMessageEl.textContent = state.status || (isTrackingActive ? 'Tracking active...' : 'Tracking paused.');

        // Preview list
        renderPreviewList(currentPosts, searchInput.value.trim().toLowerCase());
    }

    function renderPreviewList(posts, filterText) {
        if (!posts || posts.length === 0) {
            previewList.innerHTML = '<div class="empty-state">No posts extracted yet. Enable tracking & browse old.reddit!</div>';
            return;
        }

        const filtered = filterText
            ? posts.filter(p => p.title.toLowerCase().includes(filterText) || p.subreddit.toLowerCase().includes(filterText) || p.author.toLowerCase().includes(filterText))
            : posts;

        if (filtered.length === 0) {
            previewList.innerHTML = '<div class="empty-state">No matching posts found.</div>';
            return;
        }

        previewList.innerHTML = filtered.slice(0, 50).map(post => `
            <div class="preview-item">
                <div class="item-top">
                    <a href="${post.permalink || post.url}" target="_blank" class="item-title" title="${escapeHtml(post.title)}">
                        ${escapeHtml(post.title)}
                    </a>
                    <span class="item-score">▲ ${post.score}</span>
                </div>
                <div class="item-links">
                    <span style="color: #aaa;">r/${escapeHtml(post.subreddit)}</span>
                    <span>•</span>
                    ${post.permalink ? `<a href="${post.permalink}" target="_blank" class="link-tag tag-permalink">🔗 Thread Permalink</a>` : ''}
                    ${post.url && post.url !== post.permalink ? `<a href="${post.url}" target="_blank" class="link-tag tag-media">🌐 Media/Target Link</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    function getSubredditName() {
        if (currentPosts.length > 0 && currentPosts[0].subreddit) {
            return currentPosts[0].subreddit;
        }
        return 'all';
    }

    function convertToCSV(items) {
        if (!items || items.length === 0) return '';

        const headers = ['id', 'reddit_id', 'title', 'permalink', 'url', 'domain', 'subreddit', 'author', 'score', 'comments_count', 'created_iso', 'flair', 'is_self', 'is_nsfw'];
        
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const item of items) {
            const values = headers.map(header => {
                let val = item[header];
                if (val === null || val === undefined) val = '';
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
