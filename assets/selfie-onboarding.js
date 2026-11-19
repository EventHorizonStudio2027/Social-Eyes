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
  if (!camera || !upload || !preview || !image || !placeholder || !feedback || !discard || !manual) return;
  let objectUrl = null;
  const reset = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    image.removeAttribute('src');
    preview.hidden = true;
    placeholder.hidden = false;
    camera.value = '';
    upload.value = '';
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
    image.onload = () => {
      if (!objectUrl) return;
      preview.hidden = false;
      placeholder.hidden = true;
      feedback.textContent = 'Private preview ready. Cartoon conversion is not connected yet; customize your avatar below.';
    };
    image.onerror = () => {
      reset();
      feedback.textContent = 'This image could not be opened. Please choose another photo.';
    };
    image.src = objectUrl;
  };
  camera.addEventListener('change', select);
  upload.addEventListener('change', select);
  discard.addEventListener('click', () => { reset(); feedback.textContent = 'Photo removed from the preview.'; });
  manual.addEventListener('click', () => document.getElementById('manual-avatar-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  window.addEventListener('pagehide', reset);
})();
