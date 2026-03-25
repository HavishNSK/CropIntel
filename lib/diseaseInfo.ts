// Disease information and treatment recommendations

export interface DiseaseInfo {
  name: string
  description: string
  symptoms: string[]
  treatment: string[]
  prevention: string[]
  severity: 'low' | 'medium' | 'high'
  affectedCrops: string[]
}

export const DISEASE_INFO: Record<string, DiseaseInfo> = {
  // Corn Diseases
  'Blight': {
    name: 'Corn Blight',
    description: 'A fungal disease that causes leaf spots and can reduce yield significantly.',
    symptoms: ['Brown or tan spots on leaves', 'Lesions with yellow halos', 'Premature leaf death'],
    treatment: [
      'Apply fungicides containing azoxystrobin or propiconazole',
      'Remove and destroy infected plant debris',
      'Rotate crops to break disease cycle'
    ],
    prevention: [
      'Plant resistant varieties',
      'Ensure proper spacing for air circulation',
      'Avoid overhead irrigation',
      'Practice crop rotation'
    ],
    severity: 'high',
    affectedCrops: ['corn']
  },
  'Common Rust': {
    name: 'Common Rust',
    description: 'A fungal disease characterized by reddish-brown pustules on leaves.',
    symptoms: ['Reddish-brown pustules on upper leaf surface', 'Yellowing around pustules', 'Premature leaf drop'],
    treatment: [
      'Apply fungicides early in the season',
      'Use resistant hybrid varieties',
      'Remove infected plant material'
    ],
    prevention: [
      'Plant rust-resistant varieties',
      'Avoid late planting',
      'Maintain proper plant nutrition'
    ],
    severity: 'medium',
    affectedCrops: ['corn']
  },
  'Gray Leaf Spot': {
    name: 'Gray Leaf Spot',
    description: 'A fungal disease that causes rectangular gray lesions on leaves.',
    symptoms: ['Rectangular gray lesions', 'Lesions with defined edges', 'Leaf blighting'],
    treatment: [
      'Apply fungicides with active ingredients like pyraclostrobin',
      'Remove crop residue after harvest',
      'Use tillage to bury infected residue'
    ],
    prevention: [
      'Plant resistant hybrids',
      'Practice crop rotation',
      'Avoid continuous corn planting'
    ],
    severity: 'high',
    affectedCrops: ['corn']
  },
  
  // Rice Diseases
  'Rice Blast': {
    name: 'Rice Blast',
    description: 'One of the most destructive rice diseases, caused by the fungus Magnaporthe oryzae.',
    symptoms: ['Diamond-shaped lesions on leaves', 'Node and neck rot', 'White to gray centers with brown borders'],
    treatment: [
      'Apply fungicides like tricyclazole or azoxystrobin',
      'Use resistant varieties',
      'Proper water management'
    ],
    prevention: [
      'Plant blast-resistant varieties',
      'Avoid excessive nitrogen fertilization',
      'Maintain proper water levels',
      'Remove infected plant debris'
    ],
    severity: 'high',
    affectedCrops: ['rice']
  },
  'Bacterial Leaf Blight': {
    name: 'Bacterial Leaf Blight',
    description: 'A bacterial disease that causes water-soaked lesions and leaf blight.',
    symptoms: ['Water-soaked lesions', 'Yellowing along leaf margins', 'Wilting and death of leaves'],
    treatment: [
      'Apply copper-based bactericides',
      'Use resistant varieties',
      'Proper field sanitation'
    ],
    prevention: [
      'Use disease-free seeds',
      'Avoid overhead irrigation',
      'Practice crop rotation',
      'Remove infected plants'
    ],
    severity: 'high',
    affectedCrops: ['rice']
  },
  'Brown Spot': {
    name: 'Brown Spot',
    description: 'A fungal disease causing brown spots on leaves and grains.',
    symptoms: ['Small brown spots on leaves', 'Spots enlarge and coalesce', 'Grain discoloration'],
    treatment: [
      'Apply fungicides containing propiconazole',
      'Improve soil fertility',
      'Use resistant varieties'
    ],
    prevention: [
      'Maintain proper soil nutrition',
      'Use certified seeds',
      'Practice good field hygiene'
    ],
    severity: 'medium',
    affectedCrops: ['rice']
  },
  
  // Soybean Diseases
  'powdery_mildew': {
    name: 'Powdery Mildew',
    description: 'A fungal disease that appears as white powdery growth on leaves.',
    symptoms: ['White powdery growth on leaves', 'Leaf yellowing', 'Premature defoliation'],
    treatment: [
      'Apply fungicides like tebuconazole or azoxystrobin',
      'Improve air circulation',
      'Remove infected leaves'
    ],
    prevention: [
      'Plant resistant varieties',
      'Ensure proper spacing',
      'Avoid excessive nitrogen',
      'Practice crop rotation'
    ],
    severity: 'medium',
    affectedCrops: ['soybean']
  },
  'bacterial_blight': {
    name: 'Bacterial Blight',
    description: 'A bacterial disease causing angular leaf spots and blight.',
    symptoms: ['Angular water-soaked spots', 'Yellow halos around lesions', 'Leaf drop'],
    treatment: [
      'Apply copper-based bactericides',
      'Use resistant varieties',
      'Remove infected plant debris'
    ],
    prevention: [
      'Use disease-free seeds',
      'Avoid working in wet fields',
      'Practice crop rotation'
    ],
    severity: 'medium',
    affectedCrops: ['soybean']
  },
  'Sudden Death Syndrone': {
    name: 'Sudden Death Syndrome',
    description:
      'A soil-borne fungal disease (Fusarium virguliforme) that causes interveinal chlorosis, necrosis, and early defoliation; often worse in compacted or wet soils.',
    symptoms: [
      'Yellowing between leaf veins',
      'Brown necrotic patches on leaves',
      'Premature leaf drop',
      'Root rot and crown discoloration'
    ],
    treatment: [
      'Improve drainage and reduce soil compaction',
      'Use resistant varieties where available',
      'Fungicide seed treatments may help establishment'
    ],
    prevention: [
      'Rotate crops',
      'Manage soybean cyst nematode',
      'Avoid excessive early-season stress'
    ],
    severity: 'high',
    affectedCrops: ['soybean']
  },
  'Yellow Mosaic': {
    name: 'Yellow Mosaic',
    description:
      'Viral disease (often soybean mosaic virus) spread by aphids, causing mottled yellow and green patterns on leaves.',
    symptoms: ['Mottled light and dark green areas', 'Leaf distortion', 'Stunted growth in severe cases'],
    treatment: [
      'Control aphid vectors where practical',
      'Remove nearby virus reservoirs if identified'
    ],
    prevention: [
      'Use virus-free seed',
      'Plant resistant varieties',
      'Manage weeds that host the virus'
    ],
    severity: 'medium',
    affectedCrops: ['soybean']
  },

  // Wheat Diseases
  'Leaf Rust': {
    name: 'Leaf Rust',
    description: 'A fungal disease causing orange-brown pustules on wheat leaves.',
    symptoms: ['Orange-brown pustules', 'Yellowing around pustules', 'Reduced grain fill'],
    treatment: [
      'Apply fungicides early in the season',
      'Use resistant varieties',
      'Proper timing of applications'
    ],
    prevention: [
      'Plant rust-resistant varieties',
      'Avoid late planting',
      'Maintain proper plant nutrition'
    ],
    severity: 'high',
    affectedCrops: ['wheat']
  },
  'Stem Rust': {
    name: 'Stem Rust',
    description: 'A serious fungal disease affecting wheat stems and leaves.',
    symptoms: ['Reddish-brown pustules on stems', 'Stem breakage', 'Severe yield loss'],
    treatment: [
      'Apply fungicides preventively',
      'Use resistant varieties',
      'Early detection and treatment'
    ],
    prevention: [
      'Plant stem rust-resistant varieties',
      'Monitor fields regularly',
      'Practice crop rotation'
    ],
    severity: 'high',
    affectedCrops: ['wheat']
  },
  'Powdery Mildew': {
    name: 'Powdery Mildew',
    description: 'A fungal disease causing white powdery growth on wheat leaves.',
    symptoms: ['White powdery patches', 'Leaf yellowing', 'Reduced photosynthesis'],
    treatment: [
      'Apply fungicides containing tebuconazole',
      'Improve air circulation',
      'Use resistant varieties'
    ],
    prevention: [
      'Plant resistant varieties',
      'Avoid dense planting',
      'Proper nitrogen management'
    ],
    severity: 'medium',
    affectedCrops: ['wheat']
  },
  'Stripe (Yellow) Rust': {
    name: 'Stripe (Yellow) Rust',
    description: 'A fungal disease causing yellow-orange stripes on wheat leaves, also known as yellow rust.',
    symptoms: ['Yellow-orange stripes on leaves', 'Pustules arranged in lines', 'Premature leaf death', 'Reduced grain quality'],
    treatment: [
      'Apply fungicides like propiconazole or tebuconazole',
      'Use resistant varieties',
      'Early season treatment is most effective'
    ],
    prevention: [
      'Plant stripe rust-resistant varieties',
      'Avoid early planting in high-risk areas',
      'Monitor fields regularly during cool, wet conditions',
      'Practice crop rotation'
    ],
    severity: 'high',
    affectedCrops: ['wheat']
  },
  
  // Healthy
  'Healthy': {
    name: 'Healthy',
    description: 'No disease detected. The plant appears to be in good health.',
    symptoms: [],
    treatment: [],
    prevention: [
      'Continue monitoring regularly',
      'Maintain proper plant nutrition',
      'Practice good field hygiene',
      'Use preventive measures'
    ],
    severity: 'low',
    affectedCrops: ['corn', 'rice', 'soybean', 'wheat']
  }
}

export function getDiseaseInfo(diseaseName: string, crop: string): DiseaseInfo | null {
  // Try exact match first
  if (DISEASE_INFO[diseaseName]) {
    const info = DISEASE_INFO[diseaseName]
    if (info.affectedCrops.includes(crop) || info.affectedCrops.length === 0) {
      return info
    }
  }
  
  // Try case-insensitive match
  const lowerName = diseaseName.toLowerCase()
  for (const [key, info] of Object.entries(DISEASE_INFO)) {
    if (key.toLowerCase() === lowerName || info.name.toLowerCase() === lowerName) {
      if (info.affectedCrops.includes(crop) || info.affectedCrops.length === 0) {
        return info
      }
    }
  }
  
  // Return generic info if not found
  return {
    name: diseaseName,
    description: `Information about ${diseaseName} for ${crop}.`,
    symptoms: ['Consult agricultural extension services for specific symptoms'],
    treatment: ['Consult with agricultural experts for treatment recommendations'],
    prevention: ['Practice good field hygiene', 'Monitor regularly', 'Use resistant varieties when available'],
    severity: 'medium',
    affectedCrops: [crop]
  }
}
