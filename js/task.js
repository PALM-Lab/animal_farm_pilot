/**
 *
 * task.js
 * William Xiang Quan Ngiam
 *
 * task script for animal-farm
 * examines 'chunking' in infants
 * briefly display 4 animals that are paired
 * then test memory for animals
 *
 * started coding: 4/7/24
 **/

// TASK SET-UP
var jsPsych = initJsPsych({ show_progress_bar: true });

// DATA PIPE SET-UP
const expID = "L6Eqwywb8XkR"
const fileID = `${jsPsych.randomization.randomID(10)}`

// DEFINE EXPERIMENT VARIABLES
let animals = [
  "stim/animal_0.png",
  "stim/animal_1.png",
  "stim/animal_2.png",
  "stim/animal_3.png",
  "stim/animal_4.png",
  "stim/animal_5.png",
  "stim/animal_6.png",
  "stim/animal_7.png"
]

/* set-up some trial variables */
var trial_animals = [] // will hold the animals in each trial
var test_location = [] // which item is tested

let background = ["stim/background_2.png"]
let n_animals = 8 // how many animals
let n_pairs = n_animals / 2 // how many pairs
let n_trials = 100 // *maximum* number of trials

let fixation_time = 500 // time of fixation
let stim_time = 1500 // stim presentation in msec
let retention_time = 500 // blank interval after stimulus in msec

let canvas_width = 1000 // sets canvas width
let canvas_height = 470 // sets canvas height
let canvas_offset_diff = 108 // change when adding response buttons below

let item_size = 100
let item_locs = [
  [canvas_width / 2 + item_size * -3.3, canvas_height / 2 - 25],
  [canvas_width / 2 + item_size * -2.3, canvas_height / 2 - 25],
  [canvas_width / 2 + item_size * 1.7, canvas_height / 2 - 25],
  [canvas_width / 2 + item_size * 2.7, canvas_height / 2 - 25]
]; // draws from the top-left

// RANDOMIZATION
let animal_pairs = createAnimalPairs() // create ordered list of animals

// DEFINE TRIALS

/* create timeline */
var timeline = [];

/* get subject ID */
var get_ID = {
  type: jsPsychSurveyText,
  preamble: '<h3>For the experimenter:</h3',
  questions: [
    { prompt: 'Participant ID:', name: 'subject_id', required: true },
    { prompt: 'Participant Name:', required: true }
  ],
  on_finish: function () {
    var this_id = jsPsych.data.get().last(1).values()[0].response.subject_id; // save a subject ID, and add to all trials
    jsPsych.data.addProperties({ subject: this_id });
  }
}

timeline.push(get_ID)

/* force fullscreen */
var enter_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true
}
timeline.push(enter_fullscreen);

/* preload images */
var preload = {
  type: jsPsychPreload,
  images: [animals, background, "stim/response_example.png", "stim/stim_example.png"],
  audio: ["sound/correct.mp3", "sound/incorrect.mp3"],
  message: "Loading...",
  max_load_time: 60000,
};
timeline.push(preload);

/* define welcome message trial */
var welcome = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <p>Welcome to the experiment!</p>
    <br>
  `,
  choices: [">>"]
};
timeline.push(welcome);

/* define instructions trial */
var instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <p>Instructions go here.</p>
    <p>Press the button below when you are ready.</p>
  `,
  choices: ["OK"],
  post_trial_gap: stim_time
};
timeline.push(instructions);

var instructions_2 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `<p>In this game, you will see animals sitting on the benches in the park.
  Each day, the animals may sit in different places.</p>
  <p>Try and remember where they were sitting!</p>
  
  <img src="stim/stim_example.png" width="800">,
  `,
  choices: ["Next"]
}
timeline.push(instructions_2);

var instructions_3 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `<p>The animals will head home. Can you remember which animal was sitting in the bright white box?</p>
  <p>Touch which animal you think it was. A bright tone means you got it right! A sad tone means you got it wrong.</p>
  
  <img src="stim/response_example.png" width="800">
  `,

  choices: ["Next"]
}
timeline.push(instructions_3);

var instructions_4 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p>Are you ready?</p><br>',
  choices: ["YES!"]
}
timeline.push(instructions_4);

/* define fixation and test trials */

var fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS",
  trial_duration: fixation_time,
  data: {
    task: 'fixation'
  }
};

/* show stimulus */
var stim = {
  type: jsPsychCanvasButtonResponse,
  stimulus: draw_stimulus,
  choices: ['x'],
  button_html: '<button class="jspsych-btn" style = "position:absolute; left:10px; top: 0px">%choice%</button>',
  trial_duration: stim_time,
  canvas_size: [canvas_height + canvas_offset_diff, canvas_width], // height x width
  on_finish: function (data) {
    if (jsPsych.pluginAPI.compareKeys(data.response, null)) {
      data.animals = trial_animals
    } else (
      jsPsych.endCurrentTimeline()
    )
  },
  data: {
    task: 'stim' // easy to filter out later
  }
}

function draw_stimulus(c) {
  var ctx = c.getContext("2d");
  trial_animals = jsPsych.randomization.sampleWithoutReplacement(animal_pairs, 2);

  var background = new Image();
  background.src = "stim/background_2.png";
  ctx.drawImage(background, x = 0, y = 0, width = canvas_width, height = canvas_height)

  for (var i = 0; i < 2; i++) {

    var img = new Image();
    img.src = trial_animals[i][0];
    ctx.drawImage(img, x = item_locs[2 * i][0], y = item_locs[2 * i][1], width = item_size, height = item_size)

    var img = new Image();
    img.src = trial_animals[i][1];
    ctx.drawImage(img, x = item_locs[2 * i + 1][0], y = item_locs[2 * i + 1][1], width = item_size, height = item_size)

  }
}

