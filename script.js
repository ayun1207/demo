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

function openMenu() {
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
    clearTimeout(menuCloseTimer);
    siteMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.focus({ preventScroll: true });
});

function switchPage(pageName) {
    const targetPage = document.getElementById(`${pageName}-page`);
    const targetButton = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.dataset.page === pageName);
    if (!targetPage || !targetButton) return;
    finishPageTurn();

    const pages = document.querySelectorAll('.page-content');
    const buttons = document.querySelectorAll('.nav-btn');

    pages.forEach(page => page.classList.remove('active'));
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
    });
    targetPage.classList.add('active');
    document.body.classList.toggle('text-page-active', pageName === 'text');
    targetButton.classList.add('active');
    targetButton.setAttribute('aria-current', 'page');
    document.getElementById('currentPageLabel').textContent = {
        gallery: '作品展示', text: '繪師資訊', planning: '籌畫細節'
    }[pageName];
    window.scrollTo({ top: 0, behavior: 'instant' });
    closeMenu();
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
    if (!button || button.disabled || reducedMotion.matches || typeof button.animate !== 'function') return;
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
