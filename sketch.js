/* PLAY WITH THESE VALUES IF YOU WANT */

//determines the SIZE of the canvas 
//       x ,  y
const SIZE = [500, 500];

const NUM = 2000;          //number of objects which will be generated, be carefull here
const LEN = 4;             //size of each object
const MOVING_SPEED = 1.5;  //moving speed


const HEAL_RANGE = 15;   //range of HEAL-time
const HEAL_OFFSET = 1.5; //start of the range of HEAL time

const INIT_INFECTED = 1;       //amount of initial inected objects
const REINFECTION_POT = .05;   //probability of getting reINFECTED when HEALthy

const DEATH_POT = .5;       //probability of an objects death
const SKIP_DEATH_POLL = 5;  //this does determine how many frames will be skipped until
                            //the next death of an obeject will be determined
/* UNTIL HERE */


/********* DO NOT TOUCH THESE VARIABLES *********/
INIT_INFECT_TIME = false;

FT = 0;
SECONDS = 0;

const SPAWN_OFFSET = 20;

const TIME_START = new Date();
TIME_CURR = 0;

XS = [];
SAVE_UNINF = [];
SAVE_INF = [];
SAVE_HEALTH = [];
SAVE_DEAD = [];

POSX = [];
POSY = [];

VELX = [];
VELY = [];

COLORS = [];
INFECTED = [];
HEAL = [];

FC = 0;

COUNT_UNINF = 0;
COUNT_INF = 0;
COUNT_HEALTHY = 0;
COUNT_DEAD = 0;
/********* UNTIL HERE *********/




function setup() {

  //creates the canvas
  createCanvas(SIZE[0], SIZE[1]);

  //iterates over all objects just to initalize everything
  for (let i = 0; i < NUM; i++) {
    //random direction will be chosen for x- and y-direction
    let dirx = Math.random() >= .5 ? 1 : -1;
    let diry = Math.random() >= .5 ? 1 : -1;
    //starting position of the objects
    POSX[i] = SPAWN_OFFSET + Math.floor((SIZE[0] - 2 * SPAWN_OFFSET) * random());
    POSY[i] = SPAWN_OFFSET + Math.floor((SIZE[1] - 2 * SPAWN_OFFSET) * random());
    //random velocity for the objects
    VELX[i] = dirx * random() * MOVING_SPEED;
    VELY[i] = diry * random() * MOVING_SPEED;
    //determines which time every object need to HEAL
    HEAL[i] = HEAL_OFFSET + Math.round(random(1, HEAL_RANGE));
    //initializing every object as unINFECTED
    COLORS[i] = 0;
    INFECTED[i] = 0;
  }

  //infects initial objects with the number given by INIT_INFECTED
  for (let i = 0; i < INIT_INFECTED; i++) {
    COLORS[i] = 1;
  }

  //sets up neccessary numbers for correct counting
  COUNT_INF = INIT_INFECTED;
  COUNT_UNINF = NUM - COUNT_INF;

  //setting up the first frame time
  TIME_CURR = TIME_START;

}


