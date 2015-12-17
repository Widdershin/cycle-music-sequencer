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
  };


  const action$ = Observable.interval(bpm(120)).map(() => incrementBeat);
  const state$ = action$.scan((state, action) => action(state), initialState).startWith(initialState);

  return {
    DOM: state$.map(state =>
      h(".score", [
        renderScoreGrid(state.score, state.beat)
      ])
    ),

    // music$: state$.map(note)
  };
}

function incrementBeat(state){
  if (state.beat === state.score[0].beats.length - 1) {
    state.beat = 0;
  } else {
    state.beat++;
  }
  console.log(state.beat);
  return state;
}

function renderScoreGrid(score, beatColumn) {
  return (
    h(".score-grid", score.map((score, index) => renderScoreRow(score, index, beatColumn)))
  )
}

function renderScoreRow({note, beats}, index, beatColumn) {
  return (
    h(".score-row", [
      beats.map((beat, beatIndex) => renderBeatCell(beat, index, beatColumn === beatIndex)),
      h('.note-label', note)
    ])
  )
}

function renderBeatCell(cellEnabled, rowIndex, playing) {
  const enabled = cellEnabled === 1;

  const extraClass = [
    enabled ? '.active' : '.inactive',
    playing ? '.playing' : ''
  ].join('');

  return (
    h(".beat-cell" + extraClass)
  )
}

run(main, {
  DOM: makeDOMDriver(".app"),
  music$: note$ => note$.forEach(note => synth.triggerAttackRelease(note, "4n"))
});
