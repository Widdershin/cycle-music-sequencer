import Tone from 'tone';
import {Observable} from 'rxjs';

// const synth = new Tone.PolySynth(4, Tone.MonoSynth).toMaster();
const synth = new Tone.SimpleSynth().toMaster();
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

Observable
  .interval(bpm(120))
  .take(notes.length)
  .subscribe(i => synth.triggerAttackRelease(note(i + notes.length * 2), "4n"));

function bpm (tempo) {
  return (1000 * 60) / tempo;
}

function note (i) {
  // debugger
  const octave = Math.floor(i / notes.length) + 1;
  const noteIndex = i % notes.length;

  console.log(notes[noteIndex] + octave);
  return notes[noteIndex] + octave;
}

// synth.triggerAttackRelease("C4", "4n");

// synth.triggerAttackRelease(["C4", "E4"], "4n");

// synth.triggerAttackRelease("F4", "4n", "0:2");
