
let countdownInterval;
let targetDate;
let isPaused = false;
let remainingTime = 0;

const elements = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  datetimeInput: document.getElementById('datetime-input'),
  setBtn: document.getElementById('set-btn'),
  pauseBtn: document.getElementById('pause-btn'),
  resetBtn: document.getElementById('reset-btn'),
  message: document.getElementById('message')
};

function updateCountdown() {
  const now = Date.now();
  const distance = targetDate - now;

  if (distance <= 0) {
    clearInterval(countdownInterval);
    showMessage('🎉 时间到了！', true);
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  elements.days.textContent = String(days).padStart(2, '0');
  elements.hours.textContent = String(hours).padStart(2, '0');
  elements.minutes.textContent = String(minutes).padStart(2, '0');
  elements.seconds.textContent = String(seconds).padStart(2, '0');
}

function startCountdown() {
  const inputDate = elements.datetimeInput.value;
  if (!inputDate) {
    showMessage('⚠️ 请选择一个有效的时间', false);
    return;
  }

  targetDate = new Date(inputDate).getTime();
  if (isNaN(targetDate)) {
    showMessage('⚠️ 无效的时间格式', false);
    return;
  }

  const now = Date.now();
  if (targetDate <= now) {
    showMessage('⚠️ 请选择未来的时间', false);
    return;
  }

  isPaused = false;
  hideMessage();
  countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function pauseCountdown() {
  if (isPaused) {
    countdownInterval = setInterval(updateCountdown, 1000);
    elements.pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停';
    isPaused = false;
  } else {
    clearInterval(countdownInterval);
    elements.pauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i>继续';
    isPaused = true;
  }
}

function resetCountdown() {
  clearInterval(countdownInterval);
  elements.days.textContent = '00';
  elements.hours.textContent = '00';
  elements.minutes.textContent = '00';
  elements.seconds.textContent = '00';
  elements.datetimeInput.value = '';
  hideMessage();
  elements.pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停';
  isPaused = false;
}

function showMessage(text, isSuccess) {
  elements.message.textContent = text;
  elements.message.className = `mt-6 text-lg font-semibold ${isSuccess ? 'text-green-300' : 'text-yellow-300'}`;
  elements.message.classList.remove('hidden');
}

function hideMessage() {
  elements.message.classList.add('hidden');
}

elements.setBtn.addEventListener('click', startCountdown);
elements.pauseBtn.addEventListener('click', pauseCountdown);
elements.resetBtn.addEventListener('click', resetCountdown);
