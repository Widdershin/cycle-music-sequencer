import Tone from 'tone';
import {Observable} from 'rx';
import {run} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

// const synth = new Tone.PolySynth(4, Tone.MonoSynth).toMaster();
const synth = new Tone.SimpleSynth().toMaster();
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const major_scale_pattern = [2, 2, 1, 2, 2, 2, 1];
const harmonic_minor_scale_pattern = [2, 1, 2, 2, 1, 3, 1];

// Observable
//   .interval(bpm(120))
//   .take(notes.length)
//   .subscribe(i => synth.triggerAttackRelease(note(i + notes.length * 2), "4n"));

function bpm (tempo) {
  return (1000 * 60) / tempo;
}

function note (i) {
  const octave = Math.floor(i / notes.length) + 1;
  const noteIndex = i % notes.length;

  console.log(notes[noteIndex] + octave);
  return notes[noteIndex] + octave;
}

function main ({DOM}) {
  const clickAdd = DOM.select(".add").events("click").map(event => 1);
  const clickSubtract = DOM.select(".subtract").events("click").map(event => -1);
  const change = Observable.merge(clickAdd, clickSubtract);
  const count = change.scan((total, change) => total + change).startWith(0);

  count.forEach(i => synth.triggerAttackRelease(note(i + notes.length * 2), "4n"));

  return {
    DOM: count.map(count =>
      h(".counter", [
        h("button.subtract", "-"),
        "Count: " + count,
        h("button.add", "+")
      ])
    )
  };
}

run(main, {
  DOM: makeDOMDriver(".app")
});