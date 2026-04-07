<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const email = ref("");
const password = ref("");
const remember = ref(true);

const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref("");
const hasEmailError = ref(false);
const hasPasswordError = ref(false);

const isLoginError = ref(false);
const isShaking = ref(false);

let mouseX = 0;
let mouseY = 0;
let isTyping = false;
let isLookingAtEachOther = false;
let isPurpleBlinking = false;
let isBlackBlinking = false;
let isPurplePeeking = false;
let isPasswordFocused = false;
let isUnmounted = false;

let typingTimer: number | null = null;
let errorRecoverTimer: number | null = null;
let submitTimer: number | null = null;
const timerIds = new Set<number>();

function managedTimeout(fn: () => void, delay: number) {
  const id = window.setTimeout(() => {
    timerIds.delete(id);
    if (!isUnmounted) fn();
  }, delay);
  timerIds.add(id);
  return id;
}

function clearManagedTimer(id: number | null) {
  if (id === null) return;
  window.clearTimeout(id);
  timerIds.delete(id);
}

function clearAllTimers() {
  timerIds.forEach((id) => window.clearTimeout(id));
  timerIds.clear();
}

function getEl(id: string) {
  return document.getElementById(id);
}

function calcPosition(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 3;
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const faceX = Math.max(-15, Math.min(15, dx / 20));
  const faceY = Math.max(-10, Math.min(10, dy / 30));
  const bodySkew = Math.max(-6, Math.min(6, -dx / 120));
  return { faceX, faceY, bodySkew };
}

function calcPupilOffset(el: HTMLElement, maxDist: number) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
  const angle = Math.atan2(dy, dx);
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
}

