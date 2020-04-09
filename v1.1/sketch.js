/* PLAY WITH THESE VALUES IF YOU WANT */

//determines the size of the canvas 
//       x ,  y
size = [500, 500];

NUM = 2000;  //number of objects which will generated, be carefull here
LEN = 4;     //size of each object
DAMPING = .8;//moving velocity

HEAL_RANGE = 15; //range of heal-time
HEAL_OFFSET = 5; //start of the range of heal time

INIT_INFECTED = 1;  //amount of initial inected objects
REINFECTION_POT = .05; //probability of getting reinfected when healthy
/* UNTIL HERE */


/********* DO NOT TOUCH THESE VARIABLES *********/
INIT_INFECT_TIME = false;

FPS = 0;
SECONDS = 0;

SPAWN_OFFSET = 20;


XS = [];
SAVE_UNINF = [];
SAVE_INF = [];
SAVE_HEALTH = [];
SAVE_DEAD = [];


posx = [];
posy = [];

velx = [];
vely = [];

colors = [];
infected = [];
heal = [];

fc = 0;
/********* UNTIL HERE *********/




function setup() {

  //creates the canvas
  createCanvas(size[0], size[1]);

  //iterates over all objects just to initalize everything
  for (let i = 0; i < NUM; i++) {
    //random direction will be chosen for x- and y-direction
    let dirx = Math.random() >= .5 ? 1 : -1;
    let diry = Math.random() >= .5 ? 1 : -1;
    //starting position of the objects
    posx[i] = SPAWN_OFFSET + Math.floor((size[0] - 2 * SPAWN_OFFSET) * random());
    posy[i] = SPAWN_OFFSET + Math.floor((size[1] - 2 * SPAWN_OFFSET) * random());
    //random velocity for the objects
    velx[i] = dirx * random() * DAMPING;
    vely[i] = diry * random() * DAMPING;
    //determines which time every object need to heal
    heal[i] = HEAL_OFFSET + Math.round(random(1, HEAL_RANGE));
    //initializing every object as uninfected
    colors[i] = 0;
    infected[i] = 0;
  }

  //infects initial objects with the number given by INIT_INFECTED
  for (let i = 0; i < INIT_INFECTED; i++) {
    colors[i] = 1;
  }

}


