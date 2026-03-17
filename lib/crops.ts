export const CROPS = {
  corn: 'Corn',
  soybean: 'Soybean',
  wheat: 'Wheat',
  rice: 'Rice',
} as const

export type CropType = keyof typeof CROPS
