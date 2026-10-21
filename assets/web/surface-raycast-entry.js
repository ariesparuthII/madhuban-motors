import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';
export function speedUpSurfaceSampling(meshes) {
  for (const mesh of meshes) {
    if (!mesh.geometry.boundsTree) mesh.geometry.boundsTree = new MeshBVH(mesh.geometry, {indirect:true});
    mesh.raycast = acceleratedRaycast;
  }
}
