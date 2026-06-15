import { Component } from '@theme/component';

/**
 * SocialProofSection web component.
 * Handles play/pause toggling for UGC video cards.
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
}

customElements.define('social-proof-section', SocialProofSection);
