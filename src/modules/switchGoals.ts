import { LerpData, isInBounds } from "./walk";

// camera object to get user position
export const camera = Camera.instance

// list of possible goals
export enum Goal {
    Idle,
    Sit,
    Follow,
    GoDrink,
    Drinking
  }

// store the current and last goal
@Component('behavior')
export class Behavior {
  goal: Goal = Goal.Idle
  previousGoal: Goal = Goal.Idle
  timer: number = 1
}

// component group listing all dogs
export const dogs = engine.getComponentGroup(Behavior)

// evaluate goals randomly
export class SwitchGoals implements ISystem {
    update(dt: number) {
      for (let dog of dogs.entities) {
        let behavior = dog.getComponent(Behavior)
        let walk = dog.getComponent(LerpData)
        let transform = dog.getComponent(Transform)
        behavior.timer -= dt
        if (behavior.timer < 0) {
          behavior.timer = 2
          switch (behavior.goal) {
            case Goal.Idle:
              considerGoals( dog, [
                { goal: Goal.Sit, odds: 0.1 },
                { goal: Goal.Follow, odds: 0.9 }
              ])
              break
            case Goal.Drinking:
              considerGoals(dog, [{ goal: Goal.Sit, odds: 0.3 }])
              break
            case Goal.Follow:
              considerGoals(dog, [{ goal: Goal.Idle, odds: 0.1 }])
              break
            case Goal.GoDrink:
              break
            case Goal.Sit:
              considerGoals(dog, [{ goal: Goal.Idle, odds: 0.1 }])
              break
          }
          if (behavior.goal == Goal.Follow) {
            walk.target = camera.position
            walk.origin = transform.position
            walk.fraction = 0
          }
        }
        if (
          behavior.goal == Goal.GoDrink &&
          Vector3.Distance(walk.target, transform.position) < 1
        ) {
          setDogGoal(dog, Goal.Drinking)
          walk.fraction = 1
        }
        if (
          behavior.goal == Goal.Follow &&
          Vector3.Distance(walk.target, transform.position) < 2
        ) {
          setDogGoal(dog, Goal.Sit)
          walk.fraction = 1
        }
        setAnimations(dog)
      }
    }
}

// choose randomly between goal options
export function considerGoals(dog: IEntity, goals: { goal: Goal; odds: number }[]) {
    for (let i = 0; i < goals.length; i++) {
      if (Math.random() < goals[i].odds) {
        switch (goals[i].goal) {
          case Goal.Follow:
            if (!isInBounds(camera.position)) {
              continue
            }
        }
        setDogGoal(dog, goals[i].goal)
        return
      }
    }
}

// set the values in the Behavior component
export function setDogGoal(dog: IEntity, goal: Goal) {
    let behavior = dog.getComponent(Behavior)
    behavior.previousGoal = behavior.goal
    behavior.goal = goal
    log('new goal: ' + goal)
}

// set animations
export function setAnimations(dog: IEntity) {
    let sit = dog.getComponent(Animator).getClip('Sitting')
    let stand = dog.getComponent(Animator).getClip('Standing')
    let walk = dog.getComponent(Animator).getClip('Walking')
    let drink = dog.getComponent(Animator).getClip('Drinking')
    let idle = dog.getComponent(Animator).getClip('Idle')
  
    sit.playing = false
    stand.playing = false
    walk.playing = false
    drink.playing = false
	idle.playing = false
	stand.playing = false
  
    switch (dog.getComponent(Behavior).goal) {
      case Goal.Sit:
		sit.playing = true
		sit.looping = false
        break
      case Goal.Follow:
        walk.playing = true
      case Goal.GoDrink:
        walk.playing = true
        break
      case Goal.Drinking:
        drink.playing = true
        break
      case Goal.Idle:
        idle.playing = true
        break
    }
    // if (dog.getComponent(Behavior).previousGoal == Goal.Sit) {
	//   stand.playing = true
	//   stand.looping = false
    // }
  }