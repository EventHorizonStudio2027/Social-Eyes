/* Selfie-first entry: local preview only. No uploads, storage, or conversion claims. */
(() => {
  'use strict';
  const camera = document.getElementById('selfie-camera');
  const upload = document.getElementById('selfie-upload');
  const preview = document.getElementById('selfie-preview');
  const image = document.getElementById('selfie-preview-image');
  const placeholder = document.getElementById('selfie-placeholder');
  const feedback = document.getElementById('selfie-feedback');
  const discard = document.getElementById('selfie-discard');
  const manual = document.getElementById('selfie-manual');
  const suggest = document.getElementById('selfie-suggest');
  if (!camera || !upload || !preview || !image || !placeholder || !feedback || !discard || !manual || !suggest) return;
  let objectUrl = null;
  let selectionId = 0;
  const reset = () => {
    selectionId += 1;
    image.onload = null;
    image.onerror = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    image.removeAttribute('src');
    preview.hidden = true;
    placeholder.hidden = false;
    camera.value = '';
    upload.value = '';
    suggest.disabled = true;
  };
  const select = event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024 || file.size === 0) {
      reset();
      feedback.textContent = 'Choose a JPEG, PNG, or WebP photo under 8 MB.';
      return;
    }
    reset();
    objectUrl = URL.createObjectURL(file);
    const activeSelection = selectionId;
    image.onload = () => {
      if (!objectUrl || activeSelection !== selectionId) return;
      preview.hidden = false;
      suggest.disabled = false;
      placeholder.hidden = true;
      feedback.textContent = 'Private preview ready. You can optionally suggest two editable avatar colors; facial features are not analyzed.';
    };
    image.onerror = () => {
      if (activeSelection !== selectionId) return;
      reset();
      feedback.textContent = 'This image could not be opened. Please choose another photo.';
    };
    image.src = objectUrl;
  };
  suggest.addEventListener('click', () => {
    if (!objectUrl || !image.complete || !image.naturalWidth || !window.SocialEyesPhotoPalette || !window.SocialEyesApplyPhotoSuggestions) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw Error('Canvas unavailable');
      const width = image.naturalWidth, height = image.naturalHeight;
      const square = Math.min(width, height);
      ctx.drawImage(image, (width - square) / 2, (height - square) / 2, square, square, 0, 0, 128, 128);
      const pixels = ctx.getImageData(0, 0, 128, 128);
      const proposal = window.SocialEyesPhotoPalette.suggest(pixels.data, 128, 128);
      if (!window.SocialEyesApplyPhotoSuggestions(proposal)) throw Error('Avatar editor unavailable');
      feedback.textContent = 'Applied approximate skin and hair color suggestions. These are rough image samples, not face detection. Review and edit your avatar below.';
      document.getElementById('manual-avatar-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ctx.clearRect(0, 0, 128, 128);
      canvas.width = 0;
      canvas.height = 0;
    } catch {
      feedback.textContent = 'Could not sample colors from this photo. Your avatar is unchanged; you can customize manually.';
    }
  });
  camera.addEventListener('change', select);
  upload.addEventListener('change', select);
  discard.addEventListener('click', () => { reset(); feedback.textContent = 'Photo removed from the preview.'; });
  manual.addEventListener('click', () => document.getElementById('manual-avatar-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  window.addEventListener('pagehide', reset);
})();
