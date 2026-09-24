// 24 張圖片對應的低飽和度背景色列表
const backgroundColors = [
    "#EFECE6",
    "#E6EBE0",
    "#EDF2F4",
    "#F4EAD4",
    "#F0E6EF",
    "#E2ECE9",
    "#EAE4E9",
    "#FFF1E6",
    "#FDE2E4",
    "#DBE7E4",
    "#E4C1F9",
    "#D6E2E9",
    "#E9ECEF",
    "#F3E9DC",
    "#D8E2DC",
    "#FFE5D9",
    "#ECE4DB",
    "#E0E1DD",
    "#F1FAEE",
    "#E8D8CE",
    "#DFE7FD",
    "#F0F3F4",
    "#EAD7D7",
    "#DCE1E3"
];

const siteMenu = document.getElementById('siteMenu');
const menuToggle = document.getElementById('menuToggle');
let menuCloseTimer;
let isPageSwitching = false;

function openMenu() {
    if (isPageSwitching) return;
    clearTimeout(menuCloseTimer);
    if (!siteMenu.open) siteMenu.showModal();
    document.body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    void siteMenu.offsetWidth;
    siteMenu.classList.add('is-open');
}

function closeMenu() {
    if (!siteMenu.open) return;
    clearTimeout(menuCloseTimer);
    siteMenu.classList.remove('is-open');
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    menuCloseTimer = setTimeout(() => siteMenu.close(), delay);
}

siteMenu.addEventListener('click', (event) => {
    if (event.target === siteMenu) closeMenu();
});
siteMenu.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeMenu();
});
siteMenu.addEventListener('close', () => {
    if (siteMenu.open) return;
    clearTimeout(menuCloseTimer);
    siteMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.focus({ preventScroll: true });
});

function displayPage(pageName, targetPage, targetButton) {
    finishPageTurn();
    document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.classList.remove('active');
        button.removeAttribute('aria-current');
    });
    targetPage.classList.add('active');
    document.body.classList.toggle('text-page-active', pageName === 'text');
    targetButton.classList.add('active');
    targetButton.setAttribute('aria-current', 'page');
    document.getElementById('currentPageLabel').textContent = {
        gallery: '作品展示', text: '繪師資訊', planning: '籌畫細節'
    }[pageName];
    window.scrollTo({ top: 0, behavior: 'instant' });
    clearTimeout(menuCloseTimer);
    if (siteMenu.open) siteMenu.close();
    siteMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
}

async function switchPage(pageName) {
    const targetPage = document.getElementById(`${pageName}-page`);

    const targetButton = Array.from(
        document.querySelectorAll('.nav-btn')
    ).find(button => button.dataset.page === pageName);

    const currentPage =
        document.querySelector('.page-content.active');

    if (
        !targetPage ||
        !targetButton ||
        isPageSwitching ||
        currentPage === targetPage
    ) {
        return;
    }

    // 使用者有開啟「減少動畫」時直接切換
    if (
        reducedMotion.matches ||
        typeof currentPage.animate !== 'function'
    ) {
        displayPage(pageName, targetPage, targetButton);
        return;
    }

    isPageSwitching = true;

    try {
        // 舊頁：快速淡出 + 微微往上
        const leaveAnimation = currentPage.animate(
            [
                {
                    opacity: 1,
                    transform: 'translateY(0px) scale(1)'
                },
                {
                    opacity: 0,
                    transform: 'translateY(-8px) scale(0.995)'
                }
            ],
            {
                duration: 200,
                easing: 'ease-in',
                fill: 'forwards'
            }
        );

        await leaveAnimation.finished;

        // 真正切換頁面
        displayPage(pageName, targetPage, targetButton);

        leaveAnimation.cancel();

        // 新頁：淡入 + 微微從下方浮上來
        const enterAnimation = targetPage.animate(
            [
                {
                    opacity: 0,
                    transform: 'translateY(10px) scale(0.995)'
                },
                {
                    opacity: 1,
                    transform: 'translateY(0px) scale(1)'
                }
            ],
            {
                duration: 350,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'both'
            }
        );

        await enterAnimation.finished;

        enterAnimation.cancel();

    } catch {
        displayPage(pageName, targetPage, targetButton);
    } finally {
        isPageSwitching = false;

        menuToggle.focus({
            preventScroll: true
        });
    }
}

/* =========================
   輪播初始化
========================= */

const originalSlides = Array.from(document.querySelectorAll('.slide-item'));
const totalSlides = originalSlides.length;

let currentIndex = 0;
let isAnimating = false;
let turnAnimations = [];
let turnVersion = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateBackgroundColor() {
    document.body.style.backgroundColor = backgroundColors[currentIndex];
}

