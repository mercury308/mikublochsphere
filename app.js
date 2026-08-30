let audioCtx, masterGainNode;
let vocalPlayers = {}, vocalGains = {};
let synthOscillators = {}, synthGains = {};
let vibratoOsc, vibratoGain, vocalTextureFilter;

let audioInitialized = false;
let activeVowel = 'ah';
let activeWave = 'sine';

// DOM select hooks
const startBtn = document.getElementById('start-audio');
const thetaSlider = document.getElementById('theta');
const phiSlider = document.getElementById('phi');
const posSlider = document.getElementById('position');

async function loadLocalSample(fileName) {
    const response = await fetch(fileName);
    if (!response.ok) throw new Error(`Resource pipeline failure: ${fileName}`);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
}

function initVocalTrack(key, buffer) {
    vocalGains[key] = audioCtx.createGain();
    vocalGains[key].gain.setValueAtTime(0, audioCtx.currentTime);
    
    // route vocal tracks through the dedicated quantum filter before the main output
    vocalGains[key].connect(vocalTextureFilter);

    vocalPlayers[key] = audioCtx.createBufferSource();
    vocalPlayers[key].buffer = buffer;
    vocalPlayers[key].loop = true;
    vocalPlayers[key].connect(vocalGains[key]);
}

function initSynthOscillator(key, waveType) {
    synthGains[key] = audioCtx.createGain();
    synthGains[key].gain.setValueAtTime(0, audioCtx.currentTime);
    synthGains[key].connect(masterGainNode);

    synthOscillators[key] = audioCtx.createOscillator();
    synthOscillators[key].type = waveType;
    synthOscillators[key].frequency.setValueAtTime(220, audioCtx.currentTime); // Standardized C4 pitch
    
    // wire global pitch wigglyness LFO into the synthesizer arrays
    vibratoGain.connect(synthOscillators[key].frequency);
    
    synthOscillators[key].connect(synthGains[key]);
}

startBtn.addEventListener('click', async () => {
    try {
        startBtn.innerText = "Deploying Matrix Elements...";
        startBtn.disabled = true;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // establish master system volume control block
        masterGainNode = audioCtx.createGain();
        masterGainNode.gain.setValueAtTime(0.7, now);
        masterGainNode.connect(audioCtx.destination);

        // dedicated vocal filter for the bloch sphere morphing effect
        vocalTextureFilter = audioCtx.createBiquadFilter();
        vocalTextureFilter.type = "peaking";
        vocalTextureFilter.frequency.setValueAtTime(1000, now);
        vocalTextureFilter.Q.setValueAtTime(1.0, now);
        vocalTextureFilter.gain.setValueAtTime(15, now); // 15dB boost to emphasize filter sweeps
        vocalTextureFilter.connect(masterGainNode);

        // position radius slider now controls the vibrato LFO speed and depth for a live wigglyness effect
        vibratoOsc = audioCtx.createOscillator();
        vibratoGain = audioCtx.createGain();
        vibratoOsc.frequency.setValueAtTime(0, now); 
        vibratoGain.gain.setValueAtTime(0, now);     
        vibratoOsc.connect(vibratoGain);

        // hook up vibrato to modulate the vocal filter frequency for an active wiggle effect
        vibratoGain.connect(vocalTextureFilter.frequency);

        // load files of miku's voice
        const bAh = await loadLocalSample('miku_ah.wav');
        const bOo = await loadLocalSample('miku_oo.wav');
        const bEe = await loadLocalSample('miku_ee.wav');
        const bOh = await loadLocalSample('miku_oh.wav');

        initVocalTrack('ah', bAh);
        initVocalTrack('oo', bOo);
        initVocalTrack('ee', bEe);
        initVocalTrack('oh', bOh);

        // synth array oscillators for the accompaniment layer
        initSynthOscillator('sine', 'sine');
        initSynthOscillator('triangle', 'triangle');
        initSynthOscillator('sawtooth', 'sawtooth');
        initSynthOscillator('square', 'square');

        Object.values(vocalPlayers).forEach(p => p.start(now));
        Object.values(synthOscillators).forEach(o => o.start(now));
        vibratoOsc.start(now);

        audioInitialized = true;

        // fully unlock all ranges inputs on the engine
        const allSliders = document.querySelectorAll('input[type="range"]');
        allSliders.forEach(slider => {
            slider.removeAttribute('disabled');
            slider.disabled = false;
        });

        startBtn.style.display = 'none';
        setupButtonListeners();
        updateEngineMatrix();

    } catch (err) {
        console.error("Audio block crash trace:", err);
        startBtn.innerText = "Engine Check Fail";
        alert("Make sure all four lowercase .wav files are uploaded directly alongside your code files!");
    }
});

