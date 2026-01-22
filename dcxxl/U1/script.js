// 全局变量不变，新增一个计算最大列数的辅助函数

// 新增：计算一行最多能排多少个按钮（根据屏幕宽度）
function getMaxColumns() {
    // 按钮宽度 + 间距 = 120px + 15px = 135px
    const btnWidthWithGap = 135;
    // 获取游戏容器的可用宽度
    const containerWidth = gameContainer.clientWidth || window.innerWidth * 0.9;
    // 计算最大列数（向下取整，保证能完整排满一行）
    let maxCols = Math.floor(containerWidth / btnWidthWithGap);
    // 限制最小列数2，最大列数8（避免列数过多/过少）
    maxCols = Math.max(2, Math.min(8, maxCols));
    return maxCols;
}

// 修改 setDynamicGridLayout 函数：优先排满一行
function setDynamicGridLayout() {
    const totalBtnCount = wordGroupCount * 2;
    // 获取一行最多能排的列数
    const maxCols = getMaxColumns();
    // 最终列数 = 取「最大列数」和「总按钮数」的较小值，确保优先排满一行
    const columns = Math.min(maxCols, totalBtnCount);
    // 动态设置网格列数
    gameContainer.style.gridTemplateColumns = `repeat(${columns}, 120px)`;
}

// 新增：窗口大小变化时，重新排版（适配窗口缩放）
function handleResize() {
    if (wordPairs.length > 0) {
        setDynamicGridLayout();
    }
}

// 在 initGame 函数中，绑定窗口大小变化事件
async function initGame() {
    await loadWordsFromTxt();
    bindDomElements();
    // 重置状态...（原有代码不变）
    
    if (wordPairs.length > 0) {
        setDynamicGridLayout();
        generateGameButtons();
        // 绑定窗口缩放事件
        window.removeEventListener("resize", handleResize);
        window.addEventListener("resize", handleResize);
    }
}

// 其他函数（loadWordsFromTxt、generateGameButtons 等）保持不变