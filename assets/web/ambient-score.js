/* Original ambient synth sketch for Madhuban Motors. No samples or media downloads. */
export function createScore(ctx, destination = ctx.destination) {
  const master = ctx.createGain(); master.gain.value = 0;
  const lowpass = ctx.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 1350; lowpass.Q.value = .3;
  const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -15; limiter.ratio.value = 6; limiter.knee.value = 9;
  lowpass.connect(master); master.connect(limiter); limiter.connect(destination);
  const delay = ctx.createDelay(1); delay.delayTime.value = .43;
  const feedback = ctx.createGain(); feedback.gain.value = .22;
  const wet = ctx.createGain(); wet.gain.value = .16;
  lowpass.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(master);
  const oscillators = [];
  // Open fifths and a suspended upper colour, with independent slow swells.
  [[82.4069,.17,23,-.3],[123.4708,.09,31,.35],[164.8138,.07,41,-.45],[369.9944,.025,37,.5]].forEach(([hz,level,period,pan], i) => {
    const voice = ctx.createGain(); voice.gain.value = level;
    const stereo = ctx.createStereoPanner(); stereo.pan.value = pan;
    voice.connect(stereo); stereo.connect(lowpass);
    for (const detune of [-3,3]) {
      const tone = ctx.createOscillator(); tone.type = i < 2 ? 'triangle' : 'sine'; tone.frequency.value = hz; tone.detune.value = detune;
      const trim = ctx.createGain(); trim.gain.value = .5;
      tone.connect(trim); trim.connect(voice); tone.start(); oscillators.push(tone);
    }
    const swell = ctx.createOscillator(); swell.frequency.value = 1 / period;
    const depth = ctx.createGain(); depth.gain.value = level * .55;
    swell.connect(depth); depth.connect(voice.gain); swell.start(); oscillators.push(swell);
  });
  return {
    fade(on, seconds = on ? 2.5 : .35) {
      const t = ctx.currentTime;
      if (master.gain.cancelAndHoldAtTime) master.gain.cancelAndHoldAtTime(t);
      else { master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); }
      master.gain.linearRampToValueAtTime(on ? .18 : 0, t + seconds);
    },
    dispose() { oscillators.forEach(o => o.stop()); master.disconnect(); limiter.disconnect(); }
  };
}

const button = document.getElementById('mmSound');
if (button) {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) button.hidden = true;
  let ctx, score, revision = 0, timer, playing = false;
  const label = on => {
    playing = on; button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? 'Mute ambient showroom sound' : 'Play ambient showroom sound');
    button.querySelector('span').textContent = on ? 'Sound on' : 'Sound off';
  };
  const pause = () => {
    revision++; clearTimeout(timer); label(false);
    if (!ctx || !score) return;
    score.fade(false);
    timer = setTimeout(() => { if (!playing) ctx.suspend().catch(() => {}); }, 400);
  };
  button.addEventListener('click', async () => {
    if (playing) { pause(); return; }
    clearTimeout(timer); const request = ++revision;
    try {
      // Create/resume synchronously in the tap, including on iPhone Safari.
      ctx = ctx || new Audio({latencyHint:'playback'});
      const resumed = ctx.resume();
      if (!score) score = createScore(ctx);
      await resumed;
      if (request !== revision || document.hidden) return;
      score.fade(true); label(true);
    } catch (e) { label(false); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  addEventListener('pagehide', pause);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) button.classList.add('mm-sound--still');
}