function draw() {

  //some vars which will be updated every frame
  FC = frameCount;
  FT = new Date() - TIME_CURR; //updates every frame the FT-counter
  TIME_CURR = new Date();
  SECONDS = (new Date() - TIME_START) / 1000;

  //flips the flag if there were more than 200 frames drawn
  if (FC > 100) INIT_INFECT_TIME = true;

  //resets the background and drawing COLORS
  background(0);

  //iterates over every object
  for (let i = 0; i < NUM; i++) {

    //updating the position so the objects are moving
    POSX[i] = POSX[i] + VELX[i];
    POSY[i] = POSY[i] + VELY[i];

    //coloring the objects according to the states of the objects
    if (COLORS[i] == 0) {         //init state
      fill(255);//white
    } else if (COLORS[i] == 1) {  //INFECTED or init_INFECTED state
      fill(255, 0, 0);//red
    } else if (COLORS[i] == 2) {  //HEALthy state
      fill(0, 0, 255);//blue
    } else if (COLORS[i] == 3) {  //dead state
      fill(255, 0, 255);//pink
    }

    //draws the object on POSX and POSY with length of each side of LEN
    square(POSX[i], POSY[i], LEN);

    //checks if the objects are inside of canvas
    borderCheck(i);

    //iterates over all object beginning with the i+1-index
    for (let j = i + 1; j < NUM; j++) {

      //if they touch
      if (touch(i, j)) {

        //handles the interaction with dead objects and not-dead objects
        if (COLORS[i] == 3 || COLORS[j] == 3) continue;

        //then swap their velocities
        swapVel(i, j);

        //if they are objects in the same state no actions needed because
        //nothing should happen
        //its a small optimization which should not have that big impact
        if (COLORS[i] == 1 && COLORS[j] == 1) continue;
        if (COLORS[i] == 2 && COLORS[j] == 2) continue;

        //this makes reinfaction of HEALthy object possible
        //by generating a random number and checking if that number
        //is smaller than REINFECTION_POTential
        if (COLORS[i] == 2 && COLORS[j] == 1) {
          let tmp = random();
          if (tmp < REINFECTION_POT) {
            COLORS[i] = 1;
            INFECTED[i] = SECONDS;
            COUNT_HEALTHY--;  //decreace healthy count
            COUNT_INF++;      //increace infected count
            
          }
        }
        //same as directly above but reversed rolles
        //should not be necessary
        if (COLORS[j] == 2 && COLORS[i] == 1) {
          let tmp = random();
          if (tmp < REINFECTION_POT) {
            COLORS[j] = 1;
            INFECTED[j] = SECONDS;
            COUNT_HEALTHY--;  //decreace healthy count
            COUNT_INF++;      //increace infected count
            
          }
        }

        //infects the unINFECTED object when an unINFECTED and
        //a INFECTED object are hitting each other
        if (COLORS[i] == 1 && COLORS[j] == 0) {
          COLORS[j] = 1;
          INFECTED[j] = SECONDS;
          COUNT_UNINF--;
          COUNT_INF++;
          
        }
        //same as directly above but reversed rolles
        //should not be necessary
        if (COLORS[j] == 1 && COLORS[i] == 0) {
          COLORS[i] = 1;
          INFECTED[i] = SECONDS;
          COUNT_UNINF--;
          COUNT_INF++;
        }

      }
    }

    //HEALs up INFECTED objects only if the time which needs
    //to HEAL elapsed
    //and if HEALing is possible due to the 'INIT_INFECT_TIME'-flag
    if (INIT_INFECT_TIME && COLORS[i] == 1 && (SECONDS - INFECTED[i] >= HEAL[i])) {
      COLORS[i] = 2;
      COUNT_INF--;
      COUNT_HEALTHY++;
    }

  }

  //the idea is that every INFECTED object can die
  //so a random number from all will be selected and if it is
  //INFECTED, this object dies
  if (FC % SKIP_DEATH_POLL == 0) {
    let tmp = Math.round(random(1, NUM));
    if (COLORS[tmp] == 1 && random() < DEATH_POT) {
      COLORS[tmp] = 3;
      VELX[tmp] = 0;
      VELY[tmp] = 0;
      COUNT_INF--;
      COUNT_DEAD++;
    }
  }

  //status output for basic render observation
  fill(0, 255, 0);
  stroke(0);
  text("Frametime: " + FT, 10, height - 10);
  text("Framecount: " + FC, 10, height - 25);
  text("Seconds: " + SECONDS, 10, height - 40);

  //renders the information of the conditions
  fill(255);
  stroke(0);
  text("uninfected: " + COUNT_UNINF, width - 100, height - 10);
  text("infected: " + COUNT_INF, width - 100, height - 25);
  text("healthy: " + COUNT_HEALTHY, width - 100, height - 40);
  text("dead: " + COUNT_DEAD, width - 100, height - 55);

  //pushes the values into an array
  XS.push(SECONDS);
  SAVE_UNINF.push(COUNT_UNINF);
  SAVE_INF.push(COUNT_INF);
  SAVE_HEALTH.push(COUNT_HEALTHY);
  SAVE_DEAD.push(COUNT_DEAD);


  //ends the simulation if there are more than 15.000 frames drawn or
  //the counter for the INFECTED objects are equals to 0
  if (FC >= 15000 || COUNT_INF == 0) {
    //stops the looping
    noLoop();
    //formats the json file
    let saveOut = { TIME: XS, UNINF: SAVE_UNINF, INF: SAVE_INF, HEALTHY: SAVE_HEALTH, DEAD: SAVE_DEAD };
    //saving into a json-file
    let saveName = new Date();
    saveJSON(saveOut, 'simulation_export_' + saveName.getFullYear() + '_' + (saveName.getMonth() + 1) + '_' + saveName.getDate() + '.json', true);
  }

}

/**
 * checks if the object is out of bounce
 * @param {*} i index of the object which should be checked
 */
function borderCheck(i) {
  if (POSX[i] + LEN > SIZE[0] || POSX[i] < 0) {
    VELX[i] = -1 * VELX[i];
    return;
  } else if (POSY[i] + LEN > SIZE[1] || POSY[i] < 0) {
    VELY[i] = -1 * VELY[i];
  }
}

/**
 * inverts the direction of the velocity of a object
 * @param {*} i indec of the object
 */
function invertVel(i) {
  VELX[i] = -1 * VELX[i];
  VELY[i] = -1 * VELY[i];
}

/**
 * for exchanging the velocities of two objects
 * interacting/hitting each other
 * @param {*} i index of one of the object
 * @param {*} j index of the other object
 */
function swapVel(i, j) {
  tmp = VELX[i];
  VELX[i] = VELX[j];
  VELX[j] = tmp;

  tmp = VELY[i];
  VELY[i] = VELY[j];
  VELY[j] = tmp;
}


/******* handles the collision detection of the objects *******/
function touch(i, j) {
  return !(isLeftOf(i, j)
    || isRightOf(i, j)
    || isAbove(i, j)
    || isUnderneath(i, j));
}

function isAbove(i, j) {
  return (POSY[i] + LEN) < POSY[j];
}

function isUnderneath(i, j) {
  return isAbove(j, i);
}

function isLeftOf(i, j) {
  return (POSX[i] + LEN) < POSX[j];
}

function isRightOf(i, j) {
  return isLeftOf(j, i);
}