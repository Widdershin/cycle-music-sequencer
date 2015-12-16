import Tone from 'tone';

const synth = new Tone.SimpleSynth().toMaster();

synth.triggerAttackRelease("C4", "8n");

synth.triggerAttackRelease("E4", "8n", "0:1");

synth.triggerAttackRelease("F4", "8n", "0:2");
