import Tone from 'tone';
import {Observable} from 'rx';
import {run} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

// const synth = new Tone.PolySynth(4, Tone.MonoSynth).toMaster();
const synth = new Tone.SimpleSynth().toMaster();
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function bpm (tempo) {
  return (1000 * 60) / tempo;
}

function note (i) {
  const octave = Math.floor(i / notes.length) + 1;
  const noteIndex = i % notes.length;

  return notes[noteIndex] + octave;
}

function main ({DOM}) {
  const initialState = {
    score: [
      {note: 'A4', beats: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
      {note: 'G4', beats: [0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
      {note: 'F4', beats: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]},
      {note: 'E4', beats: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]},
      {note: 'D4', beats: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]},
      {note: 'C4', beats: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]}
    ],
    playing: true,
    beat: 2
  }

  const state$ = Observable.just(initialState);

  return {
    DOM: state$.map(state =>
      h(".score", [
        renderBeatMarkerRow(state.beat),
        renderScoreGrid(state.score)
      ])
    ),

    // music$: state$.map(note)
  };
}

function renderScoreGrid(score) {
  return (
    h(".score-grid", score.map(renderScoreRow))
  )
}

function renderScoreRow({note, beats}) {
  return (
    h(".score-row", [
      beats.map(renderBeatCell),
      h('span.note-label', note)
    ])
  )
}

function renderBeatCell(cellEnabled) {
  return  (
    h("span.beat-cell", {style: {background: cellEnabled === 1 ? "pink" : ""}})
  )
}

function renderBeatMarkerRow(beatOffset) {
  return (
    h(".beat-marker-row", [
      h(".beat-marker", {style: {left: 42 * beatOffset + "px"}}, "V")
    ])
  )
}

run(main, {
  DOM: makeDOMDriver(".app"),
  music$: note$ => note$.forEach(note => synth.triggerAttackRelease(note, "4n"))
});