/* show filler */
var filler = {
  type: jsPsychCanvasButtonResponse,
  stimulus: draw_filler,
  choices: ['x'],
  button_html: '<button class="jspsych-btn" style = "position:absolute; left:0px; top: 0px">%choice%</button>',
  trial_duration: retention_time,
  canvas_size: [canvas_height + canvas_offset_diff, canvas_width], // height x width
  on_finish: function (data) {
    if (jsPsych.pluginAPI.compareKeys(data.response, null)) {
      data.animals = trial_animals
    } else (
      jsPsych.endCurrentTimeline()
    )
  },
  data: {
    task: 'stim' // easy to filter out later
  }
}

function draw_filler(c) {
  var ctx = c.getContext("2d");

  var background = new Image();
  background.src = "stim/background_2.png";
  ctx.drawImage(background, x = 0, y = 0, width = canvas_width, height = canvas_height)

}

var trial = {
  type: jsPsychCanvasButtonResponse,
  stimulus: draw_test_rect,
  prompt: "Which animal was there?",
  button_html: '<img src=%choice% width="100" height="100"></img>',
  choices: animals,
  canvas_size: [canvas_height, canvas_width],
  margin_horizontal: "10px",
  on_start: function (data) {
    var trial_animals = []
    trial_animals = jsPsych.data.getLastTrialData().values()[0].animals
    data.trial_animals = trial_animals
  },
  on_finish: function (data) {
    data.test_position = Number(test_location)
    data.correct_animal = Number(trial_animals[Math.floor(test_location / 2)][test_location % 2].replace(/^\D+|\D+$/g, ''))
    data.correct = data.response == data.correct_animal;
    if (data.correct) {
      var feedback = ["sound/correct.mp3"]
    } else {
      var feedback = ["sound/incorrect.mp3"]
    };
    var audio_context = jsPsych.pluginAPI.audioContext();
    var audio;
    // load audio file
    jsPsych.pluginAPI.getAudioBuffer(feedback)
      .then(function (buffer) {
        if (audio_context !== null) {
          audio = audio_context.createBufferSource();
          audio.buffer = buffer;
          audio.connect(audio_context.destination)
        } else {
          audio = buffer;
          audio.currentTime = 0;
        };
        // start audio
        if (audio_context !== null) {
          startTime = audio_context.currentTime;
          audio.start(startTime);
        } else {
          audio.play();
        };
      })
  },
  data: {
    task: 'response'
  }
};

/* show test */
function draw_test_rect(c) {
  var ctx = c.getContext("2d");
  test_location = jsPsych.randomization.sampleWithoutReplacement([0, 1, 2, 3], 1);

  var background = new Image();
  background.src = "stim/background_2.png";
  ctx.drawImage(background, x = 0, y = 0, width = canvas_width, height = canvas_height)

  for (var i = 0; i < 2; i++) {
    ctx.strokeStyle = "white";
    ctx.strokeRect(x = item_locs[2 * i][0], y = item_locs[2 * i][1], item_size, item_size);
    ctx.strokeRect(x = item_locs[2 * i + 1][0], y = item_locs[2 * i + 1][1], item_size, item_size);
  }
  ctx.lineWidth = 5; // thick test location
  ctx.strokeRect(x = item_locs[test_location][0], y = item_locs[test_location][1], item_size, item_size);
}

/* define trial procedure */
var trial_procedure = {
  timeline: [fixation, stim, filler, trial],
  repetitions: n_trials,
  randomize_order: true
};
timeline.push(trial_procedure);

/* define awareness test */
var awareness_test = {
  timeline: [{
    type: jsPsychCanvasButtonResponse,
    stimulus: function draw_friend_test(c) {
      var ctx = c.getContext("2d");
      which_friend = jsPsych.randomization.sampleWithoutReplacement([0, 1], 1);
      this_trial = jsPsych.timelineVariable('which_pair');

      var img = new Image();
      img.src = animal_pairs[jsPsych.timelineVariable('which_pair')][which_friend];
      ctx.drawImage(img, x = 0, y = 0, width = item_size, height = item_size)
    }
  }],
  prompt: "Which animal was their friend?",
  button_html: '<img src=%choice% width="100" height="100"></img>',
  choices: animals,
  canvas_size: [item_size, item_size],
  on_finish: function (data) {
    data.which_pair = animal_pairs[this_trial],
      data.tested_item = which_friend,
      data.tested_animal = animal_pairs[this_trial][which_friend]
  },
  data: {
    task: 'awareness'
  },
  timeline_variables: [
    { which_pair: 0 },
    { which_pair: 1 },
    { which_pair: 2 },
    { which_pair: 3 }
  ]
}
/* friend test */
timeline.push(awareness_test)

/* upload data */

var save_data = {
	type: jsPsychPipe,
	action: "save",
	experiment_id: expID,
	filename: fileID + `.csv`,
	wait_message: "<p>Saving data. Please do not close this page.</p>",
	data_string: ()=>jsPsych.data.get().csv()
};

timeline.push(save_data)

/* end of experiment */
var end_experiment = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p>This is the end of the experiment. Thank you for participating!</p>',
  choices: ["FINISH"]
}

var close_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false
}

timeline.push(close_fullscreen)
timeline.push(end_experiment)

/* start the experiment */
jsPsych.run(timeline);


// FUNCTIONS
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function createAnimalPairs() {
  var animal_list = shuffleArray(Array.from(animals));
  var pair_list = [];
  for (var i = 0; i < n_pairs; i++) {
    var pair = [animal_list[2 * i], animal_list[2 * i + 1]];
    pair_list.push(pair);
  };
  return pair_list;
}