function setupButtonListeners() {
    document.querySelectorAll('.vocal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.vocal-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeVowel = e.target.getAttribute('data-vowel');
            updateEngineMatrix();
        });
    });

    document.querySelectorAll('.wave-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeWave = e.target.getAttribute('data-wave');
            if (activeWave === 'saw') activeWave = 'sawtooth'; 
            updateEngineMatrix();
        });
    });
}

function updateEngineMatrix() {
    if (!audioInitialized) return;
    const now = audioCtx.currentTime;

    const theta = parseFloat(thetaSlider.value);
    const phi = parseFloat(phiSlider.value);
    const position = parseFloat(posSlider.value);

    // dynamic numerical labels tracking
    document.getElementById('theta-val').innerText = theta.toFixed(2);
    document.getElementById('phi-val').innerText = phi.toFixed(2);
    document.getElementById('position-val').innerText = position.toFixed(2);

    // 1-qubit bloch sphere trigonometric math transformations
    const alphaReal = Math.cos(theta / 2);
    const betaReal  = Math.cos(phi) * Math.sin(theta / 2);
    const betaImag  = Math.sin(phi) * Math.sin(theta / 2);

    const p0 = Math.pow(alphaReal, 2);
    const p1 = Math.pow(betaReal, 2) + Math.pow(betaImag, 2);

    // theta controls the filter cutoff spectrum cleanly between 300Hz and 4500Hz
    const targetCutoff = 300 + (p0 * 4200);
    vocalTextureFilter.frequency.setValueAtTime(targetCutoff, now);

    // phi maps the phase angle parameter directly to scale filter resonance sharpness (Q) from 1 to 18
    const targetResonance = 1 + ((phi / 6.2831) * 17);
    vocalTextureFilter.Q.setValueAtTime(targetResonance, now);

    // evaluate vocal gain node settings based on active user button state selection choice
    Object.keys(vocalGains).forEach(vKey => {
        const targetVol = (vKey === activeVowel) ? 0.65 : 0.0;
        vocalGains[vKey].gain.setValueAtTime(targetVol, now);
    });

    // reset all oscillator density gain parameters to zero
    Object.keys(synthGains).forEach(sKey => synthGains[sKey].gain.setValueAtTime(0, now));

    // map synth array volume states to the active wave selection button
    let finalTargetKey = activeWave;
    if (finalTargetKey === 'saw') finalTargetKey = 'sawtooth';
    if (synthGains[finalTargetKey]) {
        synthGains[finalTargetKey].gain.setValueAtTime(0.25, now); // static baseline mix for the synth accompaniment
    }

    // position slider now controls the vibrato LFO speed and depth for a live wigglyness effect
    const computedWiggleSpeed = position * 10; // max out vibrato speed at 10Hz
    const computedWiggleDepth = position * 60; // max pitch filter sweep depth at 60Hz
    
    vibratoOsc.frequency.setValueAtTime(computedWiggleSpeed, now);
    vibratoGain.gain.setValueAtTime(computedWiggleDepth, now);

    // diagnostics text tracking output layout
    document.getElementById('state-vector').innerHTML = 
        `<div class="wave-line wave-sine"><span>Active Vocal Layer [ ${activeVowel.toUpperCase()} ]:</span> <span>Processing FX</span></div>` +
        `<div class="wave-line wave-saw"><span>Active Synth Layer [ ${finalTargetKey.toUpperCase()} ]:</span> <span>Running</span></div>` +
        `<div style="margin: 10px 0; border-top: 1px dashed #17262c;"></div>` +
        `<div style="font-size: 11px; color: #39c5bb; font-weight: bold;">Bloch Sphere Vocal Modulation:</div>` +
        `<div class="wave-line wave-sine"><span> Formant Cutoff Spectrum Target:</span> <span>${Math.round(targetCutoff)} Hz</span></div>` +
        `<div class="wave-line wave-tri"><span> Resonance Sharpness Index (Q):</span> <span>${targetResonance.toFixed(1)}</span></div>` +
        `<div style="margin-top: 8px; font-size: 10px; color: #5a717c;">Quantum Coordinates Mapping Status -> |0⟩: ${(p0*100).toFixed(0)}% | |1⟩: ${(p1*100).toFixed(0)}%</div>`;
}

// bind ranges parameters controls mapping variables updates
[thetaSlider, phiSlider, posSlider].forEach(slider => {
    slider.addEventListener('input', updateEngineMatrix);
});



