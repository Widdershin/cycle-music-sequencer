import Tone from 'tone';
import {Observable} from 'rxjs';

// const synth = new Tone.PolySynth(4, Tone.MonoSynth).toMaster();
const synth = new Tone.SimpleSynth().toMaster();
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let octave = 4;

Observable
  .interval((1000*60)/120)
  .take(notes.length)
  .subscribe(i => synth.triggerAttackRelease(notes[i] + octave, "4n"));

// synth.triggerAttackRelease("C4", "4n");

// synth.triggerAttackRelease(["C4", "E4"], "4n");

// synth.triggerAttackRelease("F4", "4n", "0:2");
