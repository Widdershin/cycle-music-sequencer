import Tone from 'tone';

const synth = new Tone.SimpleSynth().toMaster();

synth.triggerAttackRelease("C4", "8n");
