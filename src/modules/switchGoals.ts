import { LerpData, isInBounds } from './walk'

export const SWITCH_COOLDOWN = 5

// camera object to get user position
export const camera = Camera.instance

// list of possible goals
export enum Goal {
  Idle,
  Sit,
  Follow,
  GoDrink,
  Drinking,
}

// store the current and last goal
@Component('behavior')
export class Behavior {
  goal: Goal = Goal.Idle
  previousGoal: Goal = Goal.Idle
  timer: number = SWITCH_COOLDOWN
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
      if (behavior.timer <= 0) {
        behavior.timer = SWITCH_COOLDOWN
        switch (behavior.goal) {
          case Goal.Idle:
            considerGoals(dog, [
              { goal: Goal.Sit, odds: 0.1 },
              { goal: Goal.Follow, odds: 0.9 },
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
          let newTarget = camera.position.clone()
          newTarget.y = 0
          walk.target = newTarget
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
        behavior.timer = SWITCH_COOLDOWN
      }
      if (
        behavior.goal == Goal.Follow &&
        Vector3.Distance(walk.target, transform.position) < 2
      ) {
        setDogGoal(dog, Goal.Sit)
        walk.fraction = 1
        behavior.timer = SWITCH_COOLDOWN
      }
    }
  }
}

// choose randomly between goal options
export function considerGoals(
  dog: IEntity,
  goals: { goal: Goal; odds: number }[]
) {
  for (let i = 0; i < goals.length; i++) {
    if (Math.random() < goals[i].odds) {
      switch (goals[i].goal) {
        case Goal.Follow:
          if (!isInBounds(camera.position)) {
            continue
          }
          break
        case Goal.Drinking:
          if (dog.getComponent(Behavior).goal == Goal.Sit) {
            continue
          }
          break
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
  log('new goal:	 ' + goal)
  setAnimations(dog)
  behavior.timer = SWITCH_COOLDOWN
  if (goal == Goal.Sit) {
    dog.getComponent(OnPointerDown).hoverText = 'Stand'
  } else {
    dog.getComponent(OnPointerDown).hoverText = 'Sit'
  }
}

//add animations
let sit = new AnimationState('Sitting', { looping: false })
let stand = new AnimationState('Standing', { looping: false })
let walk = new AnimationState('Walking')
let drink = new AnimationState('Drinking')
let idle = new AnimationState('Idle')

export function addAnimations(dog: IEntity) {
  dog.getComponent(Animator).addClip(sit)
  dog.getComponent(Animator).addClip(stand)
  dog.getComponent(Animator).addClip(walk)
  dog.getComponent(Animator).addClip(drink)
  dog.getComponent(Animator).addClip(idle)
}

// set animation
export function setAnimations(dog: IEntity) {
  switch (dog.getComponent(Behavior).goal) {
    case Goal.Sit:
      sit.play()
      break
    case Goal.Follow:
      walk.play()
    case Goal.GoDrink:
      walk.play()
      break
    case Goal.Drinking:
      drink.play()
      break
    case Goal.Idle:
      idle.play()
      break
  }
  if (dog.getComponent(Behavior).previousGoal == Goal.Sit) {
    stand.play()
  }
}
