# 頁面與導覽

最後核對：2026-10-06

## 頁面對照

| page key | DOM | 選單／左上標籤 | 頁內內容 |
| --- | --- | --- | --- |
| `intro` | `#intro-page` | 理時序 | 大標仍為「文字」、引文、節氣環、觀芳華按鈕 |
| `gallery` | `#gallery-page` | 觀芳華 | 24 張作品輪播 |
| `text` | `#text-page` | 繪春信 | 「繪師資訊」標題，內容待補 |
| `planning` | `#planning-page` | 籌花事 | 「籌畫細節」標題，內容待補 |
| `thanks` | `#thanks-page` | 謝花人 | 「委託名單」標題，內容待補 |

不要自行在選單名稱前加入數字，也不要混淆繪春信與謝花人。

## 選單

- `#siteMenu` 是原生 `dialog`，左側 `.menu-panel` 寬度為 `min(340px, 82vw)`。
- `openMenu()` 使用 `showModal()`，加上 `.is-open` 與 `body.menu-open`，同步 `aria-expanded=true`。
- `closeMenu()` 先播放 650ms 收合；reduced-motion 下立即關閉。
- 點擊 dialog 遮罩或按 Esc 會關閉。
- `close` 事件負責清理 class、`aria-expanded` 並把焦點還給選單按鈕。
- 五個 `.nav-btn` 在一般動態模式以 150、300、450、600、750ms 延遲依序進場。

## 切頁

- `switchPage(pageName)` 驗證目標、目前頁面與 `isPageSwitching`。
- 一般模式：目前頁 180ms 淡出並上移 6px，目標頁 320ms 從下方 8px 淡入。
- reduced-motion 或不支援 Web Animations 時直接呼叫 `displayPage()`。
- `displayPage()` 會：
  - 完成／取消作品動畫。
  - 清除所有頁與按鈕的 active 狀態。
  - 更新 body 背景 class、左上頁名與 `aria-current`。
  - 作品頁套用目前作品背景色；理時序設為 `#F3EFE5`。
  - 捲回頁首並完整關閉選單。
- 切頁結束後焦點回到 `#menuToggle`。

## 資訊頁現況

- 三頁都使用 `.info-page` 與 `.text-container`。
- 繪春信與謝花人有半透明卡片、漸層背景及子元素進場動畫。
- 籌花事目前沒有 `text-page-active` 背景，也不在上述兩頁的卡片／逐項動畫 selector 中。
- 三頁內容尚未完成，不要代替使用者發明介紹、名單或企劃文字。

## 修改檢查

- 左上標籤、選單 active、`aria-current` 與顯示頁一致。
- 遮罩、關閉鍵與 Esc 都能關閉選單。
- 開關選單不造成水平位移；保留 `html { scrollbar-gutter: stable; }`。
- 切頁時不殘留 `body.menu-open`、作品動畫或錯誤焦點。

## 更新此文件的時機

新增／刪除頁面、改頁名、調整選單、切頁流程或資訊頁共用規則時更新。