function finishPageTurn() {
    turnVersion += 1;
    turnAnimations.forEach(animation => animation.cancel());
    turnAnimations = [];
    originalSlides.forEach((slide, index) => {
        const active = index === currentIndex;
        slide.classList.toggle('is-current', active);
        slide.classList.remove('is-turning');
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
        slide.style.removeProperty('z-index');
    });
    isAnimating = false;
}

async function moveSlide(direction) {
    if (isAnimating || !document.getElementById('gallery-page').classList.contains('active')) return;
    if (direction !== 1 && direction !== -1) return;

    const outgoing = originalSlides[currentIndex];
    currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
    const incoming = originalSlides[currentIndex];
    updateBackgroundColor();

    if (reducedMotion.matches || typeof outgoing.animate !== 'function') {
        finishPageTurn();
        return;
    }

    isAnimating = true;
    const version = ++turnVersion;
    outgoing.classList.add('is-turning');
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.inert = true;
    incoming.classList.add('is-current');
    incoming.setAttribute('aria-hidden', 'false');
    incoming.inert = false;
    const outgoingImage = outgoing.querySelector('.slide-image');
    outgoing.style.zIndex = '2';
    incoming.style.zIndex = '1';

    // 新圖完整墊在下方，舊圖逐漸透明，避免兩張同時變透明造成閃白。
    // 文字維持原位，先淡出再淡入。
    turnAnimations = [
        outgoingImage.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: 950, easing: 'ease-in-out', fill: 'forwards' }),
        outgoing.querySelector('.slide-caption').animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: 180, easing: 'ease-out', fill: 'forwards' }),
        incoming.querySelector('.slide-caption').animate([
            { opacity: 0 },
            { opacity: 1 }
        ], { duration: 750, delay: 200, easing: 'ease-in-out', fill: 'both' })
    ];
    try {
        await Promise.all(turnAnimations.map(animation => animation.finished));
    } catch {
        // 換到其他分頁時取消動畫，由 finishPageTurn 完成定位。
    } finally {
        if (version === turnVersion) finishPageTurn();
    }
}

reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) finishPageTurn();
});
finishPageTurn();

// 使用獨立的 scale 動畫，避免覆蓋箭頭本身的垂直定位。
const buttonAnimations = new WeakMap();
document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.id === 'enterExhibition' || button.disabled || reducedMotion.matches || typeof button.animate !== 'function') return;
    buttonAnimations.get(button)?.cancel();
    buttonAnimations.set(button, button.animate([
        { scale: '0.97' },
        { scale: '1' }
    ], { duration: 220, easing: 'ease-out' }));
}, true);

/* 手機左右滑動 */
const carouselViewport = document.querySelector('.carousel-viewport');

let touchStartX = 0;
let touchStartY = 0;

carouselViewport.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

carouselViewport.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    /* 至少滑動 50px 才判定為有效手勢 */
    const swipeThreshold = 50;

    /* 水平距離必須大於 50px 且大於垂直距離，避免上下滑頁面時誤切圖片 */
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        /* 往左滑 → 下一張 */
        if (deltaX < 0) {
            moveSlide(1);
        }
        /* 往右滑 → 上一張 */
        else {
            moveSlide(-1);
        }
    }
}, { passive: true });

/* 初始化背景色 */
updateBackgroundColor();

/* 開場與背景音樂：play 必須在點擊事件內立即呼叫，不等待淡出結束。 */
const entrance = document.getElementById('entrance');
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const musicStatus = document.getElementById('musicStatus');
const hasBackgroundMusic = Boolean(backgroundMusic.getAttribute('src')?.trim());
let enteringExhibition = false;
let musicFadeFrame;
let musicRequest = 0;
let wantsMusic = false;

musicToggle.hidden = !hasBackgroundMusic;
document.getElementById('enterQuietly').hidden = !hasBackgroundMusic;
document.getElementById('entranceMusicHint').hidden = !hasBackgroundMusic;

function updateMusicControl() {
    const playing = !backgroundMusic.paused;
    musicToggle.textContent = playing ? '音樂 / 暫停' : '音樂 / 播放';
    musicToggle.setAttribute('aria-label', playing ? '暫停背景音樂' : '播放背景音樂');
}

function startMusic() {
    if (!hasBackgroundMusic) return;
    wantsMusic = true;
    const request = ++musicRequest;
    cancelAnimationFrame(musicFadeFrame);
    musicStatus.textContent = '';
    backgroundMusic.volume = 0;
    // 直接在使用者點擊時開始播放，保留瀏覽器的互動授權。
    backgroundMusic.play().then(() => {
        if (request !== musicRequest) return;
        updateMusicControl();
        const start = performance.now();
        const fadeIn = now => {
            const progress = Math.min((now - start) / 1800, 1);
            backgroundMusic.volume = 0.22 * progress;
            if (progress < 1) musicFadeFrame = requestAnimationFrame(fadeIn);
        };
        musicFadeFrame = requestAnimationFrame(fadeIn);
    }).catch(() => {
        if (request !== musicRequest) return;
        wantsMusic = false;
        updateMusicControl();
        musicStatus.textContent = '音樂暫時無法播放，仍可繼續欣賞作品。';
    });
}

