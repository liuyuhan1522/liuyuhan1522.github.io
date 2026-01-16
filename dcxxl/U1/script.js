// 全局变量声明（先初始化空的词汇数组）
let wordPairs = []; // 从words.txt读取后赋值
let selectedButtons = [];
let gameContainer = null;
let timerElement = null;
let clickCountElement = null;
let isMatching = false; // 点击锁定标志
let prepareModal = null;
let scoreModal = null;
let finalTimeElement = null;
let finalClicksElement = null;
let actualTimeElement = null;
let timeDescElement = null;
let timerInterval = null;
let totalSeconds = 0;
let clickCount = 0;
let wordGroupCount = 0;
let minClickCount = 0;

// 核心函数1：读取words.txt文件并解析词汇数据
async function loadWordsFromTxt() {
    try {
        // 使用fetch读取本地txt文件（注意：需在服务器环境运行，不能直接双击html）
        const response = await fetch("words.txt");
        if (!response.ok) {
            throw new Error("无法读取words.txt文件，请检查文件是否存在");
        }
        const text = await response.text();
        
        // 解析txt内容：按行分割，再按逗号分割英文和中文
        const lines = text.split("\n").filter(line => line.trim() !== ""); // 分割行并过滤空行
        wordPairs = lines.map(line => {
            const [english, chinese] = line.split(",").map(item => item.trim()); // 分割并去除首尾空格
            return { english, chinese };
        });
        
        // 初始化词汇相关常量
        wordGroupCount = wordPairs.length;
        minClickCount = wordGroupCount * 2; // 最小点击数=单词组数*2
        
    } catch (error) {
        alert(`加载词汇失败：${error.message}`);
        console.error(error);
    }
}

// 核心函数2：初始化游戏（DOM元素绑定+界面渲染）
async function initGame() {
    // 第一步：先读取txt词汇（首次加载或重新开始都重新读取）
    await loadWordsFromTxt();
    
    // 第二步：绑定DOM元素（确保DOM已加载完成）
    bindDomElements();
    
    // 第三步：重置游戏状态
    scoreModal.classList.remove("active");
    prepareModal.classList.remove("hidden");
    gameContainer.innerHTML = "";
    selectedButtons = [];
    isMatching = false;
    clearInterval(timerInterval);
    totalSeconds = 0;
    timerElement.textContent = "00:00";
    clickCount = 0;
    clickCountElement.textContent = "0";
    
    // 第四步：生成游戏按钮（仅当词汇加载成功时）
    if (wordPairs.length > 0) {
        generateGameButtons();
    }
}

// 辅助函数：绑定DOM元素（避免重复获取）
function bindDomElements() {
    gameContainer = document.getElementById("gameContainer");
    timerElement = document.getElementById("timer");
    clickCountElement = document.getElementById("clickCount");
    prepareModal = document.getElementById("prepareModal");
    scoreModal = document.getElementById("scoreModal");
    finalTimeElement = document.getElementById("finalTime");
    finalClicksElement = document.getElementById("finalClicks");
    actualTimeElement = document.getElementById("actualTime");
    timeDescElement = document.getElementById("timeDesc");
}

// 辅助函数：生成游戏按钮
function generateGameButtons() {
    let allButtons = [];
    wordPairs.forEach(pair => {
        allButtons.push({
            text: pair.english,
            type: "english",
            match: pair.chinese
        });
        allButtons.push({
            text: pair.chinese,
            type: "chinese",
            match: pair.english
        });
    });

    // 随机打乱按钮顺序
    allButtons.sort(() => Math.random() - 0.5);

    // 创建DOM按钮并添加点击事件
    allButtons.forEach(btnData => {
        const button = document.createElement("button");
        button.className = `word-btn ${btnData.type}`;
        button.textContent = btnData.text;
        button.dataset.match = btnData.match;
        button.dataset.type = btnData.type;
        button.addEventListener("click", handleButtonClick);
        gameContainer.appendChild(button);
    });
}

