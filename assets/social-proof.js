import { Component } from '@theme/component';

/**
 * SocialProofSection web component.
 * Handles play/pause, mute, and carousel navigation for UGC video cards.
 */
class SocialProofSection extends Component {
  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * Toggle play/pause for the clicked video card.
   * Pauses all other videos in the section before toggling the target.
   * @param {MouseEvent} event
   */
  togglePlay(event) {
    const btn = /** @type {HTMLElement} */ (event.currentTarget ?? event.target);
    const card = btn.closest('.social-proof__video-card');
    if (!card) return;

    const video = /** @type {HTMLVideoElement | null} */ (card.querySelector('video'));
    if (!video) return;

    // Pause all other videos and remove is-playing from their cards
    for (const otherVideo of this.querySelectorAll('video')) {
      if (otherVideo !== video) {
        otherVideo.pause();
        const otherCard = otherVideo.closest('.social-proof__video-card');
        if (otherCard) otherCard.classList.remove('is-playing');
      }
    }

    // Toggle this video
    if (video.paused) {
      video.play().catch(() => {});
      card.classList.add('is-playing');
    } else {
      video.pause();
      card.classList.remove('is-playing');
    }
  }

  /**
   * Toggle mute/unmute for the clicked video card.
   * @param {MouseEvent} event
   */
  toggleMute(event) {
    const btn = /** @type {HTMLElement} */ (event.currentTarget ?? event.target);
    const card = btn.closest('.social-proof__video-card');
    if (!card) return;

    const video = /** @type {HTMLVideoElement | null} */ (card.querySelector('video'));
    if (!video) return;

    video.muted = !video.muted;
    card.classList.toggle('is-muted', video.muted);

    // Update button icon visibility
    const muteBtn = card.querySelector('.social-proof__mute-btn');
    if (muteBtn) {
      const iconOn = muteBtn.querySelector('.icon-volume-on');
      const iconOff = muteBtn.querySelector('.icon-volume-off');
      if (iconOn) iconOn.style.display = video.muted ? 'none' : 'block';
      if (iconOff) iconOff.style.display = video.muted ? 'block' : 'none';
    }
  }

  /**
   * Scroll the carousel to the previous slide.
   */
  scrollPrev() {
    const carousel = this.querySelector('.social-proof__carousel');
    if (!carousel) return;
    carousel.scrollBy({ left: -282, behavior: 'smooth' });
  }

  /**
   * Scroll the carousel to the next slide.
   */
  scrollNext() {
    const carousel = this.querySelector('.social-proof__carousel');
    if (!carousel) return;
    carousel.scrollBy({ left: 282, behavior: 'smooth' });
  }
}

customElements.define('social-proof-section', SocialProofSection);