function pauseMusic() {
    wantsMusic = false;
    musicRequest += 1;
    cancelAnimationFrame(musicFadeFrame);
    backgroundMusic.pause();
    musicStatus.textContent = '';
    updateMusicControl();
}

musicToggle.addEventListener('click', () => {
    if (wantsMusic) pauseMusic();
    else startMusic();
});
backgroundMusic.addEventListener('play', updateMusicControl);
backgroundMusic.addEventListener('pause', updateMusicControl);
backgroundMusic.addEventListener('error', () => {
    if (!hasBackgroundMusic) return;
    pauseMusic();
    musicStatus.textContent = '音樂暫時無法播放，仍可繼續欣賞作品。';
});

async function enterExhibition(withMusic = true) {
    if (enteringExhibition) return;
    enteringExhibition = true;
    if (withMusic) startMusic();
    try {
        if (!reducedMotion.matches && typeof entrance.animate === 'function') {
            await entrance.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 1100, easing: 'ease-in-out', fill: 'forwards'
            }).finished;
        }
    } finally {
        entrance.close();
        document.body.classList.remove('entrance-open');
        menuToggle.focus({ preventScroll: true });
    }
}

document.getElementById('enterExhibition').addEventListener('click', () => enterExhibition());
document.getElementById('enterQuietly').addEventListener('click', () => enterExhibition(false));
// 依滑鼠與實際可點擊區域的距離，逐漸增強提示；不移動點擊區域。
const entranceTrigger = document.getElementById('enterExhibition');
let lastEntrancePointer = null;
let entranceKeyboardMode = false;
let entranceStrength = 0;

function setEntranceProximity(strength) {
    // 縮回比放大慢；只改文字，不改實際感應區域的尺寸。
    entranceTrigger.style.setProperty('--response-duration', strength < entranceStrength ? '850ms' : '450ms');
    entranceTrigger.style.setProperty('--proximity', strength.toFixed(4));
    entranceStrength = strength;
}

function refreshEntranceProximity() {
    if (!entrance.open || enteringExhibition) return;
    if (entranceKeyboardMode && entranceTrigger === document.activeElement) {
        setEntranceProximity(1);
        return;
    }
    if (!lastEntrancePointer) {
        // 重新整理時滑鼠可能已停在入口上，不必先點擊才能啟用。
        setEntranceProximity(entranceTrigger.matches(':hover') ? 1 : 0);
        return;
    }
    const rect = entranceTrigger.getBoundingClientRect();
    const dx = Math.max(rect.left - lastEntrancePointer.x, 0, lastEntrancePointer.x - rect.right);
    const dy = Math.max(rect.top - lastEntrancePointer.y, 0, lastEntrancePointer.y - rect.bottom);
    const progress = Math.max(0, 1 - Math.hypot(dx, dy) / 320);
    // 平滑曲線的兩端斜率為零，避免進出感應邊界時突然改變。
    setEntranceProximity(progress * progress * (3 - 2 * progress));
}

function trackEntrancePointer(event) {
    if (!entrance.open || enteringExhibition || event.pointerType === 'touch') return;
    entranceKeyboardMode = false;
    lastEntrancePointer = { x: event.clientX, y: event.clientY };
    queueEntranceBreeze(event.clientX, event.clientY);
    refreshEntranceProximity();
}

function clearEntranceProximity() {
    lastEntrancePointer = null;
    setEntranceProximity(0);
}

// 載入就註冊在視窗捕獲階段；不依賴點擊、焦點或音樂播放狀態。
window.addEventListener('keydown', event => {
    if (entrance.open && event.key === 'Tab') entranceKeyboardMode = true;
}, true);
window.addEventListener('pointermove', trackEntrancePointer, { capture: true, passive: true });
window.addEventListener('mousemove', trackEntrancePointer, { capture: true, passive: true });
window.addEventListener('pointerover', trackEntrancePointer, { capture: true, passive: true });
document.documentElement.addEventListener('pointerleave', clearEntranceProximity);
window.addEventListener('blur', clearEntranceProximity);
window.addEventListener('focus', refreshEntranceProximity);
window.addEventListener('pageshow', refreshEntranceProximity);
window.addEventListener('resize', refreshEntranceProximity);
entrance.addEventListener('scroll', refreshEntranceProximity, { passive: true });
entranceTrigger.addEventListener('focus', refreshEntranceProximity);
entranceTrigger.addEventListener('blur', refreshEntranceProximity);
entrance.addEventListener('close', clearEntranceProximity);
entrance.addEventListener('cancel', event => {
    event.preventDefault();
    enterExhibition(false);
});
entrance.showModal();
entrance.focus({ preventScroll: true });
document.body.classList.add('entrance-open');
requestAnimationFrame(refreshEntranceProximity);