function updateCharacters() {
  const purple = getEl("char-purple") as HTMLElement | null;
  const black = getEl("char-black") as HTMLElement | null;
  const orange = getEl("char-orange") as HTMLElement | null;
  const yellow = getEl("char-yellow") as HTMLElement | null;

  if (!purple || !black || !orange || !yellow) return;

  const purplePos = calcPosition(purple);
  const blackPos = calcPosition(black);
  const orangePos = calcPosition(orange);
  const yellowPos = calcPosition(yellow);

  const pwdLen = password.value.length;
  const isShowingPwd = pwdLen > 0 && showPassword.value;
  const isLookingAway = isPasswordFocused && !showPassword.value;

  if (isShowingPwd) {
    purple.style.transform = "skewX(0deg)";
    purple.style.height = "370px";
  } else if (isLookingAway) {
    purple.style.transform = "skewX(-14deg) translateX(-20px)";
    purple.style.height = "410px";
  } else if (isTyping) {
    purple.style.transform = `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`;
    purple.style.height = "410px";
  } else {
    purple.style.transform = `skewX(${purplePos.bodySkew}deg)`;
    purple.style.height = "370px";
  }

  const purpleEyes = getEl("purple-eyes") as HTMLElement | null;
  const purpleEyeL = getEl("purple-eye-l") as HTMLElement | null;
  const purpleEyeR = getEl("purple-eye-r") as HTMLElement | null;
  const purplePupilL = getEl("purple-pupil-l") as HTMLElement | null;
  const purplePupilR = getEl("purple-pupil-r") as HTMLElement | null;

  if (!purpleEyes || !purpleEyeL || !purpleEyeR || !purplePupilL || !purplePupilR) return;

  purpleEyeL.style.height = isPurpleBlinking ? "2px" : "18px";
  purpleEyeR.style.height = isPurpleBlinking ? "2px" : "18px";

  if (isLoginError.value) {
    purpleEyes.style.left = "30px";
    purpleEyes.style.top = "55px";
    purplePupilL.style.transform = "translate(-3px, 4px)";
    purplePupilR.style.transform = "translate(-3px, 4px)";
  } else if (isLookingAway) {
    purpleEyes.style.left = "20px";
    purpleEyes.style.top = "25px";
    purplePupilL.style.transform = "translate(-5px, -5px)";
    purplePupilR.style.transform = "translate(-5px, -5px)";
  } else if (isShowingPwd) {
    purpleEyes.style.left = "20px";
    purpleEyes.style.top = "35px";
    const px = isPurplePeeking ? 4 : -4;
    const py = isPurplePeeking ? 5 : -4;
    purplePupilL.style.transform = `translate(${px}px, ${py}px)`;
    purplePupilR.style.transform = `translate(${px}px, ${py}px)`;
  } else if (isLookingAtEachOther) {
    purpleEyes.style.left = "55px";
    purpleEyes.style.top = "65px";
    purplePupilL.style.transform = "translate(3px, 4px)";
    purplePupilR.style.transform = "translate(3px, 4px)";
  } else {
    purpleEyes.style.left = `${45 + purplePos.faceX}px`;
    purpleEyes.style.top = `${40 + purplePos.faceY}px`;
    const po = calcPupilOffset(purpleEyeL, 5);
    purplePupilL.style.transform = `translate(${po.x}px, ${po.y}px)`;
    purplePupilR.style.transform = `translate(${po.x}px, ${po.y}px)`;
  }

  if (isShowingPwd) {
    black.style.transform = "skewX(0deg)";
  } else if (isLookingAway) {
    black.style.transform = "skewX(12deg) translateX(-10px)";
  } else if (isLookingAtEachOther) {
    black.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`;
  } else if (isTyping) {
    black.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`;
  } else {
    black.style.transform = `skewX(${blackPos.bodySkew}deg)`;
  }

  const blackEyes = getEl("black-eyes") as HTMLElement | null;
  const blackEyeL = getEl("black-eye-l") as HTMLElement | null;
  const blackEyeR = getEl("black-eye-r") as HTMLElement | null;
  const blackPupilL = getEl("black-pupil-l") as HTMLElement | null;
  const blackPupilR = getEl("black-pupil-r") as HTMLElement | null;

  if (!blackEyes || !blackEyeL || !blackEyeR || !blackPupilL || !blackPupilR) return;

  blackEyeL.style.height = isBlackBlinking ? "2px" : "16px";
  blackEyeR.style.height = isBlackBlinking ? "2px" : "16px";

  if (isLoginError.value) {
    blackEyes.style.left = "15px";
    blackEyes.style.top = "40px";
    blackPupilL.style.transform = "translate(-3px, 4px)";
    blackPupilR.style.transform = "translate(-3px, 4px)";
  } else if (isLookingAway) {
    blackEyes.style.left = "10px";
    blackEyes.style.top = "20px";
    blackPupilL.style.transform = "translate(-4px, -5px)";
    blackPupilR.style.transform = "translate(-4px, -5px)";
  } else if (isShowingPwd) {
    blackEyes.style.left = "10px";
    blackEyes.style.top = "28px";
    blackPupilL.style.transform = "translate(-4px, -4px)";
    blackPupilR.style.transform = "translate(-4px, -4px)";
  } else if (isLookingAtEachOther) {
    blackEyes.style.left = "32px";
    blackEyes.style.top = "12px";
    blackPupilL.style.transform = "translate(0px, -4px)";
    blackPupilR.style.transform = "translate(0px, -4px)";
  } else {
    blackEyes.style.left = `${26 + blackPos.faceX}px`;
    blackEyes.style.top = `${32 + blackPos.faceY}px`;
    const bo = calcPupilOffset(blackEyeL, 4);
    blackPupilL.style.transform = `translate(${bo.x}px, ${bo.y}px)`;
    blackPupilR.style.transform = `translate(${bo.x}px, ${bo.y}px)`;
  }

  const orangeMouth = getEl("orange-mouth") as HTMLElement | null;
  if (orangeMouth && isLoginError.value) {
    orangeMouth.style.left = `${80 + orangePos.faceX}px`;
    orangeMouth.style.top = "130px";
  }
  if (isShowingPwd) {
    orange.style.transform = "skewX(0deg)";
  } else {
    orange.style.transform = `skewX(${orangePos.bodySkew}deg)`;
  }

  const orangeEyes = getEl("orange-eyes") as HTMLElement | null;
  const orangePupilL = getEl("orange-pupil-l") as HTMLElement | null;
  const orangePupilR = getEl("orange-pupil-r") as HTMLElement | null;

  if (!orangeEyes || !orangePupilL || !orangePupilR) return;

  if (isLoginError.value) {
    orangeEyes.style.left = "60px";
    orangeEyes.style.top = "95px";
    orangePupilL.style.transform = "translate(-3px, 4px)";
    orangePupilR.style.transform = "translate(-3px, 4px)";
  } else if (isLookingAway) {
    orangeEyes.style.left = "50px";
    orangeEyes.style.top = "75px";
    orangePupilL.style.transform = "translate(-5px, -5px)";
    orangePupilR.style.transform = "translate(-5px, -5px)";
  } else if (isShowingPwd) {
    orangeEyes.style.left = "50px";
    orangeEyes.style.top = "85px";
    orangePupilL.style.transform = "translate(-5px, -4px)";
    orangePupilR.style.transform = "translate(-5px, -4px)";
  } else {
    orangeEyes.style.left = `${82 + orangePos.faceX}px`;
    orangeEyes.style.top = `${90 + orangePos.faceY}px`;
    const oo = calcPupilOffset(orangePupilL, 5);
    orangePupilL.style.transform = `translate(${oo.x}px, ${oo.y}px)`;
    orangePupilR.style.transform = `translate(${oo.x}px, ${oo.y}px)`;
  }

  if (isShowingPwd) {
    yellow.style.transform = "skewX(0deg)";
  } else {
    yellow.style.transform = `skewX(${yellowPos.bodySkew}deg)`;
  }

  const yellowEyes = getEl("yellow-eyes") as HTMLElement | null;
  const yellowPupilL = getEl("yellow-pupil-l") as HTMLElement | null;
  const yellowPupilR = getEl("yellow-pupil-r") as HTMLElement | null;
  const yellowMouth = getEl("yellow-mouth") as HTMLElement | null;

  if (!yellowEyes || !yellowPupilL || !yellowPupilR || !yellowMouth) return;

  if (isLoginError.value) {
    yellowEyes.style.left = "35px";
    yellowEyes.style.top = "45px";
    yellowPupilL.style.transform = "translate(-3px, 4px)";
    yellowPupilR.style.transform = "translate(-3px, 4px)";
    yellowMouth.style.left = "30px";
    yellowMouth.style.top = "92px";
    yellowMouth.style.transform = "rotate(-8deg)";
  } else if (isLookingAway) {
    yellowEyes.style.left = "20px";
    yellowEyes.style.top = "30px";
    yellowPupilL.style.transform = "translate(-5px, -5px)";
    yellowPupilR.style.transform = "translate(-5px, -5px)";
    yellowMouth.style.left = "15px";
    yellowMouth.style.top = "78px";
    yellowMouth.style.transform = "rotate(0deg)";
  } else if (isShowingPwd) {
    yellowEyes.style.left = "20px";
    yellowEyes.style.top = "35px";
    yellowPupilL.style.transform = "translate(-5px, -4px)";
    yellowPupilR.style.transform = "translate(-5px, -4px)";
    yellowMouth.style.left = "10px";
    yellowMouth.style.top = "88px";
    yellowMouth.style.transform = "rotate(0deg)";
  } else {
    yellowEyes.style.left = `${52 + yellowPos.faceX}px`;
    yellowEyes.style.top = `${40 + yellowPos.faceY}px`;
    const yo = calcPupilOffset(yellowPupilL, 5);
    yellowPupilL.style.transform = `translate(${yo.x}px, ${yo.y}px)`;
    yellowPupilR.style.transform = `translate(${yo.x}px, ${yo.y}px)`;
    yellowMouth.style.left = `${40 + yellowPos.faceX}px`;
    yellowMouth.style.top = `${88 + yellowPos.faceY}px`;
    yellowMouth.style.transform = "rotate(0deg)";
  }
}

