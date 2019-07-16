import { LerpData, LerpMove } from "./modules/walk";
import { SwitchGoals, Behavior, Goal, setDogGoal } from "./modules/switchGoals";


// camera object to get user position
export const camera = Camera.instance

// Add systems

engine.addSystem(new SwitchGoals())
engine.addSystem(new LerpMove())

////////////////////////
//OTHER FUNCTIONS




export function setAnimations(dog: IEntity) {
  let sit = dog.getComponent(Animator).getClip('Sitting_Armature_0')
  let stand = dog.getComponent(Animator).getClip('Standing_Armature_0')
  let walk = dog.getComponent(Animator).getClip('Walking_Armature_0')
  let drink = dog.getComponent(Animator).getClip('Drinking_Armature_0')
  let idle = dog.getComponent(Animator).getClip('Idle_Armature_0')

  sit.playing = false
  stand.playing = false
  walk.playing = false
  drink.playing = false
  idle.playing = false

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
  if (dog.getComponent(Behavior).previousGoal == Goal.Sit) {
	stand.playing = true
	sit.looping = false
  }
}

///////////////////////////
// INITIAL ENTITIES

// Bowl
const bowl = new Entity()
bowl.addComponent(new GLTFShape('models/BlockDogBowl.gltf'))
bowl.addComponent(new Transform({
  position: new Vector3(9, 0, 1)
}))
bowl.addComponent(
  new OnClick(e => {
    setDogGoal(dog, Goal.GoDrink)
    dog.getComponent(LerpData).target = bowl.getComponent(Transform).position
    dog.getComponent(LerpData).origin = dog.getComponent(Transform).position
    dog.getComponent(LerpData).fraction = 0
  })
)
engine.addEntity(bowl)

// Garden
const garden = new Entity()
garden.addComponent(new GLTFShape('models/garden.glb'))
garden.addComponent(new Transform({
  position: new Vector3(8, 0, 8),
  scale: new Vector3(1.6, 1.6, 1.6)
}))
engine.addEntity(garden)

// Dog
const dog = new Entity()
dog.addComponent(new GLTFShape('models/BlockDog.glb'))
dog.addComponent(new Animator())
let idleAnimation = new AnimationState('Idle_Armature_0')

dog.getComponent(Animator).addClip(idleAnimation)

dog.getComponent(Animator)
  .getClip('Idle')
  .play()

dog.addComponent(new Transform({
  position: new Vector3(5, 0, 5)
}))
dog.addComponent(new Behavior())
dog.addComponent(new LerpData())
dog.addComponent(
  new OnClick(e => {
    if (dog.getComponent(Behavior).goal == Goal.Sit) {
	  setDogGoal(dog, Goal.Idle)
    } else {
      setDogGoal(dog, Goal.Sit)
      dog.getComponent(LerpData).fraction = 1
    }
  })
)
engine.addEntity(dog)
