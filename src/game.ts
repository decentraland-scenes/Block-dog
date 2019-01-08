import { LerpData, LerpMove } from "./modules/walk";
import { SwitchGoals, Behavior, Goal, setDogGoal } from "./modules/switchGoals";


// camera object to get user position
export const camera = Camera.instance

// Add systems

engine.addSystem(new SwitchGoals())
engine.addSystem(new LerpMove())

////////////////////////
//OTHER FUNCTIONS




export function setAnimations(dog: Entity) {
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
bowl.add(new GLTFShape('models/BlockDogBowl.gltf'))
bowl.add(new Transform({
  position: new Vector3(9, 0, 1)
}))
bowl.add(
  new OnClick(e => {
    setDogGoal(dog, Goal.GoDrink)
    dog.get(LerpData).target = bowl.get(Transform).position
    dog.get(LerpData).origin = dog.get(Transform).position
    dog.get(LerpData).fraction = 0
  })
)
engine.addEntity(bowl)

// Garden
const garden = new Entity()
garden.add(new GLTFShape('models/garden.gltf'))
garden.add(new Transform({
  position: new Vector3(5, 0, 5)
}))
engine.addEntity(garden)

// Dog
const dog = new Entity()
dog.add(new GLTFShape('models/BlockDog.gltf'))
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

dog.add(new Transform({
  position: new Vector3(5, 0, 5)
}))
dog.add(new Behavior())
dog.add(new LerpData())
dog.add(
  new OnClick(e => {
    if (dog.get(Behavior).goal == Goal.Sit) {
      setDogGoal(dog, Goal.Idle)
    } else {
      setDogGoal(dog, Goal.Sit)
      dog.get(LerpData).fraction = 1
    }
  })
)
engine.addEntity(dog)

