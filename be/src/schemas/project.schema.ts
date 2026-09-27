import { z } from "zod";

export const BoxDimensionsSchema = z.object({
  length: z.number().positive("Chiều dài (Length) phải lớn hơn 0"),
  width: z.number().positive("Chiều rộng (Width) phải lớn hơn 0"),
  height: z.number().positive("Chiều cao (Height) phải lớn hơn 0"),
  paperThickness: z.number().positive("Độ dày giấy (t) phải lớn hơn 0").default(0.35)
});

export const MaterialSpecSchema = z.object({
  type: z.enum(["kraft", "ivory", "duplex"]).default("kraft"),
  gsm: z.number().positive().default(300),
  caliper: z.number().positive().default(0.42),
  finish: z.enum(["matte", "glossy", "raw"]).default("matte")
});

export const CanvasElementSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "logo", "image", "pattern", "barcode"]),
  panelId: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  content: z.string(),
  style: z.record(z.any()).optional(),
  dpi: z.number().optional()
});

export const CanvasStateSchema = z.object({
  elements: z.array(CanvasElementSchema).default([])
}).passthrough();

export const CreateProjectSchema = z.object({
  userId: z.string().optional().default("demo-user-id"),
  templateId: z.string().min(1, "Template ID không được để trống").default("tuck-top"),
  title: z.string().min(1, "Tiêu đề dự án không được để trống").max(200).default("Hộp quà tặng mới"),
  dimensions: BoxDimensionsSchema.default({
    length: 120,
    width: 80,
    height: 60,
    paperThickness: 0.35
  }),
  materialSpec: MaterialSpecSchema.default({
    type: "kraft",
    gsm: 300,
    caliper: 0.42,
    finish: "matte"
  }),
  canvasState: CanvasStateSchema.default({ elements: [] }),
  thumbnailUrl: z.string().optional()
});

export const UpdateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  templateId: z.string().optional(),
  dimensions: BoxDimensionsSchema.optional(),
  materialSpec: MaterialSpecSchema.optional(),
  canvasState: CanvasStateSchema.optional(),
  thumbnailUrl: z.string().optional(),
  fitcheckState: z.record(z.any()).optional()
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
