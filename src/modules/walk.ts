import { dogs } from "./switchGoals";

// component to store lerp data
@Component('lerpData')
export class LerpData {
  target: Vector3 = Vector3.Zero()
  origin: Vector3 = Vector3.Zero()
  fraction: number = 0
}

// walk
export class LerpMove implements ISystem {
    update(dt: number) {
      for (let dog of dogs.entities) {
        let transform = dog.getComponent(Transform)
        let walk = dog.getComponent(LerpData)
        transform.lookAt(walk.target)
        if (walk.fraction < 1) {
          if (!isInBounds(walk.target)) return
          transform.position = Vector3.Lerp(
            walk.origin,
            walk.target,
            walk.fraction
          )
          walk.fraction += 1 / 90
        }
      }
    }
}

// check if the target is inside the scene's bounds
export function isInBounds(position: Vector3): boolean {
    return (
      position.x > 0.5 && position.x < 9.5 && position.z > 0.5 && position.z < 9.5
    )
}