function setTyping(typing: boolean) {
  isTyping = typing;
  if (typing) {
    isLookingAtEachOther = true;
    clearManagedTimer(typingTimer);
    typingTimer = managedTimeout(() => {
      isLookingAtEachOther = false;
      updateCharacters();
    }, 800);
  } else {
    isLookingAtEachOther = false;
  }
  updateCharacters();
}

function scheduleBlinkPurple() {
  managedTimeout(() => {
    isPurpleBlinking = true;
    updateCharacters();
    managedTimeout(() => {
      isPurpleBlinking = false;
      updateCharacters();
      scheduleBlinkPurple();
    }, 150);
  }, Math.random() * 4000 + 3000);
}

function scheduleBlinkBlack() {
  managedTimeout(() => {
    isBlackBlinking = true;
    updateCharacters();
    managedTimeout(() => {
      isBlackBlinking = false;
      updateCharacters();
      scheduleBlinkBlack();
    }, 150);
  }, Math.random() * 4000 + 3000);
}

function schedulePeek() {
  if (!(password.value.length > 0 && showPassword.value)) return;
  managedTimeout(() => {
    if (!(password.value.length > 0 && showPassword.value)) return;
    isPurplePeeking = true;
    updateCharacters();
    managedTimeout(() => {
      isPurplePeeking = false;
      updateCharacters();
      schedulePeek();
    }, 800);
  }, Math.random() * 3000 + 2000);
}