// 裝飾僅在開場呈現，不接收點擊、不加入鍵盤焦點。
const breezeLayer = document.createElement('div');
breezeLayer.className = 'entrance-breeze';
breezeLayer.setAttribute('aria-hidden', 'true');
breezeLayer.inert = true;
entrance.prepend(breezeLayer);
// 四季各六枚装飾，中央留給企劃標題與入口。
const breezeLayout = [
    [8, 14, 28, -35], [21, 9, 18, 25], [33, 18, 21, 55], [12, 33, 23, 15], [24, 28, 15, -50], [5, 46, 19, 45],
    [70, 10, 24, -30], [87, 15, 29, 40], [95, 34, 19, -15], [79, 30, 20, 65], [91, 48, 24, -45], [62, 17, 16, 20],
    [7, 65, 27, -45], [20, 73, 19, 35], [11, 90, 23, 65], [34, 86, 26, -25], [26, 94, 16, 15], [5, 80, 18, -10],
    [81, 67, 14, 0], [94, 75, 22, 0], [72, 87, 17, 0], [89, 94, 12, 0], [61, 92, 20, 0], [95, 58, 15, 0]
];
const breezeColors = ['#bc8085', '#7a9671', '#bd9255', '#9baeb6'];
const breezeSeasons = ['spring', 'summer', 'autumn', 'winter'];
const breezeMotes = breezeLayout.map(([x, y, size, tilt], index) => {
    const anchor = document.createElement('span');
    anchor.className = 'breeze-anchor';
    anchor.style.left = `${x}%`;
    anchor.style.top = `${y}%`;
    anchor.style.setProperty('--size', `${size}px`);
    anchor.style.setProperty('--tilt', `${tilt}deg`);
    anchor.dataset.season = breezeSeasons[Math.floor(index / 6)];
    anchor.style.setProperty('--petal-color', breezeColors[Math.floor(index / 6)]);
    const shape = document.createElement('span');
    shape.className = 'breeze-shape';
    anchor.append(shape);
    breezeLayer.append(anchor);
    return { anchor, shape, tilt };
});
let breezeFrame = 0;
let breezeRestTimer;

function restEntranceBreeze() {
    cancelAnimationFrame(breezeFrame);
    clearTimeout(breezeRestTimer);
    breezeFrame = 0;
    breezeMotes.forEach(({ shape }) => {
        shape.classList.remove('is-stirred');
        shape.style.removeProperty('transform');
        shape.style.removeProperty('opacity');
    });
}

function updateEntranceBreeze(x, y) {
    if (!entrance.open || enteringExhibition || reducedMotion.matches || document.hidden) return;
    breezeMotes.forEach(({ anchor, shape, tilt }) => {
        if (!anchor.getClientRects().length) return;
        const rect = anchor.getBoundingClientRect();
        const dx = rect.left - x;
        const dy = rect.top - y;
        const distance = Math.hypot(dx, dy);
        const progress = Math.max(0, 1 - distance / 240);
        const strength = progress * progress * (3 - 2 * progress);
        if (!strength) {
            shape.classList.remove('is-stirred');
            shape.style.removeProperty('transform');
            shape.style.removeProperty('opacity');
            return;
        }
        const offsetX = dx / Math.max(distance, 1) * strength * 26;
        const offsetY = (dy / Math.max(distance, 1) * 12 - 6) * strength;
        shape.classList.add('is-stirred');
        shape.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${tilt + strength * (dx < 0 ? -24 : 24)}deg) scale(${1 + strength * 0.18})`;
        shape.style.opacity = String(0.72 + strength * 0.23);
    });
}

function queueEntranceBreeze(x, y) {
    if (reducedMotion.matches) return;
    cancelAnimationFrame(breezeFrame);
    clearTimeout(breezeRestTimer);
    breezeFrame = requestAnimationFrame(() => {
        breezeFrame = 0;
        updateEntranceBreeze(x, y);
    });
    // 滑鼠停下後餘韻慢慢消散，不持續執行動畫迴圈。
    breezeRestTimer = setTimeout(restEntranceBreeze, 280);
}
entrance.addEventListener('close', restEntranceBreeze);
document.addEventListener('visibilitychange', () => { if (document.hidden) restEntranceBreeze(); });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) restEntranceBreeze(); });