function draw() {

  //some vars which will be updated every frame
  fc = frameCount;
  FPS = fc % 20 == 0 ? frameRate().toFixed(2) : FPS; //updates every 20 frames the FPS-counter
  SECONDS = (fc / FPS).toFixed(2);

  //flips the flag if there were more than 200 frames drawn
  if (fc > 200) INIT_INFECT_TIME = true;

  //resets the background and drawing colors
  background(0);
  fill(255);

  //iterates over every object
  for (let i = 0; i < NUM; i++) {

    //updating the position so the objects are moving
    posx[i] = posx[i] + velx[i];
    posy[i] = posy[i] + vely[i];

    //coloring the objects according to the states of the objects
    if (colors[i] == 0) { //init state
      fill(255);
    } else if (colors[i] == 1) {  //infected or init_infected state
      fill(255, 0, 0);
    } else if (colors[i] == 2) {  //healthy state
      fill(0, 0, 255);
    } else if (colors[i] == 3) {  //dead state
      fill(255, 0, 255);
    }

    //draws the object on posx and posy with length of each side of LEN
    square(posx[i], posy[i], LEN);

    //checks if the objects are inside of canvas
    borderCheck(i);

    //iterates over all object beginning with the i+1-index
    for (let j = i + 1; j < NUM; j++) {
      //if they touch
      if (touch(i, j)) {
        //then swap their velocities
        swapVel(i, j);

        //if they are objects in the same state no actions needed because
        //nothing should happen
        //its a small optimization which should not have that big impact
        if (colors[i] == 1 && colors[j] == 1) continue;
        if (colors[i] == 2 && colors[j] == 2) continue;
        if (colors[i] == 3 && colors[j] == 3) continue;

        //this makes reinfaction of healthy object possible
        //by generating a random number and checking if that number
        //is smaller than REINFECTION_POTential
        if (colors[i] == 2 && colors[j] == 1) {
          let tmp = random();
          if (tmp < REINFECTION_POT) {
            colors[i] = 1;
            infected[i] = SECONDS;
          }
        }
        //same as directly above but reversed rolles
        //should not be necessary
        if (colors[j] == 2 && colors[i] == 1) {
          let tmp = random();
          if (tmp < REINFECTION_POT) {
            colors[j] = 1;
            infected[j] = SECONDS;
          }
        }

        //infects the uninfected object when an uninfected and
        //a infected object are hitting each other
        if (colors[i] == 1 && colors[j] == 0) {
          colors[j] = 1;
          infected[j] = SECONDS;
        }
        //same as directly above but reversed rolles
        //should not be necessary
        if (colors[j] == 1 && colors[i] == 0) {
          colors[i] = 1;
          infected[i] = SECONDS;
        }

      }
    }

    //heals up infected objects only if the time which needs
    //to heal elapsed
    //and a the healing is possible due to the 'INIT_INFECT_TIME'-flag
    if (INIT_INFECT_TIME && colors[i] == 1 && (SECONDS - infected[i] >= heal[i])) {
      colors[i] = 2;
    }

  }

  //the idea is that every infected object can die
  //so a random number from all will be selected and if it is
  //infected, this object dies
  let tmp = Math.round(random(1, NUM));
  if (colors[tmp] == 1) {
    colors[tmp] = 3;
  }

  //status output for basic render observation
  fill(0, 255, 0);
  stroke(0);
  text("FPS: " + FPS, 10, height - 10);
  text("Framecount: " + fc, 10, height - 25);
  text("Seconds: " + SECONDS, 10, height - 40);

  //resetting the values every frame
  COUNT_UNINF = 0;
  COUNT_INF = 0;
  COUNT_DEAD = 0;
  COUNT_HEALTHY = 0;

  //recounts the states of every object every frame
  //very slow but i'm lazy
  for (let i = 0; i < NUM; i++) {
    if (colors[i] == 0) COUNT_UNINF++;
    if (colors[i] == 1) COUNT_INF++;
    if (colors[i] == 2) COUNT_HEALTHY++;
    if (colors[i] == 3) COUNT_DEAD++;
  }

  //renders the information of the conditions
  fill(255);
  stroke(0);
  text("uninfected: " + COUNT_UNINF, width - 100, height - 10);
  text("infected: " + COUNT_INF, width - 100, height - 25);
  text("healthy: " + COUNT_HEALTHY, width - 100, height - 40);
  text("dead: " + COUNT_DEAD, width - 100, height - 55);

  //pushes the values into an array
  XS.push(fc);
  SAVE_UNINF.push(COUNT_UNINF);
  SAVE_INF.push(COUNT_INF);
  SAVE_HEALTH.push(COUNT_HEALTHY);
  SAVE_DEAD.push(COUNT_DEAD);


  //ends the simulation if there are more than 15000 frames drawn or
  //the counter for the infected objects are equals to 0
  if (fc > 15000 || COUNT_INF == 0) {
    //stops the looping
    noLoop();
    //formats the json file
    let saveOut = { X: XS, UNINF: SAVE_UNINF, INF: SAVE_INF, HEALTHY: SAVE_HEALTH, DEAD: SAVE_DEAD };
    //saving into a json-file
    saveJSON(saveOut, 'test.json', true);
  }

}

/**
 * checks if the object is out of bounce
 * @param {*} i index of the object which should be checked
 */
function borderCheck(i) {
  if (posx[i] + LEN > size[0] || posx[i] < 0) {
    velx[i] = -1 * velx[i];
    return;
  } else if (posy[i] + LEN > size[1] || posy[i] < 0) {
    vely[i] = -1 * vely[i];
  }
}

/**
 * for exchanging the velocities of two objects
 * interacting/hitting each other
 * @param {*} i index of one of the object
 * @param {*} j index of the other object
 */
function swapVel(i, j) {
  tmp = velx[i];
  velx[i] = velx[j];
  velx[j] = tmp;

  tmp = vely[i];
  vely[i] = vely[j];
  vely[j] = tmp;
}

function touch(i, j) {
  return !(isLeftOf(i, j)
    || isRightOf(i, j)
    || isAbove(i, j)
    || isUnderneath(i, j));
}

function isAbove(i, j) {
  return (posy[i] + LEN) < posy[j];
}

function isUnderneath(i, j) {
  return isAbove(j, i);
}

function isLeftOf(i, j) {
  return (posx[i] + LEN) < posx[j];
}

function isRightOf(i, j) {
  return isLeftOf(j, i);
}