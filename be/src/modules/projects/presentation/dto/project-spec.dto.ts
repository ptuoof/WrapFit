// Request DTOs for the JSON columns of a project. They implement the contracts of `@wrapfit/shared`,
// so a change in the shared types breaks this file at compile time instead of silently in production.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  CanvasElement,
  CanvasElementType,
  MaterialSpecification,
  MaterialType,
} from '@wrapfit/shared';
import type { CanvasState } from '../../domain/project.types';

// `satisfies Record<Union, true>` makes the compiler fail when IT2 adds a value to the shared union.
const MATERIAL_TYPES = Object.keys({ ivory: true, kraft: true, duplex: true } satisfies Record<MaterialType, true>);
const MATERIAL_FINISHES = Object.keys({ matte: true, glossy: true, raw: true } satisfies Record<
  MaterialSpecification['finish'],
  true
>);
const ELEMENT_TYPES = Object.keys({ text: true, logo: true, image: true, pattern: true, barcode: true } satisfies Record<
  CanvasElementType,
  true
>);

export const MAX_CANVAS_ELEMENTS = 300;

/** Static bounds only; the exact range per box type comes from the template (`formula_schema.params`). */
export class BoxDimensionsDto {
  @ApiProperty({ description: 'Length L (mm)', example: 120 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  @Max(2000)
  length: number;

  @ApiProperty({ description: 'Width W (mm)', example: 80 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  @Max(2000)
  width: number;

  @ApiProperty({ description: 'Height H (mm)', example: 60 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  @Max(2000)
  height: number;

  @ApiPropertyOptional({ description: 'Paper thickness t (mm). Defaults to materialSpec.caliper', example: 0.35 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.05)
  @Max(5)
  paperThickness?: number;
}

export class MaterialSpecDto implements MaterialSpecification {
  @ApiProperty({ enum: MATERIAL_TYPES, example: 'kraft' })
  @IsIn(MATERIAL_TYPES)
  type: MaterialType;

  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(100)
  @Max(1000)
  gsm: number;

  @ApiProperty({ description: 'Thickness (mm)', example: 0.4 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.05)
  @Max(5)
  caliper: number;

  @ApiProperty({ enum: MATERIAL_FINISHES, example: 'matte' })
  @IsIn(MATERIAL_FINISHES)
  finish: MaterialSpecification['finish'];
}

export class CanvasElementStyleDto implements NonNullable<CanvasElement['style']> {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fontFamily?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  fontSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fillColor?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  opacity?: number;
}

export class CanvasElementDto implements CanvasElement {
  @IsString()
  @MaxLength(64)
  id: string;

  @IsIn(ELEMENT_TYPES)
  type: CanvasElementType;

  @IsString()
  @MaxLength(64)
  panelId: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  x: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  y: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  width: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  height: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  rotation: number;

  /** Text, or the URL of an uploaded image. Images must be uploaded to storage, not inlined as data URLs. */
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CanvasElementStyleDto)
  style?: CanvasElementStyleDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2400)
  dpi?: number;
}

export class CanvasStateDto implements CanvasState {
  @ApiProperty({ type: [Object], description: 'CanvasElement[] from @wrapfit/shared', example: [] })
  @IsArray()
  @ArrayMaxSize(MAX_CANVAS_ELEMENTS)
  @ValidateNested({ each: true })
  @Type(() => CanvasElementDto)
  elements: CanvasElementDto[];
}