// 核心函数3：开始游戏（隐藏准备弹窗+启动计时器）
function startGame() {
    prepareModal.classList.add("hidden");
    startTimer();
}

// 辅助函数：启动计时器
function startTimer() {
    timerInterval = setInterval(() => {
        totalSeconds++;
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");
        timerElement.textContent = `${minutes}:${seconds}`;

        // 通关后停止计时
        const allButtons = document.querySelectorAll(".word-btn");
        const hiddenButtons = document.querySelectorAll(".word-btn.hidden");
        if (hiddenButtons.length === allButtons.length) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

// 核心函数4：按钮点击事件处理（即时匹配+锁定防无效点击）
function handleButtonClick(e) {
    const currentBtn = e.target;

    // 匹配期间锁定，拒绝所有点击
    if (isMatching) return;

    // 跳过已隐藏的按钮
    if (currentBtn.classList.contains("hidden")) return;

    // 重复点击取消选中，不计数
    const isAlreadySelected = currentBtn.classList.contains("selected");
    if (isAlreadySelected) {
        currentBtn.classList.remove("selected");
        selectedButtons = selectedButtons.filter(btn => btn !== currentBtn);
        return;
    }

    // 同类别选择，不计数
    const isSameType = selectedButtons.length === 1 && 
                       selectedButtons[0].dataset.type === currentBtn.dataset.type;
    if (isSameType) {
        return;
    }

    // 有效选择，计数+1
    clickCount++;
    clickCountElement.textContent = clickCount;

    if (selectedButtons.length < 2) {
        currentBtn.classList.add("selected");
        selectedButtons.push(currentBtn);

        // 选中2个按钮，即时进行匹配判断
        if (selectedButtons.length === 2) {
            isMatching = true; // 开启锁定

            const btn1 = selectedButtons[0];
            const btn2 = selectedButtons[1];
            const isMatched = btn1.dataset.match === btn2.textContent && 
                              btn2.dataset.match === btn1.textContent;

            if (isMatched) {
                // 匹配成功：即时消除
                btn1.classList.add("hidden");
                btn2.classList.add("hidden");
                btn1.classList.remove("selected");
                btn2.classList.remove("selected");
                selectedButtons = [];
                isMatching = false; // 解锁
                checkGameWin();
            } else {
                // 匹配失败：即时取消选中
                btn1.classList.remove("selected");
                btn2.classList.remove("selected");
                selectedButtons = [];
                isMatching = false; // 解锁
            }
        }
    }
}

// 核心函数5：检查游戏通关
function checkGameWin() {
    const allButtons = document.querySelectorAll(".word-btn");
    const hiddenButtons = document.querySelectorAll(".word-btn.hidden");
    
    if (hiddenButtons.length === allButtons.length) {
        clearInterval(timerInterval);
        
        // 计算罚时和最终用时
        const extraClicks = Math.max(0, clickCount - minClickCount);
        const penaltyTime = extraClicks * 5;
        const finalTotalTime = totalSeconds + penaltyTime;
        
        // 更新弹窗数据
        finalClicksElement.textContent = clickCount;
        actualTimeElement.textContent = totalSeconds;
        finalTimeElement.textContent = finalTotalTime;
        
        // 展示计算说明
        if (extraClicks === 0) {
            timeDescElement.textContent = `完美！点击次数=${minClickCount}（最小点击数），无罚时`;
        } else {
            timeDescElement.textContent = `计算说明：${totalSeconds}（实际用时）+ ${extraClicks}（多余点击）* 5（每点击罚时）= ${finalTotalTime}`;
        }
        
        // 显示通关弹窗
        scoreModal.classList.add("active");
    }
}

// 页面加载完成后：绑定事件+初始化游戏
document.addEventListener("DOMContentLoaded", async () => {
    // 绑定按钮事件
    document.getElementById("resetBtn").addEventListener("click", initGame);
    document.getElementById("modalResetBtn").addEventListener("click", initGame);
    document.getElementById("startGameBtn").addEventListener("click", startGame);
    
    // 首次初始化游戏
    await initGame();
});