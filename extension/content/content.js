/**
 * Reddit Exporter - Content Script (Manual Tracking & Auto-Scan Mode)
 * Injected into old.reddit.com pages to track and extract posts as the user browses.
 */

(function() {
    console.log('[Reddit Exporter] Content script initialized on', window.location.href);

    let mutationObserver = null;
    let scrollTimeout = null;

    // Create or update floating overlay indicator on old.reddit page
    function renderOverlayWidget(state) {
        if (!state) return;

        let widget = document.getElementById('reddit-exporter-overlay');
        const isTracking = !!state.isExtracting;
        const count = state.posts ? state.posts.length : 0;

        if (!isTracking && count === 0) {
            if (widget) widget.remove();
            return;
        }

        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'reddit-exporter-overlay';
            widget.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 999999;
                background: rgba(18, 20, 29, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 69, 0, 0.4);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 69, 0, 0.2);
                border-radius: 12px;
                padding: 12px 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #ffffff;
                min-width: 250px;
                max-width: 320px;
                transition: all 0.3s ease;
                user-select: none;
            `;
            document.body.appendChild(widget);
        }

        const max = state.maxPosts || 500;
        const percent = Math.min(100, Math.round((count / max) * 100));

        widget.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: ${isTracking ? '#00e676' : '#ff9100'}; box-shadow: 0 0 8px ${isTracking ? '#00e676' : '#ff9100'};"></div>
                    <span style="font-weight: 700; font-size: 12px; letter-spacing: 0.5px; color: #ff5722;">REDDIT EXPORTER</span>
                </div>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${isTracking ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255,145,0,0.2)'}; color: ${isTracking ? '#00e676' : '#ff9100'};">
                    ${isTracking ? 'TRACKING ON' : 'PAUSED'}
                </span>
            </div>
            <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
                ${count} <span style="font-size: 11px; color: #888; font-weight: 500;">/ ${max} posts tracked</span>
            </div>
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 6px;">
                <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #ff4500, #ff8c00); transition: width 0.3s ease;"></div>
            </div>
            <div style="font-size: 10px; color: #bbb; line-height: 1.2;">
                ${isTracking ? 'Scroll or click pages manually — posts accumulate automatically.' : 'Tracking is paused. Click popup to enable.'}
            </div>
        `;
    }

    function scanAndExtractPosts() {
        chrome.storage.local.get(['redditExporterState'], (res) => {
            const state = res ? res.redditExporterState : null;
            if (!state) {
                console.log('[Reddit Exporter] No state found in storage.');
                return;
            }

            renderOverlayWidget(state);

            if (state.isExtracting) {
                if (!window.RedditParser) {
                    console.error('[Reddit Exporter] RedditParser object not found on window!');
                    return;
                }

                const posts = window.RedditParser.extractPostsFromDOM();
                console.log(`[Reddit Exporter] Scanned DOM. Found ${posts.length} posts. Sending to background...`);

                if (posts.length > 0) {
                    chrome.runtime.sendMessage({
                        type: 'PAGE_POSTS_EXTRACTED',
                        posts: posts
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.warn('[Reddit Exporter] SendMessage error:', chrome.runtime.lastError.message);
                        } else {
                            console.log('[Reddit Exporter] Background acknowledged post receipt.');
                        }
                    });
                }
            }
        });
    }

    function setupEventListeners() {
        // Debounced Scroll listener for RES endless scrolling or long page scrolls
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(scanAndExtractPosts, 400);
        }, { passive: true });

        // DOM Mutation Observer for dynamically injected posts
        if (!mutationObserver) {
            const container = document.querySelector('#siteTable, .sitetable') || document.body;
            mutationObserver = new MutationObserver(() => {
                scanAndExtractPosts();
            });

            mutationObserver.observe(container, { childList: true, subtree: true });
        }
    }

    // Listen for direct message triggers
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'TRIGGER_EXTRACT' || message.type === 'STATE_UPDATED') {
            scanAndExtractPosts();
            sendResponse({ status: 'Triggered' });
        }
    });

    // Storage listener
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.redditExporterState) {
            const newState = changes.redditExporterState.newValue;
            renderOverlayWidget(newState);
            if (newState && newState.isExtracting) {
                scanAndExtractPosts();
            }
        }
    });

    // Execute scan immediately
    scanAndExtractPosts();
    setupEventListeners();

    // Additional scan after DOM fully ready
    if (document.readyState !== 'complete') {
        window.addEventListener('load', () => {
            setTimeout(scanAndExtractPosts, 500);
        });
    }
})();
