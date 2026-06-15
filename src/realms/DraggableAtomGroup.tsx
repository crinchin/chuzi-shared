import { useCallback, useRef, type ReactNode } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

const DRAG_THRESHOLD_PX = 5;

export interface DraggableAtomGroupProps {
  position: [number, number, number];
  /** When false, pointer events pass through without drag. */
  enabled?: boolean;
  /** Plane normal for drag raycast (default: horizontal XZ). */
  dragPlaneNormal?: [number, number, number];
  onPositionChange?: (position: [number, number, number]) => void;
  /** Fired once when pointer movement crosses the drag threshold. */
  onDragStart?: () => void;
  onDragEnd?: (position: [number, number, number]) => void;
  /** Fired on pointer up when the gesture was a tap, not a drag. */
  onTap?: () => void;
  children: ReactNode;
}

/**
 * Wraps a realm atom (star, tree branch, etc.) so creators can reposition it
 * in 3D space by pressing and dragging. Drag activates after a small pointer
 * threshold so clicks still register as selection.
 */
export function DraggableAtomGroup({
  position,
  enabled = false,
  dragPlaneNormal = [0, 1, 0],
  onPositionChange,
  onDragStart,
  onDragEnd,
  onTap,
  children,
}: DraggableAtomGroupProps) {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const dragStarted = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const grabOffset = useRef(new THREE.Vector3());
  const plane = useRef(new THREE.Plane());
  const raycaster = useRef(new THREE.Raycaster());
  const intersection = useRef(new THREE.Vector3());
  const latestPosition = useRef(position);
  latestPosition.current = position;

  const updatePlane = useCallback(() => {
    const normal = new THREE.Vector3(...dragPlaneNormal).normalize();
    plane.current.setFromNormalAndCoplanarPoint(
      normal,
      new THREE.Vector3(...latestPosition.current),
    );
  }, [dragPlaneNormal]);

  const pointerToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.current.setFromCamera(ndc, camera);
      if (
        raycaster.current.ray.intersectPlane(plane.current, intersection.current)
      ) {
        return intersection.current.clone();
      }
      return null;
    },
    [camera, gl],
  );

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled) return;
      e.stopPropagation();
      dragging.current = true;
      dragStarted.current = false;
      pointerStart.current = { x: e.clientX, y: e.clientY };
      updatePlane();
      const hit = pointerToWorld(e.clientX, e.clientY);
      if (hit) {
        grabOffset.current.set(
          latestPosition.current[0] - hit.x,
          latestPosition.current[1] - hit.y,
          latestPosition.current[2] - hit.z,
        );
      }
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    [enabled, pointerToWorld, updatePlane],
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current || !enabled) return;
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;
      if (!dragStarted.current && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      if (!dragStarted.current) {
        dragStarted.current = true;
        onDragStart?.();
      }
      e.stopPropagation();
      const hit = pointerToWorld(e.clientX, e.clientY);
      if (!hit) return;
      const next: [number, number, number] = [
        hit.x + grabOffset.current.x,
        hit.y + grabOffset.current.y,
        hit.z + grabOffset.current.z,
      ];
      onPositionChange?.(next);
    },
    [enabled, onDragStart, onPositionChange, pointerToWorld],
  );

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current) return;
      dragging.current = false;
      (e.target as Element).releasePointerCapture(e.pointerId);
      if (dragStarted.current) {
        e.stopPropagation();
        onDragEnd?.(latestPosition.current);
      } else {
        onTap?.();
      }
      dragStarted.current = false;
    },
    [onDragEnd, onTap],
  );

  return (
    <group position={position}>
      {enabled ? (
        <mesh
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <sphereGeometry args={[0.85, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ) : null}
      {children}
    </group>
  );
}
