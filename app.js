// Audio Engine: Create 4 distinct oscillators mapped to the 4 quantum basis states
const sineOsc     = new Tone.Oscillator(220, "sine").start();
const triangleOsc = new Tone.Oscillator(220, "triangle").start();
const squareOsc   = new Tone.Oscillator(220, "square").start();
const sawtoothOsc = new Tone.Oscillator(220, "sawtooth").start();

// Gain nodes to independently control the volume mix of each waveform
const gain00 = new Tone.Gain(0).toDestination();
const gain01 = new Tone.Gain(0).toDestination();
const gain10 = new Tone.Gain(0).toDestination();
const gain11 = new Tone.Gain(0).toDestination();

// Connect oscillators to their designated volume gates
sineOsc.connect(gain00);
triangleOsc.connect(gain01);
squareOsc.connect(gain10);
sawtoothOsc.connect(gain11);

// Add a global Phase-modulated Vibrato effect for spatial movement
const phaseVibrato = new Tone.LFO(0, 215, 225).start();
phaseVibrato.connect(sineOsc.frequency);
phaseVibrato.connect(triangleOsc.frequency);
phaseVibrato.connect(squareOsc.frequency);
phaseVibrato.connect(sawtoothOsc.frequency);

// UI DOM Elements
const startBtn = document.getElementById('start-audio');
const t1Slider = document.getElementById('theta1');
const t2Slider = document.getElementById('theta2');
const phiSlider = document.getElementById('phi');

startBtn.addEventListener('click', async () => {
    await Tone.start();
    startBtn.style.display = 'none';
    t1Slider.disabled = false;
    t2Slider.disabled = false;
    phiSlider.disabled = false;
    updateQuantumSynth();
});

function updateQuantumSynth() {
    const t1 = parseFloat(t1Slider.value);
    const t2 = parseFloat(t2Slider.value);
    const p  = parseFloat(phiSlider.value);

    // Update real-time label text
    document.getElementById('theta1-val').innerText = t1.toFixed(2);
    document.getElementById('theta2-val').innerText = t2.toFixed(2);
    document.getElementById('phi-val').innerText = p.toFixed(2);

    // Compute single-qubit probability amplitudes using basic Born Rules
    const a1 = Math.cos(t1 / 2); // Qubit 1 |0> amplitude
    const b1 = Math.sin(t1 / 2); // Qubit 1 |1> amplitude
    
    const a2 = Math.cos(t2 / 2); // Qubit 2 |0> amplitude
    
    // Inject Phase (phi) into the second qubit's |1> state component
    const b2Real = Math.cos(p) * Math.sin(t2 / 2);
    const b2Imag = Math.sin(p) * Math.sin(t2 / 2);

    // Calculate Tensor Product Probabilities for the 2-Qubit system
    const p00 = Math.pow(a1 * a2, 2); // Prob of |00> (Sine)
    const p01 = Math.pow(a1 * b2Real, 2) + Math.pow(a1 * b2Imag, 2); // Prob of |01> (Triangle)
    const p10 = Math.pow(b1 * a2, 2); // Prob of |10> (Square)
    const p11 = Math.pow(b1 * b2Real, 2) + Math.pow(b1 * b2Imag, 2); // Prob of |11> (Sawtooth)

    // Map Quantum Probabilities directly to Audio Gains (Volumes)
    // Using linear ramp for smooth audio parameter translation
    gain00.gain.linearRampToValueAtTime(p00, Tone.now() + 0.02);
    gain01.gain.linearRampToValueAtTime(p01, Tone.now() + 0.02);
    gain10.gain.linearRampToValueAtTime(p10, Tone.now() + 0.02);
    gain11.gain.linearRampToValueAtTime(p11, Tone.now() + 0.02);

    // Modulate the LFO rate using the phase parameter
    phaseVibrato.frequency.value = (p / Math.PI) * 4;

    // Output live structural data back onto the UI dashboard container
    document.getElementById('state-vector').innerHTML = 
        `|00⟩ Sine Wave:      ${(p00 * 100).toFixed(1)}% volume<br>` +
        `|01⟩ Triangle Wave:  ${(p01 * 100).toFixed(1)}% volume<br>` +
        `|10⟩ Square Wave:    ${(p10 * 100).toFixed(1)}% volume<br>` +
        `|11⟩ Sawtooth Wave:  ${(p11 * 100).toFixed(1)}% volume<br>`;
}

// Bind active inputs
t1Slider.addEventListener('input', updateQuantumSynth);
t2Slider.addEventListener('input', updateQuantumSynth);
phiSlider.addEventListener('input', updateQuantumSynth);
