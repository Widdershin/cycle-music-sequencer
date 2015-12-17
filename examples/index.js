import Tone from 'tone';
import {Observable} from 'rx';
import {run} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

const synth = new Tone.PolySynth(6, Tone.MonoSynth).toMaster();
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
      {note: 'A3', beats: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
      {note: 'G3', beats: [0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
      {note: 'F3', beats: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]},
      {note: 'E3', beats: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]},
      {note: 'D3', beats: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]},
      {note: 'C3', beats: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]}
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

    music$: state$.map(notesToPlay)
  };
}

function notesToPlay(state) {
  return state.score
    .filter(scoreRow => scoreRow.beats[state.beat] === 1)
    .map(scoreRow => scoreRow.note);
}

function incrementBeat(state) {
  return Object.assign(
    {},
    state,
    {beat: (state.beat + 1) % state.score[0].beats.length}
  );
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
