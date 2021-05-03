import { LerpData, LerpMove } from './modules/walk'
import {
  SwitchGoals,
  Behavior,
  Goal,
  setDogGoal,
  addAnimations,
  SWITCH_COOLDOWN,
} from './modules/switchGoals'

// camera object to get user position
export const camera = Camera.instance

// Add systems

engine.addSystem(new SwitchGoals())
engine.addSystem(new LerpMove())

///////////////////////////
// INITIAL ENTITIES

// Bowl
const bowl = new Entity()
bowl.addComponent(new GLTFShape('models/BlockDogBowl.gltf'))
bowl.addComponent(
  new Transform({
    position: new Vector3(9, 0, 1),
  })
)
bowl.addComponent(
  new OnPointerDown(
    (e) => {
      if (dog.getComponent(Behavior).goal == Goal.Sit) {
        // if sitting, stand up
        setDogGoal(dog, Goal.Idle)
      } else {
        // if standing, go drink
        setDogGoal(dog, Goal.GoDrink)
        dog.getComponent(LerpData).target = bowl.getComponent(
          Transform
        ).position
        dog.getComponent(LerpData).origin = dog.getComponent(Transform).position
        dog.getComponent(LerpData).fraction = 0
      }
      dog.getComponent(Behavior).timer = SWITCH_COOLDOWN
    },
    { button: ActionButton.POINTER, hoverText: 'Go Drink' }
  )
)
engine.addEntity(bowl)

// Garden
const garden = new Entity()
garden.addComponent(new GLTFShape('models/garden.glb'))
garden.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8),
    scale: new Vector3(1.6, 1.6, 1.6),
  })
)
engine.addEntity(garden)

// Dog
const dog = new Entity()
dog.addComponent(new GLTFShape('models/BlockDog.glb'))
dog.addComponent(new Animator())
let idleAnimation = new AnimationState('Idle_Armature_0')

dog.getComponent(Animator).addClip(idleAnimation)

dog.getComponent(Animator).getClip('Idle').play()

dog.addComponent(
  new Transform({
    position: new Vector3(5, 0, 5),
  })
)
dog.addComponent(new Behavior())
dog.addComponent(new LerpData())
dog.addComponent(
  new OnPointerDown(
    (e) => {
      if (dog.getComponent(Behavior).goal == Goal.Sit) {
        setDogGoal(dog, Goal.Idle)
      } else {
        setDogGoal(dog, Goal.Sit)
        dog.getComponent(LerpData).fraction = 1
      }
    },
    { button: ActionButton.POINTER, hoverText: 'Sit' }
  )
)
engine.addEntity(dog)

addAnimations(dog)
