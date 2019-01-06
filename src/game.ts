const camera = Camera.instance

enum Goal {
  Idle,
  Sit,
  Follow,
  GoDrink,
  Drinking
}

////////////////////////
// Custom components

@Component('behavior')
export class Behavior {
  goal: Goal = Goal.Idle
  previousGoal: Goal = Goal.Idle
  timer: number = 1
}

@Component('walkTarget')
export class WalkTarget {
  target: Vector3 = Vector3.Zero()
  previousPos: Vector3 = Vector3.Zero()
  fraction: number = 0
}

///////////////////////////
// Entity groups

const dogs = engine.getComponentGroup(Transform, Behavior, WalkTarget)

///////////////////////////
// Systems

export class SwitchGoals implements ISystem {
  update(dt: number) {
    for (let dog of dogs.entities) {
      let behavior = dog.get(Behavior)
      let walk = dog.get(WalkTarget)
      let transform = dog.get(Transform)
      behavior.timer -= dt
      if (behavior.timer < 0) {
        behavior.timer = 2
        switch (behavior.goal) {
          case Goal.Idle:
            considerGoals([
              { goal: Goal.Sit, odds: 0.1 },
              { goal: Goal.Follow, odds: 0.9 }
            ])
            break
          case Goal.Drinking:
            considerGoals([{ goal: Goal.Sit, odds: 0.3 }])
            break
          case Goal.Follow:
            considerGoals([{ goal: Goal.Idle, odds: 0.1 }])
            break
          case Goal.GoDrink:
            break
          case Goal.Sit:
            considerGoals([{ goal: Goal.Idle, odds: 0.1 }])
            break
        }
        if (behavior.goal == Goal.Follow) {
          walk.target = camera.position
          walk.previousPos = transform.position
          walk.fraction = 0
        }
      }
      if (
        behavior.goal == Goal.GoDrink &&
        Vector3.Distance(walk.target, transform.position) < 1
      ) {
        setDogGoal(Goal.Drinking)
        walk.fraction = 1
      }
      if (
        behavior.goal == Goal.Follow &&
        Vector3.Distance(walk.target, transform.position) < 2
      ) {
        setDogGoal(Goal.Sit)
        walk.fraction = 1
      }
      setAnimations(dog)
    }
  }
}

export class walk implements ISystem {
  update(dt: number) {
    for (let dog of dogs.entities) {
      let transform = dog.get(Transform)
      let walk = dog.get(WalkTarget)
      transform.lookAt(walk.target)
      if (walk.fraction < 1) {
        if (!isInBounds(walk.target)) return
        transform.position = Vector3.Lerp(
          walk.previousPos,
          walk.target,
          walk.fraction
        )
        walk.fraction += 1 / 90
      }
    }
  }
}

engine.addSystem(new SwitchGoals())
engine.addSystem(new walk())

////////////////////////
//OTHER FUNCTIONS

function isInBounds(position: Vector3): boolean {
  return (
    position.x > 0.5 && position.x < 9.5 && position.z > 0.5 && position.z < 9.5
  )
}

function setDogGoal(goal: Goal) {
  let behavior = dog.get(Behavior)
  behavior.previousGoal = behavior.goal
  behavior.goal = goal
  log('new goal: ' + goal)
}

function considerGoals(goals: { goal: Goal; odds: number }[]) {
  for (let i = 0; i < goals.length; i++) {
    if (Math.random() < goals[i].odds) {
      switch (goals[i].goal) {
        case Goal.Follow:
          if (!isInBounds(camera.position)) {
            continue
          }
      }
      setDogGoal(goals[i].goal)
      return
    }
  }
}

function setAnimations(dog: Entity) {
  let sit = dog.get(GLTFShape).getClip('Sitting')
  let stand = dog.get(GLTFShape).getClip('Standing')
  let walk = dog.get(GLTFShape).getClip('Walking')
  let drink = dog.get(GLTFShape).getClip('Drinking')
  let idle = dog.get(GLTFShape).getClip('Idle')

  sit.playing = false
  stand.playing = false
  walk.playing = false
  drink.playing = false
  idle.playing = false

  switch (dog.get(Behavior).goal) {
    case Goal.Sit:
      sit.playing = true
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
  if (dog.get(Behavior).previousGoal == Goal.Sit) {
    stand.playing = true
  }
}

///////////////////////////
// INITIAL ENTITIES

// Bowl
const bowl = new Entity()
bowl.set(new GLTFShape('models/BlockDogBowl.gltf'))
bowl.set(new Transform({
  position: new Vector3(9, 0, 1)
}))
bowl.set(
  new OnClick(e => {
    setDogGoal(Goal.GoDrink)
    dog.get(WalkTarget).target = bowl.get(Transform).position
    dog.get(WalkTarget).previousPos = dog.get(Transform).position
    dog.get(WalkTarget).fraction = 0
  })
)
engine.addEntity(bowl)

// Garden
const garden = new Entity()
garden.set(new GLTFShape('models/garden.gltf'))
garden.set(new Transform({
  position: new Vector3(5, 0, 5)
}))
engine.addEntity(garden)

// Dog
const dog = new Entity()
dog.set(new GLTFShape('models/BlockDog.gltf'))
dog.get(GLTFShape).addClip(new AnimationClip('Idle'))
dog.get(GLTFShape)
  .addClip(new AnimationClip('Sitting', { speed: 1, loop: false }))
dog.get(GLTFShape)
  .addClip(new AnimationClip('Standing', { speed: 1, loop: false }))
dog.get(GLTFShape).addClip(new AnimationClip('Walking'))
dog.get(GLTFShape).addClip(new AnimationClip('Drinking'))
dog.get(GLTFShape)
  .getClip('Idle')
  .play()

dog.set(new Transform({
  position: new Vector3(5, 0, 5)
}))
dog.set(new Behavior())
dog.set(new WalkTarget())
dog.set(
  new OnClick(e => {
    if (dog.get(Behavior).goal == Goal.Sit) {
      setDogGoal(Goal.Idle)
    } else {
      setDogGoal(Goal.Sit)
      dog.get(WalkTarget).fraction = 1
    }
  })
)
engine.addEntity(dog)