function togglePassword() {
  showPassword.value = !showPassword.value;
  if (showPassword.value) schedulePeek();
  updateCharacters();
}

function resetValidationUI() {
  errorMsg.value = "";
  hasEmailError.value = false;
  hasPasswordError.value = false;
}

function triggerLoginError(message?: string) {
  if (message) errorMsg.value = message;

  clearManagedTimer(errorRecoverTimer);
  errorRecoverTimer = null;

  isShaking.value = false;
  void document.body.offsetHeight;
  isShaking.value = true;

  isLoginError.value = true;
  isPasswordFocused = false;
  updateCharacters();

  errorRecoverTimer = managedTimeout(() => {
    isLoginError.value = false;
    isShaking.value = false;
    updateCharacters();
    errorRecoverTimer = null;
  }, 2500);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function handleSubmit() {
  resetValidationUI();

  const normalizedEmail = email.value.trim();
  const pwd = password.value;

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    hasEmailError.value = true;
    triggerLoginError("Please enter a valid email address.");
    return;
  }

  if (!pwd || pwd.length < 6) {
    hasPasswordError.value = true;
    triggerLoginError("Password must be at least 6 characters.");
    return;
  }

  isSubmitting.value = true;
  submitTimer = managedTimeout(() => {
    isSubmitting.value = false;
    hasPasswordError.value = true;
    triggerLoginError("Invalid email or password. Please try again.");
  }, 1500);
}

function onEmailFocus() {
  setTyping(true);
}

function onEmailBlur() {
  setTyping(false);
}

function onEmailInput() {
  updateCharacters();
}

function onPasswordFocus() {
  isPasswordFocused = true;
  updateCharacters();
}

function onPasswordBlur() {
  isPasswordFocused = false;
  updateCharacters();
}

function onPasswordInput() {
  updateCharacters();
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!isTyping && !isLoginError.value) updateCharacters();
}

onMounted(() => {
  document.addEventListener("mousemove", onMouseMove);
  scheduleBlinkPurple();
  scheduleBlinkBlack();
  updateCharacters();
});

onUnmounted(() => {
  isUnmounted = true;
  document.removeEventListener("mousemove", onMouseMove);
  clearManagedTimer(typingTimer);
  clearManagedTimer(errorRecoverTimer);
  clearManagedTimer(submitTimer);
  clearAllTimers();
});
</script>

