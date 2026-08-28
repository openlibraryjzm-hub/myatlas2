/**
 * Reddit Exporter - Background Service Worker (Manual Tracking Mode)
 * Accumulates unique posts across user scrolling and manual page navigation.
 */

const DEFAULT_STATE = {
    isExtracting: false,
    maxPosts: 500,
    posts: [],
    uniqueIds: [],
    pagesProcessed: 0,
    status: 'Tracking Disabled',
    error: null
};

// Ensure default state exists on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['redditExporterState'], (result) => {
        if (!result.redditExporterState) {
            chrome.storage.local.set({ redditExporterState: DEFAULT_STATE });
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'GET_STATE':
            chrome.storage.local.get(['redditExporterState'], (res) => {
                sendResponse(res.redditExporterState || DEFAULT_STATE);
            });
            return true;

        case 'TOGGLE_TRACKING':
            handleToggleTracking(message.enable, message.maxPosts, sendResponse);
            return true;

        case 'CLEAR_DATA':
            chrome.storage.local.get(['redditExporterState'], (res) => {
                const current = res.redditExporterState || DEFAULT_STATE;
                const resetState = {
                    ...current,
                    posts: [],
                    uniqueIds: [],
                    pagesProcessed: 0,
                    status: current.isExtracting ? 'Tracking ON (Data cleared)' : 'Tracking OFF (Data cleared)'
                };
                chrome.storage.local.set({ redditExporterState: resetState }, () => {
                    sendResponse({ success: true });
                });
            });
            return true;

        case 'PAGE_POSTS_EXTRACTED':
            handlePagePostsExtracted(message.posts);
            sendResponse({ received: true });
            return true;
    }
});

function handleToggleTracking(enable, maxPosts, sendResponse) {
    chrome.storage.local.get(['redditExporterState'], (res) => {
        const state = res.redditExporterState || DEFAULT_STATE;
        const targetMax = maxPosts || state.maxPosts || 500;
        
        const newState = {
            ...state,
            isExtracting: enable,
            maxPosts: targetMax,
            status: enable ? `Tracking ON — ${state.posts ? state.posts.length : 0} / ${targetMax} posts` : 'Tracking Paused'
        };

        chrome.storage.local.set({ redditExporterState: newState }, () => {
            // Send trigger to all open reddit tabs
            chrome.tabs.query({ url: ['*://old.reddit.com/*', '*://*.reddit.com/*'] }, (tabs) => {
                (tabs || []).forEach(tab => {
                    if (tab.id) {
                        chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_EXTRACT' }, () => {
                            if (chrome.runtime.lastError) {}
                        });
                    }
                });
            });
            sendResponse({ success: true, isExtracting: enable });
        });
    });
}

function handlePagePostsExtracted(newPosts) {
    chrome.storage.local.get(['redditExporterState'], (res) => {
        let state = res.redditExporterState || DEFAULT_STATE;

        if (!state.isExtracting) {
            console.log('[Background] Ignoring extracted posts because tracking is disabled.');
            return;
        }

        const uniqueSet = new Set(Array.isArray(state.uniqueIds) ? state.uniqueIds : []);
        const accumulatedPosts = Array.isArray(state.posts) ? [...state.posts] : [];
        let addedCount = 0;

        (newPosts || []).forEach(post => {
            if (post && post.id && !uniqueSet.has(post.id) && accumulatedPosts.length < state.maxPosts) {
                uniqueSet.add(post.id);
                accumulatedPosts.push(post);
                addedCount++;
            }
        });

        console.log(`[Background] Received ${newPosts ? newPosts.length : 0} posts. Added ${addedCount} new unique posts. Total now: ${accumulatedPosts.length}`);

        if (addedCount > 0) {
            const reachedCap = accumulatedPosts.length >= state.maxPosts;
            const statusMsg = reachedCap
                ? `Cap reached! ${accumulatedPosts.length} / ${state.maxPosts} posts collected.`
                : `Tracking Active: ${accumulatedPosts.length} / ${state.maxPosts} posts collected.`;

            const updatedState = {
                ...state,
                posts: accumulatedPosts,
                uniqueIds: Array.from(uniqueSet),
                status: statusMsg,
                isExtracting: reachedCap ? false : state.isExtracting
            };

            chrome.storage.local.set({ redditExporterState: updatedState });
        }
    });
}
