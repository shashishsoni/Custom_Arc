"""
CustomArc — print-ready mug generator (Blender bpy, headless).

Creates:
  - mug_body / mug_handle  (ceramic look)
  - printable              (open cylinder; UV = single 0–1 island, aspect = wrap mm)

Template default: 210mm × 95mm (matches packages/db seed).
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

# ── template (must match blank seed) ─────────────────────────
WIDTH_MM = 210.0
HEIGHT_MM = 95.0
SAFE_MARGIN_MM = 3.0  # documented only; mesh uses full printable height

OUT = Path(sys.argv[sys.argv.index("--") + 1]) if "--" in sys.argv else Path("mug-print.glb")


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)


def mat(name: str, color: tuple[float, float, float, float]) -> bpy.types.Material:
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = 0.35
    return m


def assign_mat(obj: bpy.types.Object, material: bpy.types.Material) -> None:
    if obj.data.materials:
        obj.data.materials[0] = material
    else:
        obj.data.materials.append(material)


def cylinder_uv_unwrap(obj: bpy.types.Object) -> None:
    """Map open cylinder to a single rectangular UV island (u=angle, v=height)."""
    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    uv_layer = bm.loops.layers.uv.verify()

    # Object-space bounds for V
    zs = [v.co.z for v in bm.verts]
    z_min, z_max = min(zs), max(zs)
    z_span = max(z_max - z_min, 1e-8)

    for face in bm.faces:
        for loop in face.loops:
            co = loop.vert.co
            u = (math.atan2(co.x, co.y) + math.pi) / (2 * math.pi)  # 0..1 around
            v = (co.z - z_min) / z_span
            loop[uv_layer].uv = (u, v)

    bm.to_mesh(mesh)
    bm.free()
    mesh.update()


def make_printable(radius: float, height: float) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=radius,
        depth=height,
        end_fill_type="NOTHING",
        location=(0, 0, 0),
    )
    obj = bpy.context.active_object
    obj.name = "printable"
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    cylinder_uv_unwrap(obj)
    assign_mat(obj, mat("printable_mat", (0.95, 0.95, 0.95, 1)))
    return obj


def make_body(radius: float, height: float, bottom: float) -> bpy.types.Object:
    # Outer wall slightly inside printable so band sits on surface
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=radius * 0.98,
        depth=height,
        end_fill_type="NGON",
        location=(0, 0, 0),
    )
    body = bpy.context.active_object
    body.name = "mug_body"

    # Hollow: inset top face delete + solidify-ish via boolean inner cylinder
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=radius * 0.88,
        depth=height * 0.92,
        end_fill_type="NGON",
        location=(0, 0, height * 0.04),
    )
    inner = bpy.context.active_object
    inner.name = "mug_inner_cut"

    mod = body.modifiers.new("Hollow", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = inner
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_apply(modifier="Hollow")
    bpy.data.objects.remove(inner, do_unlink=True)

    # Bottom disk slightly thicker look
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=radius * 0.98,
        depth=bottom,
        end_fill_type="NGON",
        location=(0, 0, -height / 2 + bottom / 2),
    )
    base = bpy.context.active_object
    base.name = "mug_base"
    # Join base into body
    body.select_set(True)
    base.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()

    ceramic = mat("ceramic", (0.92, 0.92, 0.9, 1))
    assign_mat(body, ceramic)
    return body


def make_handle(radius: float, height: float) -> bpy.types.Object:
    # Torus on +X side
    major = radius * 0.55
    minor = radius * 0.12
    bpy.ops.mesh.primitive_torus_add(
        major_segments=48,
        minor_segments=16,
        major_radius=major,
        minor_radius=minor,
        location=(radius * 0.98 + major * 0.15, 0, 0),
        rotation=(math.radians(90), 0, 0),
    )
    handle = bpy.context.active_object
    handle.name = "mug_handle"
    assign_mat(handle, mat("ceramic_handle", (0.92, 0.92, 0.9, 1)))
    return handle


def export_glb(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Select all mug parts
    bpy.ops.object.select_all(action="DESELECT")
    for name in ("printable", "mug_body", "mug_handle"):
        obj = bpy.data.objects.get(name)
        if obj:
            obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_yup=True,
    )


def main() -> None:
    clear_scene()

    # Physical size from template: circumference = WIDTH_MM, band height = HEIGHT_MM
    radius = (WIDTH_MM / 1000.0) / (2.0 * math.pi)
    band_h = HEIGHT_MM / 1000.0
    body_h = band_h * 1.15  # a bit taller than print zone
    bottom = 0.004

    printable = make_printable(radius * 1.002, band_h)  # hair outside body
    body = make_body(radius, body_h, bottom)
    handle = make_handle(radius, body_h)

    # Center group on origin
    for obj in (printable, body, handle):
        obj.location.z += 0  # already centered on band

    export_glb(OUT)
    print(f"OK exported {OUT}")
    print(f"printable UV aspect target={WIDTH_MM / HEIGHT_MM:.4f} radius_m={radius:.5f}")


if __name__ == "__main__":
    main()
