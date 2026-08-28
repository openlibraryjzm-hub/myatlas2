/**
 * Reddit Exporter - DOM Parser for old.reddit.com
 */

window.RedditParser = {
    /**
     * Parses all post elements on the current old.reddit.com page
     * @returns {Array<Object>} Array of extracted post objects
     */
    extractPostsFromDOM: function() {
        let postElements = document.querySelectorAll('.thing[data-fullname^="t3_"], #siteTable .thing, .sitetable .thing, .thing.link');
        
        if (!postElements || postElements.length === 0) {
            postElements = document.querySelectorAll('[data-fullname^="t3_"]');
        }

        console.log(`[Reddit Exporter Parser] Found ${postElements.length} candidate post elements on page.`);

        const posts = [];

        postElements.forEach(element => {
            try {
                // Skip promoted / ad posts
                if (element.classList.contains('promoted') || element.getAttribute('data-promoted') === 'true') {
                    return;
                }

                // Ensure it's a post (t3_) not a comment (t1_)
                const fullname = element.getAttribute('data-fullname') || element.id || '';
                if (fullname && !fullname.startsWith('t3_')) {
                    return;
                }

                const post = this.parseSinglePost(element);
                if (post && post.id && post.title) {
                    posts.push(post);
                }
            } catch (err) {
                console.warn('[Reddit Exporter] Error parsing single post element:', err, element);
            }
        });

        console.log(`[Reddit Exporter Parser] Successfully extracted ${posts.length} valid posts.`);
        return posts;
    },

    /**
     * Strict check to identify genuine video posts without false positives on image posts
     */
    isVideoPost: function(url, domain) {
        const lowerUrl = (url || '').toLowerCase();
        const lowerDomain = (domain || '').toLowerCase();

        // Image hosts are NEVER video posts
        if (lowerDomain.includes('i.redd.it') || lowerDomain.includes('i.imgur.com') || lowerDomain.includes('preview.redd.it')) {
            return false;
        }

        // Direct image extensions are NEVER video posts
        if (/\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i.test(lowerUrl)) {
            return false;
        }

        // Confirmed video domains
        const videoDomains = [
            'v.redd.it', 'youtube.com', 'youtu.be', 'gfycat.com', 'redgifs.com',
            'vimeo.com', 'tiktok.com', 'twitch.tv', 'streamable.com', 'clippituser.tv'
        ];
        if (videoDomains.some(d => lowerDomain.includes(d) || lowerUrl.includes(d))) {
            return true;
        }

        // Confirmed video file extensions
        const videoExtensions = ['.mp4', '.webm', '.m3u8', '.mov', '.avi'];
        if (videoExtensions.some(ext => lowerUrl.split('?')[0].endsWith(ext))) {
            return true;
        }

        return false;
    },

    /**
     * Extracts best available image thumbnail for a post
     */
    extractBestThumbnail: function(el) {
        if (!el) return '';

        // Check for preview img in expando or media container
        const previewImg = el.querySelector('.media-preview img, .expando img, [data-preview-url]');
        if (previewImg) {
            let src = previewImg.getAttribute('src') || previewImg.getAttribute('data-preview-url') || '';
            if (src.startsWith('//')) src = 'https:' + src;
            if (src.startsWith('http') && !this.isPlaceholderThumbnail(src)) {
                return src;
            }
        }

        // Check standard thumbnail anchor
        const thumbImg = el.querySelector('a.thumbnail img');
        if (thumbImg) {
            let src = thumbImg.getAttribute('src') || thumbImg.getAttribute('data-src') || '';
            if (src.startsWith('//')) src = 'https:' + src;
            if (src.startsWith('http') && !this.isPlaceholderThumbnail(src)) {
                return src;
            }
        }

        return '';
    },

    /**
     * Checks if thumbnail URL is a default reddit icon placeholder
     */
    isPlaceholderThumbnail: function(url) {
        if (!url) return true;
        const lower = url.toLowerCase();
        return (
            lower.includes('/static/') ||
            lower.includes('default') ||
            lower.includes('self') ||
            lower.includes('nsfw') ||
            lower.includes('spoiler') ||
            lower.includes('redditstatic')
        );
    },

    /**
     * Parses a single div.thing element
     * @param {HTMLElement} el 
     * @returns {Object} Extracted post metadata
     */
    parseSinglePost: function(el) {
        const fullname = el.getAttribute('data-fullname') || el.id || '';
        const id = fullname.replace(/^t3_/, '');

        // Title Anchor
        const titleAnchor = el.querySelector('p.title a.title, .entry p.title a, a.title');
        
        let title = '';
        if (titleAnchor) {
            title = titleAnchor.textContent.trim();
        }
        
        // Fallback title parsing if titleAnchor text was empty
        if (!title) {
            const pTitle = el.querySelector('p.title, .entry p.title');
            if (pTitle) {
                const clone = pTitle.cloneNode(true);
                const domainSpan = clone.querySelector('.domain');
                if (domainSpan) domainSpan.remove();
                title = clone.textContent.trim();
            }
        }

        // Direct outbound URL (media link or self-post permalink)
        let directUrl = titleAnchor ? titleAnchor.getAttribute('href') || '' : '';
        if (directUrl.startsWith('/')) {
            directUrl = 'https://old.reddit.com' + directUrl;
        }

        // Exact Reddit Thread Permalink
        let permalink = '';
        const commentsEl = el.querySelector('a.comments, a.bounceme, .flat-list a.comments, ul.flat-list li.first a');
        if (commentsEl) {
            const relLink = commentsEl.getAttribute('href');
            if (relLink) {
                permalink = relLink.startsWith('http') ? relLink : 'https://old.reddit.com' + relLink;
            }
        }
        if (!permalink && el.getAttribute('data-permalink')) {
            permalink = 'https://old.reddit.com' + el.getAttribute('data-permalink');
        }
        if (!permalink && directUrl.includes('/comments/')) {
            permalink = directUrl;
        }

        // Subreddit
        let subreddit = el.getAttribute('data-subreddit') || '';
        if (!subreddit) {
            const subEl = el.querySelector('a.subreddit, .entry a.subreddit');
            if (subEl) subreddit = subEl.textContent.replace(/^r\//, '').trim();
        }

        // Author
        let author = el.getAttribute('data-author') || '';
        if (!author) {
            const authorEl = el.querySelector('a.author, .entry a.author');
            if (authorEl) author = authorEl.textContent.trim();
        }

        // Score / Upvotes
        let score = parseInt(el.getAttribute('data-score'), 10);
        if (isNaN(score)) {
            const scoreEl = el.querySelector('.score.unvoted, .score.likes, .score.dislikes, div.score');
            if (scoreEl) {
                const scoreText = scoreEl.getAttribute('title') || scoreEl.textContent;
                score = parseInt(scoreText, 10);
            }
        }
        if (isNaN(score)) score = 0;

        // Comments Count
        let commentsCount = parseInt(el.getAttribute('data-comments-count'), 10);
        if (isNaN(commentsCount) && commentsEl) {
            const match = commentsEl.textContent.match(/(\d+)/);
            if (match) commentsCount = parseInt(match[1], 10);
        }
        if (isNaN(commentsCount)) commentsCount = 0;

        // Timestamp
        let timestamp = '';
        let createdUtc = null;
        const timeEl = el.querySelector('time.live-timestamp, time');
        if (timeEl) {
            timestamp = timeEl.getAttribute('datetime') || timeEl.getAttribute('title') || '';
            if (timestamp) {
                const parsedDate = new Date(timestamp);
                if (!isNaN(parsedDate.getTime())) {
                    createdUtc = Math.floor(parsedDate.getTime() / 1000);
                }
            }
        }
        if (!createdUtc) {
            const dataTs = el.getAttribute('data-timestamp');
            if (dataTs) {
                const tsNum = parseInt(dataTs, 10);
                if (!isNaN(tsNum)) {
                    createdUtc = tsNum > 1e11 ? Math.floor(tsNum / 1000) : tsNum;
                    timestamp = new Date(createdUtc * 1000).toISOString();
                }
            }
        }

        // Domain
        const domain = el.getAttribute('data-domain') || (el.querySelector('.domain a') ? el.querySelector('.domain a').textContent.trim() : '');

        // Post Flair
        const flairEl = el.querySelector('.linkflairlabel');
        const flair = flairEl ? flairEl.textContent.trim() : '';

        // Extract Thumbnail & Video status
        const thumbnail = this.extractBestThumbnail(el);
        let isVideo = this.isVideoPost(directUrl, domain);

        let finalMediaUrl = directUrl;
        let originalVideoUrl = null;
        let finalThumbnail = thumbnail;

        // Check for Redgifs video to extract animated and static previews
        const redgifsMatch = directUrl.match(/redgifs\.com\/watch\/([a-zA-Z0-9\-]+)/i);
        if (redgifsMatch) {
            const id = redgifsMatch[1];
            // Set URL to the animated GIF preview (small version for grid speed)
            finalMediaUrl = `https://thumbs2.redgifs.com/${id}-small.gif`;
            originalVideoUrl = directUrl;
            // Set thumbnail to static poster preview
            finalThumbnail = `https://thumbs2.redgifs.com/${id}-static.jpg`;
            // Re-classify as not a raw video, but a GIF preview so our player handles it
            isVideo = false;
        } else if (isVideo) {
            originalVideoUrl = directUrl;
            // For video posts, substitute video link with thumbnail image if available
            if (thumbnail && !this.isPlaceholderThumbnail(thumbnail)) {
                finalMediaUrl = thumbnail;
            }
        }

        // Self Post Text Preview (if available)
        let selftext = '';
        const usertextEl = el.querySelector('.expando .usertext-body');
        if (usertextEl) {
            selftext = usertextEl.textContent.trim();
        }

        // Flags
        const isSelf = el.classList.contains('self') || (domain && domain.startsWith('self.'));
        const isNsfw = el.classList.contains('over18');
        const isSpoiler = el.classList.contains('spoiler');

        // ==========================================
        // NEWLY ADDED EXTRACTION FIELDS (Maximalist)
        // ==========================================

        // 1. Original Content (OC) tag
        const isOc = !!el.querySelector('.oc-tag') || el.classList.contains('oc') || title.toLowerCase().includes('[oc]') || title.toLowerCase().includes('(oc)');

        // 2. Author User Flair text
        const authorFlairEl = el.querySelector('.tagline .flair');
        const authorFlair = authorFlairEl ? authorFlairEl.textContent.trim() : '';

        // 3. Subreddit subscriber count (Global to page layout context)
        let subredditSubscribers = null;
        const subCountEl = document.querySelector('.subscribers, .side .number, .titlebox .subscribers');
        if (subCountEl) {
            const cleanText = subCountEl.textContent || '';
            const match = cleanText.replace(/[^\d,]/g, '').match(/([\d,]+)/);
            if (match) {
                const parsedNum = parseInt(match[1].replace(/,/g, ''), 10);
                if (!isNaN(parsedNum)) {
                    subredditSubscribers = parsedNum;
                }
            }
        }

        // 4. Image Dimensions (From expando layout or fallback to title brackets regex)
        let width = null;
        let height = null;
        const expandoBtn = el.querySelector('.expando-button, [data-width], [data-height]');
        if (expandoBtn) {
            const w = parseInt(expandoBtn.getAttribute('data-width') || expandoBtn.getAttribute('width'), 10);
            const h = parseInt(expandoBtn.getAttribute('data-height') || expandoBtn.getAttribute('height'), 10);
            if (!isNaN(w) && w > 0 && !isNaN(h) && h > 0) {
                width = w;
                height = h;
            }
        }

        // Fallback to title regex parsing for wallpapers if layout doesn't specify size
        if ((!width || !height) && title) {
            const resRegex = /\[\s*(\d+)\s*[x×*]\s*(\d+)\s*\]/i;
            const match = title.match(resRegex);
            if (match) {
                width = parseInt(match[1], 10);
                height = parseInt(match[2], 10);
            }
        }

        // 5. Upvote Ratio (Only available if current scraper is in detail/comments view)
        let upvoteRatio = null;
        const ratioEl = document.querySelector('.sidebar .linkinfo');
        if (ratioEl) {
            const text = ratioEl.textContent;
            const match = text.match(/(\d+)%\s+upvoted/i);
            if (match) {
                upvoteRatio = parseFloat(match[1]) / 100;
            }
        }

        // 6. Gilded count / Awards
        let awardsCount = 0;
        const gildedBadge = el.querySelector('.gilded-icon, .gilded-badge');
        if (gildedBadge) {
            const titleText = gildedBadge.getAttribute('title') || '';
            const countMatch = titleText.match(/gilded\s+(\d+)\s+times/i) || titleText.match(/(\d+)x/i);
            if (countMatch) {
                awardsCount = parseInt(countMatch[1], 10);
            } else if (titleText.includes('gilded')) {
                awardsCount = 1;
            }
        }

        // 7. Gallery status & gallery media urls
        const isGallery = directUrl.includes('reddit.com/gallery/') || (domain === 'reddit.com' && directUrl.includes('/gallery/'));
        const galleryMedia = [];
        if (isGallery) {
            const slideImages = el.querySelectorAll('.expando img, .gallery-preview img, .gallery img');
            slideImages.forEach(img => {
                const src = img.getAttribute('src') || img.getAttribute('data-src');
                if (src && !this.isPlaceholderThumbnail(src)) {
                    let fullUrl = src;
                    if (src.includes('preview.redd.it') && src.includes('?')) {
                        fullUrl = src.replace('preview.redd.it', 'i.redd.it').split('?')[0];
                    }
                    if (!galleryMedia.includes(fullUrl)) {
                        galleryMedia.push(fullUrl);
                    }
                }
            });
        }

        return {
            id: fullname || (id ? 't3_' + id : 'post_' + Math.random().toString(36).substr(2, 9)),
            reddit_id: id,
            title: title,
            permalink: permalink,
            url: finalMediaUrl,
            domain: domain,
            subreddit: subreddit,
            author: author,
            score: score,
            comments_count: commentsCount,
            created_utc: createdUtc,
            created_iso: timestamp,
            flair: flair,
            thumbnail: finalThumbnail,
            selftext: selftext,
            is_self: isSelf,
            is_video: isVideo,
            original_video_url: originalVideoUrl,
            is_nsfw: isNsfw,
            is_spoiler: isSpoiler,
            extracted_at: new Date().toISOString(),
            is_oc: isOc,
            author_flair: authorFlair,
            subreddit_subscribers: subredditSubscribers,
            width: width,
            height: height,
            upvote_ratio: upvoteRatio,
            awards_count: awardsCount,
            is_gallery: isGallery,
            gallery_media: galleryMedia
        };
    },

    /**
     * Gets the URL of the next page from old.reddit.com DOM
     * @returns {string|null} Full URL for next page or null if not found
     */
    getNextPageUrl: function() {
        const nextButton = document.querySelector('.next-button a, a[rel~="next"]');
        if (nextButton) {
            const href = nextButton.getAttribute('href');
            if (href) {
                return href.startsWith('http') ? href : 'https://old.reddit.com' + href;
            }
        }
        return null;
    }
};
