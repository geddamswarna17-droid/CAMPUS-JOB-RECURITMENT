/* ─────────────────────────────────────────────────────────────
   Beautiful Splash Screen Logic
   ───────────────────────────────────────────────────────────── */

class SplashScreen {
  constructor() {
    this.createSplash();
    this.initAnimations();
  }

  createSplash() {
    const splashHTML = `
      <div class="splash-overlay" id="splash-overlay">
        <div class="splash-particles">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
        </div>
        
        <div class="splash-container">
          <div class="splash-logo">C</div>
          <h1 class="splash-title">CampusConnect</h1>
          <p class="splash-subtitle">Connecting Talent with Opportunity</p>
          
          <div class="splash-loader">
            <div class="splash-loader-circle"></div>
            <div class="splash-loader-circle"></div>
            <div class="splash-loader-circle"></div>
          </div>
          
          <div class="splash-progress">
            <div class="splash-progress-bar"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', splashHTML);
  }

  initAnimations() {
    // Simulate loading progress
    setTimeout(() => {
      this.addLoadingText();
    }, 1500);

    // Hide splash screen after loading
    setTimeout(() => {
      this.hideSplash();
    }, 3500);
  }

  addLoadingText() {
    const container = document.querySelector('.splash-container');
    const loadingText = document.createElement('p');
    loadingText.style.cssText = `
      margin-top: 1.5rem;
      color: #64748b;
      font-size: 0.9rem;
      opacity: 0;
      animation: fadeInUp 1s ease-out forwards;
    `;
    loadingText.textContent = 'Loading amazing opportunities...';
    container.appendChild(loadingText);
  }

  hideSplash() {
    const splash = document.getElementById('splash-overlay');
    if (splash) {
      splash.classList.add('fade-out');
      
      // Remove from DOM after animation
      setTimeout(() => {
        splash.remove();
      }, 800);
    }
  }
}

// Initialize splash screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SplashScreen();
});
