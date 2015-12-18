import Tone from 'tone';
import {Observable} from 'rx';
import {run} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

const synth = new Tone.PolySynth(6, Tone.MonoSynth).toMaster();
synth.set("volume", -10);
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
    beat: 0
  };


  const play$ = DOM
    .select(".toggle-play")
    .events("click")
    .map(event => togglePlaying);

  const toggleCell$ = DOM
    .select(".beat-cell")
    .events("click")
    .map(event => toggleCell(event.target));

  const resetScore$ = DOM
    .select(".reset-score")
    .events("click")
    .map(event => resetScore);

  const beat$ = Observable.interval(bpm(120)).map(() => incrementBeat);
  const action$ = Observable.merge(
    beat$,
    play$,
    toggleCell$,
    resetScore$
  )
  const state$ = action$.scan((state, action) => action(state), initialState).startWith(initialState);

  return {
    DOM: state$.map(state =>
      h(".score", [
        h('.controls', [
          h("button.reset-score", "Reset"),
          h("button.toggle-play", state.playing ? "Pause" : "Play")
        ]),

        renderScoreGrid(state.score, state.beat)
      ])
    ),

    music$: state$.distinctUntilChanged(state => state.beat).map(notesToPlay)
  };
}

function toggleCell(target) {
  return function(state) {
    const row = parseInt(target.dataset.row, 10);
    const column = parseInt(target.dataset.column, 10);

    const newScore = state.score.slice();
    const newBeats = state.score[row].beats.slice()


    newBeats[column] = state.score[row].beats[column] === 1 ? 0 : 1;
    newScore[row] = {note: state.score[row].note, beats: newBeats}

    state.score = newScore;

    return state;
  }
}

function resetScore(state) {
  const newScore = state.score.map(({note, beats}) => ({note, beats: beats.map(beat => 0)}))

  return Object.assign(
    {},
    state,
    {score: newScore}
  );
}

function togglePlaying(state) {
   return Object.assign(
    {},
    state,
    {playing: !state.playing}
  );
}

function notesToPlay(state) {
  return state.score
    .filter(scoreRow => scoreRow.beats[state.beat] === 1)
    .map(scoreRow => scoreRow.note);
}

function incrementBeat(state) {
  if (!state.playing) {
    return state;
  }

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
      beats.map((beat, beatIndex) => renderBeatCell(beat, index, beatIndex, beatColumn === beatIndex)),
      h('.note-label', note)
    ])
  )
}

function renderBeatCell(cellEnabled, rowIndex, columnIndex, playing) {
  const enabled = cellEnabled === 1;

  const extraClass = [
    enabled ? '.active' : '.inactive',
    playing ? '.playing' : ''
  ].join('');

  return (
    h(".beat-cell" + extraClass, { dataset: { "row": rowIndex, "column": columnIndex }})
  )
}

run(main, {
  DOM: makeDOMDriver(".app"),
  music$: note$ => note$.forEach(note => synth.triggerAttackRelease(note, "4n"))
});