<template>
  <div id="login-page">
    <div class="left-panel">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2L15 9H9L12 2Z" />
          <path d="M12 22L9 15H15L12 22Z" />
          <path d="M2 12L9 9V15L2 12Z" />
          <path d="M22 12L15 15V9L22 12Z" />
        </svg>
        <span>CareerCompass</span>
      </div>

      <div class="characters-wrapper">
        <div class="characters-scene" id="characters-scene">
          <div class="character char-purple" id="char-purple">
            <div class="eyes" :class="{ 'shake-head': isShaking }" id="purple-eyes" style="left: 45px; top: 40px; gap: 28px">
              <div class="eyeball" id="purple-eye-l" style="width: 18px; height: 18px">
                <div class="pupil" id="purple-pupil-l" style="width: 7px; height: 7px"></div>
              </div>
              <div class="eyeball" id="purple-eye-r" style="width: 18px; height: 18px">
                <div class="pupil" id="purple-pupil-r" style="width: 7px; height: 7px"></div>
              </div>
            </div>
          </div>

          <div class="character char-black" id="char-black">
            <div class="eyes" :class="{ 'shake-head': isShaking }" id="black-eyes" style="left: 26px; top: 32px; gap: 20px">
              <div class="eyeball" id="black-eye-l" style="width: 16px; height: 16px">
                <div class="pupil" id="black-pupil-l" style="width: 6px; height: 6px"></div>
              </div>
              <div class="eyeball" id="black-eye-r" style="width: 16px; height: 16px">
                <div class="pupil" id="black-pupil-r" style="width: 6px; height: 6px"></div>
              </div>
            </div>
          </div>

          <div class="character char-orange" id="char-orange">
            <div class="eyes" :class="{ 'shake-head': isShaking }" id="orange-eyes" style="left: 82px; top: 90px; gap: 28px">
              <div class="bare-pupil" id="orange-pupil-l"></div>
              <div class="bare-pupil" id="orange-pupil-r"></div>
            </div>
            <div
              class="orange-mouth"
              :class="{ visible: isLoginError, 'shake-head': isShaking }"
              id="orange-mouth"
              style="left: 90px; top: 120px"
            ></div>
          </div>

          <div class="character char-yellow" id="char-yellow">
            <div class="eyes" :class="{ 'shake-head': isShaking }" id="yellow-eyes" style="left: 52px; top: 40px; gap: 20px">
              <div class="bare-pupil" id="yellow-pupil-l"></div>
              <div class="bare-pupil" id="yellow-pupil-r"></div>
            </div>
            <div class="yellow-mouth" :class="{ 'shake-head': isShaking }" id="yellow-mouth" style="left: 40px; top: 88px"></div>
          </div>
        </div>
      </div>

      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Contact</a>
      </div>
    </div>

    <div class="right-panel">
      <div class="form-container">
        <div class="sparkle-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.5 9H10.5L12 2Z" fill="#1a1a2e" />
            <path d="M12 22L10.5 15H13.5L12 22Z" fill="#1a1a2e" />
            <path d="M2 12L9 10.5V13.5L2 12Z" fill="#1a1a2e" />
            <path d="M22 12L15 13.5V10.5L22 12Z" fill="#1a1a2e" />
          </svg>
        </div>

        <div class="form-header">
          <h1>Welcome back!</h1>
          <p>Please enter your details</p>
        </div>

        <form id="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label id="email-label" for="email" :class="{ 'error-label': hasEmailError }">Email</label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                autocomplete="off"
                :class="{ error: hasEmailError }"
                @focus="onEmailFocus"
                @blur="onEmailBlur"
                @input="onEmailInput"
              />
            </div>
          </div>

          <div class="form-group">
            <label id="password-label" for="password" :class="{ 'error-label': hasPasswordError }">Password</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                :class="{ error: hasPasswordError }"
                @focus="onPasswordFocus"
                @blur="onPasswordBlur"
                @input="onPasswordInput"
              />
              <button type="button" class="toggle-password" id="toggle-password" @click="togglePassword">
                <svg
                  v-show="!showPassword"
                  id="eye-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-show="showPassword"
                  id="eye-off-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input v-model="remember" type="checkbox" /> Remember for 30 days
            </label>
            <a href="#" class="forgot-link">Forgot password?</a>
          </div>

          <div id="error-msg" class="error-msg" :style="{ display: errorMsg ? 'block' : 'none' }">{{ errorMsg }}</div>

          <button type="submit" class="btn-login" id="btn-login" :disabled="isSubmitting">
            <span class="btn-text">{{ isSubmitting ? "Signing in..." : "Log In" }}</span>
            <div class="btn-hover-content">
              <span>Log In</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>

          <button type="button" class="btn-google" id="btn-google">
            <span class="btn-text">
              <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84v-.14z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Log in with Google
            </span>
            <div class="btn-hover-content">
              <span>Log in with Google</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        </form>

        <div class="signup-link">Don't have an account? <a href="#">Sign Up</a></div>
      </div>
    </div>
  </div>
</template>

<style>
@import "./style.css";
</style>
